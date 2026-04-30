import * as THREE from 'three';
import { makeTexture, drawNoisy, drawGrid, noise, hexToRgb, rgbStr } from '../utils/textures.js';

// Geometría compartida
export const blockGeo = new THREE.BoxGeometry(1, 1, 1);

// Texturas individuales
const grassTopTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0x3dbb3d, 40, 1);
  for (let i = 0; i < 6; i++) {
    const nx = noise(i, 0, 10) * S | 0;
    const ny = noise(0, i, 10) * S | 0;
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(nx, ny, 3, 2);
  }
});

const grassSideTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0x8B6914, 30, 2);
  for (let x = 0; x < S; x++) {
    const h = 2 + (noise(x, 99, 3) * 2 | 0);
    for (let y = 0; y < h; y++) {
      const n = noise(x, y, 5);
      const v = (n - 0.5) * 35;
      ctx.fillStyle = rgbStr(0x3d + v, 0xbb + v, 0x3d + v);
      ctx.fillRect(x, y, 1, 1);
    }
  }
});

const dirtTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0x8B6914, 35, 3);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(noise(i,1,7)*S|0, noise(1,i,7)*S|0, 2, 2);
  }
});

const stoneTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0x888888, 25, 4);
  drawGrid(ctx, S, 'rgba(60,60,60,0.3)', 2, 2);
});

const cobbleTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0x777070, 30, 5);
  const pts = [[0,0,7,6],[8,0,8,5],[0,7,6,6],[7,6,9,7],[0,13,8,3],[9,13,7,3]];
  ctx.strokeStyle = 'rgba(40,40,40,0.6)'; ctx.lineWidth = 1;
  for (const [x,y,w,h] of pts) { ctx.strokeRect(x+0.5, y+0.5, w, h); }
});

const bedrockTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0x333333, 20, 6);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(noise(i,2,8)*S|0, noise(2,i,8)*S|0, 3, 3);
  }
});

const sandTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0xE8D87A, 20, 9);
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = 'rgba(180,160,60,0.3)';
    ctx.fillRect(noise(i,3,11)*S|0, noise(3,i,11)*S|0, 2, 1);
  }
});

const gravelTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0x9E9483, 40, 12);
  for (let i = 0; i < 10; i++) {
    const gx = noise(i,0,20)*S|0, gy = noise(0,i,20)*S|0;
    const gs = 1 + (noise(i,i,21)*2|0);
    ctx.fillStyle = 'rgba(80,75,70,0.35)';
    ctx.fillRect(gx, gy, gs, gs);
  }
});

const logSideTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0x6B4423, 25, 13);
  for (let x = 0; x < S; x++) {
    if (noise(x, 50, 14) > 0.75) {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(x, 0, 1, S);
    }
  }
});

const logTopTex = makeTexture((ctx, S) => {
  const cx = S/2, cy = S/2;
  drawNoisy(ctx, S, 0x8B6030, 20, 15);
  ctx.strokeStyle = 'rgba(60,30,10,0.5)'; ctx.lineWidth = 1;
  for (let r = 2; r < S/2; r += 3) {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
  }
});

const leavesTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0x1E7A1E, 45, 16);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = 'rgba(10,80,10,0.4)';
    ctx.fillRect(noise(i,4,17)*S|0, noise(4,i,17)*S|0, 3, 3);
  }
});

const plankTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0xC8A96E, 25, 18);
  ctx.fillStyle = 'rgba(80,50,20,0.25)';
  for (let y = 0; y < S; y += 4) ctx.fillRect(0, y, S, 1);
  drawGrid(ctx, S, 'rgba(80,50,20,0.2)', 2, 4);
});

const glassTex = makeTexture((ctx, S) => {
  ctx.fillStyle = 'rgba(176,216,240,0.5)';
  ctx.fillRect(0, 0, S, S);
  ctx.strokeStyle = 'rgba(150,200,230,0.8)'; ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, S-2, S-2);
  ctx.strokeRect(3, 3, S-6, S-6);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(2, 2, 4, 2);
  ctx.fillRect(2, 2, 2, 4);
});

const coalTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0x888888, 20, 19);
  for (let i = 0; i < 5; i++) {
    const cx = noise(i,5,22)*S|0, cy = noise(5,i,22)*S|0;
    ctx.fillStyle = 'rgba(15,15,15,0.9)';
    ctx.fillRect(cx, cy, 3, 3);
    ctx.fillStyle = 'rgba(40,40,40,0.5)';
    ctx.fillRect(cx-1, cy-1, 5, 5);
  }
});

const ironOreTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0x888888, 20, 30);
  for (let i = 0; i < 6; i++) {
    const ox = noise(i,6,31)*S|0, oy = noise(6,i,31)*S|0;
    ctx.fillStyle = 'rgba(200,120,60,0.95)';
    ctx.fillRect(ox, oy, 3, 2);
    ctx.fillStyle = 'rgba(220,160,100,0.5)';
    ctx.fillRect(ox-1, oy-1, 5, 4);
  }
});

const goldOreTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0x888888, 20, 40);
  for (let i = 0; i < 5; i++) {
    const ox = noise(i,7,41)*S|0, oy = noise(7,i,41)*S|0;
    ctx.fillStyle = 'rgba(255,215,0,0.95)';
    ctx.fillRect(ox, oy, 3, 2);
    ctx.fillStyle = 'rgba(255,235,100,0.4)';
    ctx.fillRect(ox-1, oy-1, 5, 4);
  }
});

const diamondOreTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0x888888, 20, 50);
  for (let i = 0; i < 4; i++) {
    const ox = noise(i,8,51)*S|0, oy = noise(8,i,51)*S|0;
    ctx.fillStyle = 'rgba(0,207,207,0.95)';
    ctx.fillRect(ox, oy, 3, 3);
    ctx.fillStyle = 'rgba(100,240,240,0.4)';
    ctx.fillRect(ox-1, oy-1, 5, 5);
    ctx.fillStyle = 'rgba(220,255,255,0.7)';
    ctx.fillRect(ox+1, oy, 1, 1);
  }
});

const emeraldOreTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0x888888, 20, 60);
  for (let i = 0; i < 3; i++) {
    const ox = noise(i,9,61)*S|0, oy = noise(9,i,61)*S|0;
    ctx.fillStyle = 'rgba(0,176,80,0.95)';
    ctx.fillRect(ox, oy, 3, 3);
    ctx.fillStyle = 'rgba(80,220,100,0.35)';
    ctx.fillRect(ox-1, oy-1, 5, 5);
    ctx.fillStyle = 'rgba(180,255,180,0.6)';
    ctx.fillRect(ox+1, oy, 1, 1);
  }
});

const lapisOreTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0x888888, 20, 70);
  for (let i = 0; i < 7; i++) {
    const ox = noise(i,10,71)*S|0, oy = noise(10,i,71)*S|0;
    ctx.fillStyle = 'rgba(26,62,154,0.95)';
    ctx.fillRect(ox, oy, 2, 2);
    ctx.fillStyle = 'rgba(60,100,200,0.45)';
    ctx.fillRect(ox-1, oy-1, 4, 4);
  }
});

const redstoneOreTex = makeTexture((ctx, S) => {
  drawNoisy(ctx, S, 0x888888, 20, 80);
  for (let i = 0; i < 6; i++) {
    const ox = noise(i,11,81)*S|0, oy = noise(11,i,81)*S|0;
    ctx.fillStyle = 'rgba(200,17,17,0.95)';
    ctx.fillRect(ox, oy, 2, 2);
    ctx.fillStyle = 'rgba(255,80,80,0.4)';
    ctx.fillRect(ox-1, oy-1, 4, 4);
    ctx.fillStyle = 'rgba(255,160,160,0.6)';
    ctx.fillRect(ox, oy, 1, 1);
  }
});

function makeMat(tex, opts = {}) {
  return new THREE.MeshLambertMaterial({ map: tex, ...opts });
}

// Materiales por bloque
export const blockMaterials = {};

// Grass (6 caras distintas)
blockMaterials['grass'] = [
  makeMat(grassSideTex), makeMat(grassSideTex),
  makeMat(grassTopTex),  makeMat(dirtTex),
  makeMat(grassSideTex), makeMat(grassSideTex),
];

// Log
blockMaterials['log'] = [
  makeMat(logSideTex), makeMat(logSideTex),
  makeMat(logTopTex),  makeMat(logTopTex),
  makeMat(logSideTex), makeMat(logSideTex),
];

// Bloques uniformes
const uniformTextures = {
  bedrock: bedrockTex, stone: stoneTex,  cobble: cobbleTex,
  dirt:    dirtTex,    sand:  sandTex,   gravel: gravelTex,
  leaves:  leavesTex,  plank: plankTex,  glass:  glassTex,
  coal:    coalTex,
  iron_ore: ironOreTex, gold_ore: goldOreTex,
  diamond_ore: diamondOreTex, emerald_ore: emeraldOreTex,
  lapis_ore: lapisOreTex, redstone_ore: redstoneOreTex,
};

for (const [type, tex] of Object.entries(uniformTextures)) {
  const opts = {};
  if (type === 'glass')  { opts.transparent = true; opts.opacity = 0.6; opts.depthWrite = false; }
  if (type === 'leaves') { opts.transparent = true; opts.opacity = 0.85; opts.alphaTest = 0.1; }
  blockMaterials[type] = makeMat(tex, opts);
}