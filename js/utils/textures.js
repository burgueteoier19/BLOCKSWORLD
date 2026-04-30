import * as THREE from 'three';

// Función para generar texturas pixel art
export function makeTexture(drawFn) {
  const S = 16;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d');
  drawFn(ctx, S);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

export function noise(x, y, seed) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.3) * 43758.5453;
  return (n - Math.floor(n));
}

export function hexToRgb(hex) {
  return [(hex>>16)&0xff, (hex>>8)&0xff, hex&0xff];
}

export function rgbStr(r,g,b) { return `rgb(${r|0},${g|0},${b|0})`; }

export function drawNoisy(ctx, S, baseHex, variance, seed) {
  const [br, bg, bb] = hexToRgb(baseHex);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const n = noise(x, y, seed);
      const v = (n - 0.5) * variance;
      ctx.fillStyle = rgbStr(br + v, bg + v, bb + v);
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

export function drawGrid(ctx, S, lineColor, cols, rows) {
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1;
  for (let i = 1; i < cols; i++) {
    ctx.beginPath();
    ctx.moveTo((S / cols) * i, 0);
    ctx.lineTo((S / cols) * i, S);
    ctx.stroke();
  }
  for (let i = 1; i < rows; i++) {
    ctx.beginPath();
    ctx.moveTo(0, (S / rows) * i);
    ctx.lineTo(S, (S / rows) * i);
    ctx.stroke();
  }
}