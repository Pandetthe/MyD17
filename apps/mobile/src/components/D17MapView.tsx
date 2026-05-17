import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import WebView from "react-native-webview";

type RoomCoords = Record<string, { x: number; y: number }>;

type Props = {
  glbBase64: string;
  textureBase64: string;
  searchTargetX?: number;
  searchTargetZ?: number;
  bgColor?: string;
  roomCoords?: RoomCoords;
  searchKey?: string;
  onLoad?: () => void;
  onRoomPress?: (key: string) => void;
};

function buildHtml(glbBase64: string, textureBase64: string, roomCoords: RoomCoords): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:100%;height:100%;overflow:hidden;background:transparent}
  canvas{display:block;width:100%;height:100%;outline:none;user-select:none;-webkit-user-select:none;}
</style>
</head>
<body>
<script type="importmap">
{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/"}}
</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const FOV = 55, NEAR = 0.1, FAR = 300;
const ZOOM_MIN = 0.3, ZOOM_SENS = 0.005, ROT_SENS = 0.005;
const FOV_RAD = FOV * Math.PI / 180;
const INIT_PHI   = Math.PI / 4;
const INIT_THETA = -Math.PI / 4;
const HIDE_DIST = 1.0;

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', alpha: true });
renderer.setClearColor(0x000000, 0); 
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const hemi = new THREE.HemisphereLight(0xddeeff, 0xfff0cc, 1.2);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff8f0, 2.2);
sun.position.set(4, 10, 6);
scene.add(sun);

const fill = new THREE.DirectionalLight(0x8fb4ff, 0.6);
fill.position.set(-5, 6, -4);
scene.add(fill);

const camera = new THREE.PerspectiveCamera(FOV, innerWidth / innerHeight, NEAR, FAR);

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  dirty = true;
});

const sph = new THREE.Spherical(2, INIT_PHI, INIT_THETA);
const tgt = new THREE.Vector3(0, 0, 0);
let zoomMax = 2;
let modelBounds = null;
let dirty = false;

function markDirty() { dirty = true; }

let anim = null;
const ANIM_MS = 500;

function startAnim(toX, toZ, toTheta, toPhi) {
  anim = {
    fromX: tgt.x, fromZ: tgt.z,
    fromTheta: sph.theta, fromPhi: sph.phi,
    toX, toZ, toTheta, toPhi,
    t0: performance.now(),
  };
  markDirty();
}

(function loop(now) {
  requestAnimationFrame(loop);
  if (anim) {
    const t = Math.min((now - anim.t0) / ANIM_MS, 1);
    const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    tgt.x   = anim.fromX     + (anim.toX     - anim.fromX)     * e;
    tgt.z   = anim.fromZ     + (anim.toZ     - anim.fromZ)     * e;
    sph.theta = anim.fromTheta + (anim.toTheta - anim.fromTheta) * e;
    sph.phi   = anim.fromPhi   + (anim.toPhi   - anim.fromPhi)   * e;
    sph.makeSafe();
    if (t >= 1) anim = null;
    dirty = true;
  }
  if (!dirty) return;
  dirty = false;
  camera.position.setFromSpherical(sph).add(tgt);
  camera.lookAt(tgt);
  updateLabelVisibility();
  renderer.render(scene, camera);
})();

let currentModel = null;

function applyTexture(base64, mime) {
  if (!currentModel) return;
  const img = new Image();
  img.onload = () => {
    const tex = new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    currentModel.traverse(child => {
      if (!child.isMesh) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of mats) {
        if (mat.map && mat.map !== tex) mat.map.dispose();
        if (mat.emissiveMap) { mat.emissiveMap.dispose(); mat.emissiveMap = null; }
        mat.map = tex;
        mat.emissive.set(0.08, 0.08, 0.1);
        mat.roughness = 0.85;
        mat.metalness = 0.0;
        mat.needsUpdate = true;
      }
    });
    markDirty();
  };
  img.src = 'data:' + mime + ';base64,' + base64;
}

function b64ToBuffer(b64) {
  const bin = atob(b64);
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return buf;
}

function loadGlb(glbB64, texB64, texMime) {
  new GLTFLoader().parse(b64ToBuffer(glbB64), '', gltf => {
    if (currentModel) scene.remove(currentModel);
    currentModel = gltf.scene;

    currentModel.updateMatrixWorld(true);
    const box0 = new THREE.Box3().setFromObject(currentModel);
    const maxDim = Math.max(box0.max.x - box0.min.x, box0.max.z - box0.min.z);
    if (maxDim > 0) currentModel.scale.setScalar(1 / maxDim);

    currentModel.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(currentModel);
    const center = new THREE.Vector3();
    box.getCenter(center);
    tgt.copy(center);

    const footprint = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
    const fit = Math.max(footprint / (2 * 0.8 * Math.tan(FOV_RAD / 2)), ZOOM_MIN);
    sph.radius = fit;
    zoomMax = fit;
    sph.phi   = INIT_PHI;
    sph.theta = INIT_THETA;
    sph.makeSafe();
    modelBounds = box.clone();

    scene.add(currentModel);
    applyTexture(texB64, texMime);
    try { createLabels(box.min.y); } catch(e) { console.error('createLabels:', e); }
    markDirty();
    
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'loaded' }));
    }
  }, err => console.error('GLTFLoader:', err));
}

const cv = renderer.domElement;
let numT = 0, lastX = 0, lastY = 0, lastDist = 0, lastMidX = 0, lastMidY = 0;
let initialDist = 0, initialMidX = 0, initialMidY = 0;
let activeGesture = null;

let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
let isTap = false;

function initTouches(touches) {
  numT = touches.length;
  if (touches.length === 1) {
    lastX = touches[0].clientX; lastY = touches[0].clientY;
  } else if (touches.length >= 2) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    lastDist = Math.sqrt(dx*dx + dy*dy);
    lastMidX = (touches[0].clientX + touches[1].clientX) / 2;
    lastMidY = (touches[0].clientY + touches[1].clientY) / 2;
    
    initialDist = lastDist;
    initialMidX = lastMidX;
    initialMidY = lastMidY;
  }
}

cv.addEventListener('touchstart', e => { 
  e.preventDefault(); 
  initTouches(e.touches);
  
  if (e.touches.length === 1) {
    activeGesture = 'rotate';
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = performance.now();
    isTap = true;
  } else if (e.touches.length >= 2) {
    activeGesture = 'detect_2_finger';
    isTap = false;
  }
}, {passive:false});

cv.addEventListener('touchmove', e => {
  e.preventDefault();
  const t = e.touches;
  
  if (isTap && t.length === 1) {
     const dx = t[0].clientX - touchStartX;
     const dy = t[0].clientY - touchStartY;
     if (dx*dx + dy*dy > 900) isTap = false; 
  }

  if (t.length !== numT) { initTouches(t); return; }

  if (t.length === 1) {
    if (activeGesture !== 'rotate') return;
    const dx = t[0].clientX - lastX, dy = t[0].clientY - lastY;
    sph.theta -= dx * ROT_SENS;
    sph.phi = Math.max(0.1, Math.min(Math.PI / 2.05, sph.phi - dy * ROT_SENS));
    sph.makeSafe();
    lastX = t[0].clientX; lastY = t[0].clientY;
  } else if (t.length >= 2) {
    const dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const midX = (t[0].clientX + t[1].clientX) / 2;
    const midY = (t[0].clientY + t[1].clientY) / 2;

    if (activeGesture === 'detect_2_finger') {
      const deltaDist = Math.abs(dist - initialDist);
      const deltaPan = Math.sqrt(Math.pow(midX - initialMidX, 2) + Math.pow(midY - initialMidY, 2));

      if (deltaDist > 10 || deltaPan > 10) {
        if (deltaDist > deltaPan) {
          activeGesture = 'zoom';
        } else {
          activeGesture = 'pan';
        }
      } else {
        lastDist = dist; lastMidX = midX; lastMidY = midY;
        return; 
      }
    }

    if (activeGesture === 'zoom') {
      sph.radius = Math.max(ZOOM_MIN, Math.min(zoomMax,
        sph.radius + (lastDist - dist) * ZOOM_SENS * sph.radius));
    } else if (activeGesture === 'pan') {
      const panDx = midX - lastMidX, panDy = midY - lastMidY;
      const camPos = new THREE.Vector3().setFromSpherical(sph).add(tgt);
      const fwd = new THREE.Vector3().subVectors(tgt, camPos);
      fwd.y = 0;
      if (fwd.lengthSq() < 0.001) fwd.set(0, 0, -1);
      fwd.normalize();
      const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
      const wpp = 2 * sph.radius * Math.tan(FOV_RAD / 2) / innerHeight;
      tgt.addScaledVector(right, -panDx * wpp);
      tgt.addScaledVector(fwd, panDy * wpp);

      if (modelBounds) {
        tgt.x = Math.max(modelBounds.min.x, Math.min(modelBounds.max.x, tgt.x));
        tgt.z = Math.max(modelBounds.min.z, Math.min(modelBounds.max.z, tgt.z));
      }
    }

    lastDist = dist; lastMidX = midX; lastMidY = midY;
  }
  markDirty();
}, {passive:false});

cv.addEventListener('touchend', e => { 
  if (isTap && e.changedTouches.length === 1 && (performance.now() - touchStartTime) < 500) {
    handleTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
  }
  isTap = false;

  if (e.touches.length === 0) activeGesture = null;
  numT = e.touches.length; 
  initTouches(e.touches);
}, {passive:false});

const ROOM_COORDS = ${JSON.stringify(roomCoords)};
const labelData = {};
let selectedKey = null;

const LABEL_H = 0.025; 
const DOT_SCALE = 0.005; 

function makeDotTexture() {
  const cv = document.createElement('canvas');
  cv.width = 16; cv.height = 16;
  const c = cv.getContext('2d');
  c.beginPath();
  c.arc(8, 8, 8, 0, Math.PI * 2);
  c.fillStyle = '#0C1220';
  c.fill();
  return new THREE.CanvasTexture(cv);
}

const globalDotMat = new THREE.SpriteMaterial({ 
  map: makeDotTexture(), 
  transparent: true, 
  alphaTest: 0.1, 
  depthTest: false, 
  depthWrite: false,
  sizeAttenuation: false 
});

function makeLabelTexture(text) {
  const DPR = 3;
  const H = 28, PAD_X = 9, FONT = 'bold 13px system-ui,sans-serif';
  const tmp = document.createElement('canvas').getContext('2d');
  tmp.font = FONT;
  const W = Math.ceil(tmp.measureText(text).width) + PAD_X * 2;
  const R = H / 2;
  const cv = document.createElement('canvas');
  cv.width = W * DPR; cv.height = H * DPR;
  const c = cv.getContext('2d');
  c.scale(DPR, DPR);
  c.beginPath();
  c.moveTo(R, 0); c.lineTo(W - R, 0);
  c.arcTo(W, 0, W, R, R);
  c.arcTo(W, H, W - R, H, R);
  c.lineTo(R, H);
  c.arcTo(0, H, 0, H - R, R);
  c.arcTo(0, 0, R, 0, R);
  c.closePath();
  c.fillStyle = '#0C1220';
  c.fill();
  c.fillStyle = '#ffffff';
  c.font = FONT;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(text, W / 2, H / 2);
  return { tex: new THREE.CanvasTexture(cv), aspect: W / H };
}

function createLabels(floorY) {
  for (const [key, c] of Object.entries(ROOM_COORDS)) {
    const { tex, aspect } = makeLabelTexture(key);
    const textMat = new THREE.SpriteMaterial({ 
      map: tex, 
      transparent: true, 
      alphaTest: 0.1, 
      depthTest: false, 
      depthWrite: false,
      sizeAttenuation: false 
    });
    const position = new THREE.Vector3(0.86 * c.x+0.25, floorY + 0.05, 0.88 * c.y - 0.45);
    
    const sprite = new THREE.Sprite(textMat);
    sprite.renderOrder = 999;
    sprite.scale.set(LABEL_H * aspect, LABEL_H, 1);
    sprite.position.copy(position);
    scene.add(sprite);
    
    labelData[key] = { key, position, textMat, aspect, sprite };
  }
  markDirty();
}

function updateLabelVisibility() {
  const labels = Object.values(labelData);
  if (labels.length === 0) return;

  for (let i = 0; i < labels.length; i++) {
    const l = labels[i];
    const sprite = l.sprite;
    const dist = camera.position.distanceTo(l.position);

    if (l.key === selectedKey || dist < HIDE_DIST) {
      sprite.material = l.textMat;
      sprite.scale.set(LABEL_H * l.aspect, LABEL_H, 1);
    } else {
      sprite.material = globalDotMat;
      sprite.scale.set(DOT_SCALE, DOT_SCALE, 1);
    }
  }
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function handleTap(clientX, clientY) {
  mouse.x = (clientX / innerWidth) * 2 - 1;
  mouse.y = -(clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const labels = Object.values(labelData);
  const hitScales = [];
  const sprites = [];

  for (let i = 0; i < labels.length; i++) {
    const sprite = labels[i].sprite;
    sprites.push(sprite);
    hitScales.push(sprite.scale.clone());
    
    if (sprite.material === globalDotMat) {
       sprite.scale.set(LABEL_H * 3, LABEL_H * 3, 1);
    } else {
       sprite.scale.x *= 1.5; 
       sprite.scale.y *= 1.5;
    }
    sprite.updateMatrixWorld(true);
  }

  const intersects = raycaster.intersectObjects(sprites);

  for (let i = 0; i < labels.length; i++) {
    labels[i].sprite.scale.copy(hitScales[i]);
    labels[i].sprite.updateMatrixWorld(true);
  }

  if (intersects.length > 0) {
    const hitSprite = intersects[0].object;
    const hitLabel = labels.find(l => l.sprite === hitSprite);
    
    if (hitLabel) {
      const c = ROOM_COORDS[hitLabel.key];
      const tx = 0.86 * c.x + 0.25, tz = 0.88 * c.y - 0.45;
      const dx = tx - tgt.x, dz = tz - tgt.z;
      const toTheta = Math.atan2(dx, dz) + Math.PI;
      
      startAnim(tx, tz, toTheta, INIT_PHI);
      selectedKey = hitLabel.key;
      markDirty();
      
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'roomPress', key: hitLabel.key }));
      }
    }
  }
}

window.addEventListener('message', e => {
  const msg = JSON.parse(e.data);
  if (msg.type === 'texture') {
    applyTexture(msg.base64, msg.mime);
  } else if (msg.type === 'search') {
    const tx = 0.86 * msg.x + 0.25, tz = 0.88 * msg.z - 0.45;
    const dx = tx - tgt.x, dz = tz - tgt.z;
    const toTheta = Math.atan2(dx, dz) + Math.PI;
    startAnim(tx, tz, toTheta, INIT_PHI);
    selectedKey = msg.key ?? null;
  } else if (msg.type === 'selectMarker') {
    selectedKey = msg.key ?? null;
    markDirty();
  }
});

loadGlb(${JSON.stringify(glbBase64)}, ${JSON.stringify(textureBase64)}, 'image/webp');
</script>
</body>
</html>`;
}

export default function D17MapView({
  glbBase64,
  textureBase64,
  searchTargetX,
  searchTargetZ,
  roomCoords = {},
  searchKey,
  onLoad,
  onRoomPress,
}: Props) {
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (!textureBase64 || !webViewRef.current) return;
    const msg = JSON.stringify({ type: "texture", base64: textureBase64, mime: "image/webp" });
    webViewRef.current.injectJavaScript(
      `window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(msg)}}));true;`,
    );
  }, [textureBase64]);

  useEffect(() => {
    if (searchTargetX === undefined || searchTargetZ === undefined || !webViewRef.current) return;
    const msg = JSON.stringify({
      type: "search",
      x: searchTargetX,
      z: searchTargetZ,
      key: searchKey ?? null,
    });
    webViewRef.current.injectJavaScript(
      `window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(msg)}}));true;`,
    );
  }, [searchTargetX, searchTargetZ, searchKey]);

  useEffect(() => {
    if (!webViewRef.current) return;
    const msg = JSON.stringify({ type: "selectMarker", key: searchKey ?? null });
    webViewRef.current.injectJavaScript(
      `window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(msg)}}));true;`,
    );
  }, [searchKey]);

  const html = useRef<string | null>(null);
  if (!html.current && glbBase64 && textureBase64) {
    html.current = buildHtml(glbBase64, textureBase64, roomCoords);
  }

  if (!html.current) return null;

  return (
    <View style={[styles.container]}>
      <WebView
        ref={webViewRef}
        style={styles.webview}
        containerStyle={styles.webviewContainer}
        source={{ html: html.current }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        onMessage={(e) => {
          const msg = JSON.parse(e.nativeEvent.data);
          if (msg.type === "loaded") {
            onLoad?.();
          } else if (msg.type === "roomPress") {
            onRoomPress?.(msg.key);
          }
        }}
        onError={(e) => console.error("WebView error:", e.nativeEvent)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  webviewContainer: {
    backgroundColor: "transparent",
  },
});
