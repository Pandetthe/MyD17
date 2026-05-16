import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import WebView from "react-native-webview";

// ── Types ─────────────────────────────────────────────────────────────────────
type RoomCoords = Record<string, { x: number; y: number }>;

interface Props {
  glbBase64: string;
  textureBase64: string;
  searchTargetX?: number;
  searchTargetZ?: number;
  bgColor?: string;
  roomCoords?: RoomCoords;
  searchKey?: string;
}

function buildHtml(glbBase64: string, textureBase64: string, bgColor: string, roomCoords: RoomCoords): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:100%;height:100%;overflow:hidden;background:${bgColor}}
  canvas{display:block;width:100%;height:100%}
</style>
</head>
<body>
<script type="importmap">
{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/"}}
</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ── Config ────────────────────────────────────────────────────────────────────
const FOV = 55, NEAR = 0.1, FAR = 300;
const ZOOM_MIN = 0.3, ZOOM_SENS = 0.005, ROT_SENS = 0.005;
const FOV_RAD = FOV * Math.PI / 180;
const INIT_PHI   = Math.PI / 4;        // 45° vertical
const INIT_THETA = -Math.PI / 4;       // 45° left
const SEARCH_PHI = Math.PI / 4.5;

// ── Scene ─────────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('${bgColor}');

// ── Lighting (GI approximation) ───────────────────────────────────────────────
// Hemisphere: cool sky from above, warm bounce from below
const hemi = new THREE.HemisphereLight(0xddeeff, 0xfff0cc, 1.2);
scene.add(hemi);

// Key light: warm-white from upper-right
const sun = new THREE.DirectionalLight(0xfff8f0, 2.2);
sun.position.set(4, 10, 6);
scene.add(sun);

// Fill light: cool blue from opposite side, softer
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

// ── Camera state ──────────────────────────────────────────────────────────────
const sph = new THREE.Spherical(2, INIT_PHI, INIT_THETA);
const tgt = new THREE.Vector3(0, 0, 0);
let zoomMax = 2;
let modelBounds = null;   // Box3 in world space, set after model loads
let dirty = false;

function markDirty() { dirty = true; }

(function loop() {
  requestAnimationFrame(loop);
  if (!dirty) return;
  dirty = false;
  camera.position.setFromSpherical(sph).add(tgt);
  camera.lookAt(tgt);
  updateLabelVisibility();
  renderer.render(scene, camera);
})();

// ── Model / texture ───────────────────────────────────────────────────────────
let currentModel = null;

function applyTexture(base64, mime) {
  if (!currentModel) return;
  const img = new Image();
  img.onload = () => {
    const tex = new THREE.Texture(img);
    tex.needsUpdate = true;
    currentModel.traverse(child => {
      if (!child.isMesh) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of mats) {
        if (mat.map && mat.map !== tex) mat.map.dispose();
        if (mat.emissiveMap) { mat.emissiveMap.dispose(); mat.emissiveMap = null; }
        mat.map = tex;
        mat.emissive.set(0.08, 0.08, 0.1);  // slight self-emission keeps dark faces readable
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
    createLabels(box.min.y);
    markDirty();
  }, err => console.error('GLTFLoader:', err));
}

// ── Touch controls ────────────────────────────────────────────────────────────
const cv = renderer.domElement;
let numT = 0, lastX = 0, lastY = 0, lastDist = 0, lastMidX = 0, lastMidY = 0;

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
  }
}

cv.addEventListener('touchstart', e => { e.preventDefault(); initTouches(e.touches); }, {passive:false});

cv.addEventListener('touchmove', e => {
  e.preventDefault();
  const t = e.touches;
  if (t.length !== numT) { initTouches(t); return; }

  if (t.length === 1) {
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

    sph.radius = Math.max(ZOOM_MIN, Math.min(zoomMax,
      sph.radius + (lastDist - dist) * ZOOM_SENS * sph.radius));

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

    lastDist = dist; lastMidX = midX; lastMidY = midY;

    if (modelBounds) {
      tgt.x = Math.max(modelBounds.min.x, Math.min(modelBounds.max.x, tgt.x));
      tgt.z = Math.max(modelBounds.min.z, Math.min(modelBounds.max.z, tgt.z));
    }
  }
  markDirty();
}, {passive:false});

cv.addEventListener('touchend', e => { numT = e.touches.length; }, {passive:false});

// ── Room label sprites ────────────────────────────────────────────────────────
const ROOM_COORDS = ${JSON.stringify(roomCoords)};
const labelSprites = {};   // key → THREE.Sprite
let selectedKey = null;
const HIDE_DIST_FACTOR = 0.42;  // fraction of zoomMax beyond which labels vanish
const LABEL_H = 0.032;          // world-unit height of each label

function makeLabelTexture(roomNum) {
  const W = 180, H = 52, R = 10;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  // rounded-rect background
  c.beginPath();
  c.moveTo(R, 0); c.lineTo(W-R, 0);
  c.arcTo(W, 0, W, R, R);
  c.lineTo(W, H-R);
  c.arcTo(W, H, W-R, H, R);
  c.lineTo(R, H);
  c.arcTo(0, H, 0, H-R, R);
  c.lineTo(0, R);
  c.arcTo(0, 0, R, 0, R);
  c.closePath();
  c.fillStyle = 'rgba(12, 18, 32, 0.90)';
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.18)';
  c.lineWidth = 1.5;
  c.stroke();
  // text
  c.fillStyle = '#ffffff';
  c.font = 'bold 27px system-ui,sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(roomNum, W / 2, H / 2);
  return new THREE.CanvasTexture(cv);
}

function createLabels(floorY) {
  for (const [key, c] of Object.entries(ROOM_COORDS)) {
    const roomNum = key.includes('.') ? key.split('.')[1] : key;
    const tex = makeLabelTexture(roomNum);
    const aspect = 180 / 52;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(LABEL_H * aspect, LABEL_H, 1);
    sprite.position.set(c.x, floorY + 0.2, c.y);
    scene.add(sprite);
    labelSprites[key] = sprite;
  }
  markDirty();
}

function updateLabelVisibility() {
  if (Object.keys(labelSprites).length === 0) return;
  const hideDist = zoomMax * HIDE_DIST_FACTOR;
  for (const [key, sprite] of Object.entries(labelSprites)) {
    sprite.visible = key === selectedKey
      ? true
      : camera.position.distanceTo(sprite.position) < hideDist;
  }
}

// ── Messages from React Native ────────────────────────────────────────────────
window.addEventListener('message', e => {
  const msg = JSON.parse(e.data);
  if (msg.type === 'texture') {
    applyTexture(msg.base64, msg.mime);
  } else if (msg.type === 'search') {
    tgt.x = msg.x; tgt.z = msg.z;
    sph.radius = zoomMax * 0.22;
    sph.phi = 0.05;   // nearly straight down
    sph.theta = 0;
    sph.makeSafe();
    selectedKey = msg.key ?? null;
    markDirty();
  } else if (msg.type === 'selectMarker') {
    selectedKey = msg.key ?? null;
    markDirty();
  }
});

// ── Boot ──────────────────────────────────────────────────────────────────────
loadGlb(${JSON.stringify(glbBase64)}, ${JSON.stringify(textureBase64)}, 'image/webp');
</script>
</body>
</html>`;
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function D17MapView({ glbBase64, textureBase64, searchTargetX, searchTargetZ, bgColor = "#151C28", roomCoords = {}, searchKey }: Props) {
  const webViewRef = useRef<WebView>(null);

  // Push texture changes into the running WebView page
  useEffect(() => {
    if (!textureBase64 || !webViewRef.current) return;
    const msg = JSON.stringify({ type: "texture", base64: textureBase64, mime: "image/webp" });
    webViewRef.current.injectJavaScript(`window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(msg)}}));true;`);
  }, [textureBase64]);

  // Push search target + marker selection
  useEffect(() => {
    if (searchTargetX === undefined || searchTargetZ === undefined || !webViewRef.current) return;
    const msg = JSON.stringify({ type: "search", x: searchTargetX, z: searchTargetZ, key: searchKey ?? null });
    webViewRef.current.injectJavaScript(`window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(msg)}}));true;`);
  }, [searchTargetX, searchTargetZ, searchKey]);

  // Reset marker highlight when searchKey is cleared
  useEffect(() => {
    if (searchKey !== undefined || !webViewRef.current) return;
    const msg = JSON.stringify({ type: "selectMarker", key: null });
    webViewRef.current.injectJavaScript(`window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(msg)}}));true;`);
  }, [searchKey]);

  // Only build the HTML once — changes are pushed via injectJavaScript
  const html = useRef<string | null>(null);
  if (!html.current && glbBase64 && textureBase64) {
    html.current = buildHtml(glbBase64, textureBase64, bgColor, roomCoords);
  }

  if (!html.current) return null;

  return (
    <WebView
      ref={webViewRef}
      style={styles.webview}
      source={{ html: html.current }}
      originWhitelist={["*"]}
      javaScriptEnabled
      domStorageEnabled
      scrollEnabled={false}
      bounces={false}
      onError={(e) => console.error("WebView error:", e.nativeEvent)}
    />
  );
}

const styles = StyleSheet.create({
  webview: { flex: 1 },
});
