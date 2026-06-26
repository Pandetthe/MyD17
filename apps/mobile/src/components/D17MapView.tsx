import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { THREE_BUNDLE } from "@/generated/mapBundle";
import WebView from "react-native-webview";

type RoomCoords = Record<string, { x: number; y: number }>;

export type FloorPayload = {
  glb: string;
  direction: number;
  roomCoords: RoomCoords;
  noneTexture: string;
  selectedKey?: string | null;
};

type Props = {
  glbBase64: string;
  textureBase64: string;
  floorPayload?: FloorPayload | null;
  cameraReset?: number;
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
<script>${THREE_BUNDLE}</script>
<script>
const { GLTFLoader } = THREE;

const FOV = 55, NEAR = 0.1, FAR = 300;
const ZOOM_MIN = 0.3, ZOOM_SENS = 0.005, ROT_SENS = 0.005;
const FOV_RAD = FOV * Math.PI / 180;
const INIT_PHI   = 35 * Math.PI / 180;
const INIT_THETA = 3 * Math.PI / 4 - 10 * Math.PI / 180;
const LABEL_ZOOM_THRESHOLD = 0.55; // show full labels when sph.radius < this
let labelOpacity = 1;
let LABEL_BG = '#1065AF';

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
let transitionGen = 0;
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
    const t = Math.min((now - anim.t0) / (anim.ms ?? ANIM_MS), 1);
    const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    tgt.x   = anim.fromX     + (anim.toX     - anim.fromX)     * e;
    tgt.z   = anim.fromZ     + (anim.toZ     - anim.fromZ)     * e;
    sph.theta = anim.fromTheta + (anim.toTheta - anim.fromTheta) * e;
    sph.phi   = anim.fromPhi   + (anim.toPhi   - anim.fromPhi)   * e;
    if (anim.fromRadius != null) sph.radius = anim.fromRadius + (anim.toRadius - anim.fromRadius) * e;
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
let lastTextureB64 = null;
let lastTextureMime = 'image/webp';

function setModelTransparency(model, opacity) {
  model.traverse(c => {
    if (!c.isMesh) return;
    const mats = Array.isArray(c.material) ? c.material : [c.material];
    for (const m of mats) {
      m.transparent = true;
      m.opacity = opacity;
      m.needsUpdate = true;
    }
  });
}

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

function clearLabels() {
  for (const l of Object.values(labelData)) {
    scene.remove(l.sprite);
    if (l.textMat) l.textMat.dispose();
  }
  const keys = Object.keys(labelData);
  for (const k of keys) delete labelData[k];
  // selectedKey is intentionally NOT cleared here — the caller controls it.
}

function normalizeAndCenter(model) {
  model.updateMatrixWorld(true);
  const box0 = new THREE.Box3().setFromObject(model);
  const maxDim = Math.max(box0.max.x - box0.min.x, box0.max.z - box0.min.z);
  if (maxDim > 0) model.scale.setScalar(1 / maxDim);

  // Translate in XZ so the model is centered at the world origin.
  // This means label coords can be used as world coords directly.
  model.updateMatrixWorld(true);
  const box1 = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();
  box1.getCenter(center);
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(model);
  tgt.set(0, box.getCenter(center).y, 0);

  const footprint = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
  const fit = Math.max(footprint / (2 * 0.8 * Math.tan(FOV_RAD / 2)), ZOOM_MIN);
  sph.radius = fit;
  zoomMax = fit;
  sph.phi   = INIT_PHI;
  sph.theta = INIT_THETA;
  sph.makeSafe();
  modelBounds = box.clone();
  return box;
}

function loadGlb(glbB64, texB64, texMime) {
  new GLTFLoader().parse(b64ToBuffer(glbB64), '', gltf => {
    if (currentModel) scene.remove(currentModel);
    currentModel = gltf.scene;

    const box = normalizeAndCenter(currentModel);
    scene.add(currentModel);
    applyTexture(texB64, texMime);
    lastTextureB64 = texB64;
    lastTextureMime = texMime;
    try { createLabels(box.min.y); } catch(e) { console.error('createLabels:', e); }
    markDirty();

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'loaded' }));
    }
  }, err => console.error('GLTFLoader:', err));
}

// Floor-switch transition: slide old model out, load new, slide in
function transitionToFloor(newGlbB64, direction, newRoomCoords, texB64, texMime) {
  const myGen = ++transitionGen;
  const SLIDE = 0.35;
  const DURATION = 280;

  // Snapshot camera before normalizeAndCenter resets it
  const savedRadius = sph.radius;
  const savedPhi    = sph.phi;
  const savedTheta  = sph.theta;
  const savedTgt    = tgt.clone();
  const savedZoomMax = zoomMax;

  function animateOut(model, onDone) {
    if (!model) { onDone(); return; }
    const startY = model.position.y;
    // Higher floor = current model drops down; lower floor = current model rises up
    const endY = startY - direction * SLIDE;
    setModelTransparency(model, 1);
    const t0 = performance.now();
    function step(now) {
      const t = Math.min((now - t0) / DURATION, 1);
      const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      model.position.y = startY + (endY - startY) * e;
      setModelTransparency(model, 1 - e);
      dirty = true;
      if (t < 1) requestAnimationFrame(step);
      else onDone();
    }
    requestAnimationFrame(step);
  }

  function animateIn(model, onDone) {
    // New model enters from above when going up, from below when going down
    const startY = direction * SLIDE;
    model.position.y = startY;
    setModelTransparency(model, 0);
    const t0 = performance.now();
    function step(now) {
      const t = Math.min((now - t0) / DURATION, 1);
      const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      model.position.y = startY * (1 - e);
      setModelTransparency(model, e);
      dirty = true;
      if (t < 1) requestAnimationFrame(step);
      else {
        model.position.y = 0;
        setModelTransparency(model, 1);
        labelOpacity = 1;
        onDone();
      }
    }
    requestAnimationFrame(step);
  }

  labelOpacity = 0;
  markDirty();
  const outgoing = currentModel;
  animateOut(outgoing, () => {
    if (outgoing) scene.remove(outgoing);
    if (myGen !== transitionGen) return; // superseded — discard

    new GLTFLoader().parse(b64ToBuffer(newGlbB64), '', gltf => {
      if (myGen !== transitionGen) return; // superseded while parsing — discard
      currentModel = gltf.scene;
      const box = normalizeAndCenter(currentModel);
      // Restore camera: preserve zoom ratio and angles, clamp radius to new model's bounds
      const zoomRatio = savedZoomMax > 0 ? savedRadius / savedZoomMax : 1;
      sph.radius = Math.max(ZOOM_MIN, Math.min(zoomMax, zoomRatio * zoomMax));
      sph.phi    = savedPhi;
      sph.theta  = savedTheta;
      sph.makeSafe();
      // Restore pan, clamped to new model bounds
      tgt.set(
        Math.max(modelBounds.min.x, Math.min(modelBounds.max.x, savedTgt.x)),
        tgt.y,
        Math.max(modelBounds.min.z, Math.min(modelBounds.max.z, savedTgt.z))
      );
      scene.add(currentModel);

      clearLabels();
      // Swap in new floor's room coords
      const oldKeys = Object.keys(ROOM_COORDS);
      for (const k of oldKeys) delete ROOM_COORDS[k];
      if (newRoomCoords) {
        for (const [k, v] of Object.entries(newRoomCoords)) {
          ROOM_COORDS[k] = v;
        }
      }
      try { createLabels(box.min.y); } catch(e) { console.error('createLabels:', e); }

      applyTexture(texB64 ?? lastTextureB64, texMime ?? lastTextureMime);
      lastTextureB64 = texB64 ?? lastTextureB64;
      lastTextureMime = texMime ?? lastTextureMime;

      animateIn(currentModel, () => {
        const FADE_MS = 200;
        const t0 = performance.now();
        function fadeLabels(now) {
          const p = Math.min((now - t0) / FADE_MS, 1);
          labelOpacity = p;
          markDirty();
          if (p < 1) requestAnimationFrame(fadeLabels);
          else labelOpacity = 1;
        }
        requestAnimationFrame(fadeLabels);
      });
    }, err => console.error('GLTFLoader transitionToFloor:', err));
  });
}

const cv = renderer.domElement;
let numT = 0, lastX = 0, lastY = 0, lastDist = 0, lastMidX = 0, lastMidY = 0;
let initialDist = 0, initialMidX = 0, initialMidY = 0;
let lastAngle = 0, initialAngle = 0;
let initialT0X = 0, initialT0Y = 0, initialT1X = 0, initialT1Y = 0;
let activeGesture = null;
let holdTimer = null;

let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
let isTap = false;
const DOUBLE_TAP_MS = 200, DOUBLE_TAP_PX = 50;
const ZOOM_DRAG_SENS = 0.005;
let lastTapEndTime = 0, lastTapEndX = 0, lastTapEndY = 0;
let doubleTapStartY = 0, doubleTapStartRadius = 0;
let doubletapActive = false;
let pendingTapTimer = null;

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
    lastAngle = Math.atan2(touches[1].clientY - touches[0].clientY, touches[1].clientX - touches[0].clientX);

    initialDist = lastDist;
    initialMidX = lastMidX;
    initialMidY = lastMidY;
    initialAngle = lastAngle;
    initialT0X = touches[0].clientX; initialT0Y = touches[0].clientY;
    initialT1X = touches[1].clientX; initialT1Y = touches[1].clientY;
  }
}

cv.addEventListener('touchstart', e => {
  e.preventDefault();
  initTouches(e.touches);

  if (e.touches.length === 1) {
    const now = performance.now();
    const tdx = e.touches[0].clientX - lastTapEndX;
    const tdy = e.touches[0].clientY - lastTapEndY;
    if (now - lastTapEndTime < DOUBLE_TAP_MS && tdx*tdx + tdy*tdy < DOUBLE_TAP_PX*DOUBLE_TAP_PX) {
      clearTimeout(pendingTapTimer); pendingTapTimer = null;
      activeGesture = 'doubletap_zoom';
      doubleTapStartY = e.touches[0].clientY;
      doubleTapStartRadius = sph.radius;
      doubletapActive = true;
    } else {
      activeGesture = 'pan';
      holdTimer = setTimeout(() => {
        holdTimer = null;
        if (isTap && numT === 1) { activeGesture = 'rotate'; isTap = false; }
      }, 220);
    }
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = now;
    isTap = true;
  } else if (e.touches.length >= 2) {
    clearTimeout(holdTimer); holdTimer = null;
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
    if (activeGesture === 'pan') {
      const panDx = t[0].clientX - lastX, panDy = t[0].clientY - lastY;
      lastX = t[0].clientX; lastY = t[0].clientY;
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
    } else if (activeGesture === 'rotate') {
      const rawDx = t[0].clientX - lastX, rawDy = t[0].clientY - lastY;
      lastX = t[0].clientX; lastY = t[0].clientY;
      const dx = Math.max(-40, Math.min(40, rawDx));
      const dy = Math.max(-40, Math.min(40, rawDy));
      sph.theta -= dx * ROT_SENS;
      sph.theta = ((sph.theta + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
      sph.phi = Math.max(0.1, Math.min(Math.PI / 3, sph.phi - dy * ROT_SENS));
      sph.makeSafe();
    } else if (activeGesture === 'doubletap_zoom') {
      const dy = t[0].clientY - doubleTapStartY;
      sph.radius = Math.max(ZOOM_MIN, Math.min(zoomMax, doubleTapStartRadius * (1 - dy * ZOOM_DRAG_SENS)));
    }
  } else if (t.length >= 2) {
    const dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const midX = (t[0].clientX + t[1].clientX) / 2;
    const midY = (t[0].clientY + t[1].clientY) / 2;
    const angle = Math.atan2(t[1].clientY - t[0].clientY, t[1].clientX - t[0].clientX);

    if (activeGesture === 'detect_2_finger') {
      const dX0 = t[0].clientX - initialT0X, dY0 = t[0].clientY - initialT0Y;
      const dX1 = t[1].clientX - initialT1X, dY1 = t[1].clientY - initialT1Y;

      // Tilt: both fingers moving in the same vertical direction.
      // Check this first — even if one finger lags, their Y signs will agree.
      const bothSameY = dY0 * dY1 > 0 && Math.abs(dY0) > 4 && Math.abs(dY1) > 4;
      if (bothSameY) {
        activeGesture = 'tilt';
      } else {
        const commonY = (dY0 + dY1) / 2;
        const diffX = (dX0 - dX1) / 2, diffY = (dY0 - dY1) / 2;
        const fLen = initialDist || 1;
        const fAxisX = (initialT1X - initialT0X) / fLen;
        const fAxisY = (initialT1Y - initialT0Y) / fLen;
        const rotComponent = Math.abs(-diffX * fAxisY + diffY * fAxisX) * 2;
        const deltaDist = Math.abs(dist - initialDist);
        const tiltComponent = Math.abs(commonY);

        if (deltaDist > 10 || rotComponent > 10 || tiltComponent > 10) {
          const max = Math.max(deltaDist, rotComponent, tiltComponent);
          if (max === deltaDist) activeGesture = 'zoom';
          else if (max === rotComponent) activeGesture = 'spin';
          else activeGesture = 'tilt';
        } else {
          lastDist = dist; lastMidX = midX; lastMidY = midY; lastAngle = angle;
          return;
        }
      }
    }

    if (activeGesture === 'zoom') {
      sph.radius = Math.max(ZOOM_MIN, Math.min(zoomMax,
        sph.radius + (lastDist - dist) * ZOOM_SENS * sph.radius));
    } else if (activeGesture === 'spin') {
      const dAngle = angle - lastAngle;
      sph.theta += dAngle;
      sph.theta = ((sph.theta + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
      sph.makeSafe();
    } else if (activeGesture === 'tilt') {
      sph.phi = Math.max(0.1, Math.min(Math.PI / 3, sph.phi - (midY - lastMidY) * ROT_SENS));
      sph.makeSafe();
    }

    lastDist = dist; lastMidX = midX; lastMidY = midY; lastAngle = angle;
  }
  markDirty();
}, {passive:false});

cv.addEventListener('touchend', e => {
  clearTimeout(holdTimer); holdTimer = null;
  const wasTap = isTap && e.changedTouches.length === 1 && (performance.now() - touchStartTime) < 500;
  if (wasTap) {
    if (activeGesture === 'doubletap_zoom') {
      const snapTarget = Math.max(ZOOM_MIN, Math.min(zoomMax, sph.radius > zoomMax * 0.5 ? zoomMax * 0.35 : zoomMax));
      anim = {
        fromX: tgt.x, fromZ: tgt.z, toX: tgt.x, toZ: tgt.z,
        fromTheta: sph.theta, toTheta: sph.theta,
        fromPhi: sph.phi, toPhi: sph.phi,
        fromRadius: sph.radius, toRadius: snapTarget,
        ms: 180, t0: performance.now(),
      };
      markDirty();
    } else {
      const tapX = e.changedTouches[0].clientX, tapY = e.changedTouches[0].clientY;
      clearTimeout(pendingTapTimer);
      pendingTapTimer = setTimeout(() => { pendingTapTimer = null; handleTap(tapX, tapY); }, DOUBLE_TAP_MS);
    }
  }
  if (activeGesture === 'pan' && wasTap) {
    lastTapEndTime = performance.now();
    lastTapEndX = e.changedTouches[0].clientX;
    lastTapEndY = e.changedTouches[0].clientY;
  }
  if (e.touches.length === 0) doubletapActive = false;
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
  c.fillStyle = LABEL_BG;
  c.fill();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const globalDotMat = new THREE.SpriteMaterial({
  map: makeDotTexture(),
  transparent: true,
  alphaTest: 0.1,
  depthTest: false,
  depthWrite: false,
  sizeAttenuation: false,
  toneMapped: false,
});

function makeLabelTexture(text) {
  const DPR = 3;
  const H = 26, PAD_X = 10, FONT = '600 12px system-ui,sans-serif';
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
  c.fillStyle = LABEL_BG;
  c.fill();
  c.fillStyle = '#ffffff';
  c.font = FONT;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(text, W / 2, H / 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { tex, aspect: W / H };
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
      sizeAttenuation: false,
      toneMapped: false,
    });
    const position = new THREE.Vector3(c.x, floorY + 0.05, c.y);

    const sprite = new THREE.Sprite(textMat);
    sprite.renderOrder = 999;
    sprite.scale.set(LABEL_H * aspect, LABEL_H, 1);
    sprite.position.copy(position);
    scene.add(sprite);

    labelData[key] = { key, position, textMat, aspect, sprite };
  }
  markDirty();
}

function updateLabelColors(newBg) {
  LABEL_BG = newBg;
  for (const data of Object.values(labelData)) {
    const { tex, aspect } = makeLabelTexture(data.key);
    data.textMat.map.dispose();
    data.textMat.map = tex;
    data.aspect = aspect;
    data.textMat.needsUpdate = true;
    data.sprite.scale.set(LABEL_H * aspect, LABEL_H, 1);
  }
  globalDotMat.map.dispose();
  globalDotMat.map = makeDotTexture();
  globalDotMat.needsUpdate = true;
  markDirty();
}

function updateLabelVisibility() {
  const labels = Object.values(labelData);
  if (labels.length === 0) return;

  const zoomedIn = sph.radius < LABEL_ZOOM_THRESHOLD;

  for (let i = 0; i < labels.length; i++) {
    const l = labels[i];
    const sprite = l.sprite;

    if (l.key === selectedKey || zoomedIn) {
      sprite.material = l.textMat;
      sprite.scale.set(LABEL_H * l.aspect, LABEL_H, 1);
    } else {
      sprite.material = globalDotMat;
      sprite.scale.set(DOT_SCALE, DOT_SCALE, 1);
    }
    sprite.material.opacity = labelOpacity;
  }
}

function shortestTheta(target) {
  const TAU = 2 * Math.PI;
  let delta = ((target - sph.theta) % TAU + TAU) % TAU;
  if (delta > Math.PI) delta -= TAU;
  return sph.theta + delta;
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
      const tx = c.x, tz = c.y;
      const dx = tx - tgt.x, dz = tz - tgt.z;
      const toTheta = shortestTheta(Math.atan2(dx, dz) + Math.PI);

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
    lastTextureB64 = msg.base64;
    lastTextureMime = msg.mime;
    applyTexture(msg.base64, msg.mime);
  } else if (msg.type === 'search') {
    const tx = msg.x, tz = msg.z;
    const dx = tx - tgt.x, dz = tz - tgt.z;
    const toTheta = shortestTheta(Math.atan2(dx, dz) + Math.PI);
    startAnim(tx, tz, toTheta, INIT_PHI);
    selectedKey = msg.key ?? null;
  } else if (msg.type === 'selectMarker') {
    selectedKey = msg.key ?? null;
    markDirty();
  } else if (msg.type === 'resetCamera') {
    if (currentModel) {
      const box = new THREE.Box3().setFromObject(currentModel);
      const center = new THREE.Vector3();
      box.getCenter(center);
      anim = {
        fromX: tgt.x, fromZ: tgt.z,
        toX: center.x, toZ: center.z,
        fromTheta: sph.theta, toTheta: shortestTheta(INIT_THETA),
        fromPhi: sph.phi, toPhi: INIT_PHI,
        fromRadius: sph.radius, toRadius: zoomMax,
        ms: 550, t0: performance.now(),
      };
      selectedKey = null;
      markDirty();
    }
  } else if (msg.type === 'loadModel') {
    selectedKey = msg.selectedKey ?? null;
    transitionToFloor(
      msg.base64,
      msg.direction ?? 1,
      msg.roomCoords ?? {},
      msg.textureBase64,
      msg.textureMime ?? 'image/webp'
    );
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
  floorPayload,
  cameraReset,
  searchTargetX,
  searchTargetZ,
  roomCoords = {},
  searchKey,
  onLoad,
  onRoomPress,
}: Props) {
  const webViewRef = useRef<WebView>(null);
  const [loaded, setLoaded] = useState(false);
  const prevFloorPayloadRef = useRef<FloorPayload | null>(null);
  const prevCameraResetRef = useRef(0);

  useEffect(() => {
    if (!textureBase64 || !webViewRef.current || !loaded) return;
    const msg = JSON.stringify({ type: "texture", base64: textureBase64, mime: "image/webp" });
    webViewRef.current.injectJavaScript(
      `window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(msg)}}));true;`,
    );
  }, [textureBase64, loaded]);

  useEffect(() => {
    if (
      searchTargetX === undefined ||
      searchTargetZ === undefined ||
      !webViewRef.current ||
      !loaded
    )
      return;
    const msg = JSON.stringify({
      type: "search",
      x: searchTargetX,
      z: searchTargetZ,
      key: searchKey ?? null,
    });
    webViewRef.current.injectJavaScript(
      `window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(msg)}}));true;`,
    );
  }, [searchTargetX, searchTargetZ, searchKey, loaded]);

  useEffect(() => {
    if (!webViewRef.current || !loaded) return;
    const msg = JSON.stringify({ type: "selectMarker", key: searchKey ?? null });
    webViewRef.current.injectJavaScript(
      `window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(msg)}}));true;`,
    );
  }, [searchKey, loaded]);

  useEffect(() => {
    if (!cameraReset || cameraReset === prevCameraResetRef.current || !webViewRef.current) return;
    prevCameraResetRef.current = cameraReset;
    const msg = JSON.stringify({ type: "resetCamera" });
    webViewRef.current.injectJavaScript(
      `window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(msg)}}));true;`,
    );
  }, [cameraReset]);

  // Inject floor switch when floorPayload changes
  useEffect(() => {
    if (!floorPayload || floorPayload === prevFloorPayloadRef.current || !webViewRef.current)
      return;
    prevFloorPayloadRef.current = floorPayload;
    const msg = JSON.stringify({
      type: "loadModel",
      base64: floorPayload.glb,
      direction: floorPayload.direction,
      roomCoords: floorPayload.roomCoords,
      textureBase64: floorPayload.noneTexture,
      textureMime: "image/webp",
      selectedKey: floorPayload.selectedKey ?? null,
    });
    webViewRef.current.injectJavaScript(
      `window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(msg)}}));true;`,
    );
  }, [floorPayload]);

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
            setLoaded(true);
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
