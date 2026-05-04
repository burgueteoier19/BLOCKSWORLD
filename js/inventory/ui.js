import * as THREE from 'three';
import { 
  hotbar, invGrid, craftGrid, heldItem, inventoryOpen, activeHotbarSlot,
  setInventoryOpen, setHeldItem, HOTBAR_SIZE, INV_SIZE
} from '../core/state.js';
import { BLOCK_TYPES } from '../core/game.js';
import { renderHotbar, giveItem, registerApplyIcon } from './inventory.js';
import { matchRecipe, takeCraftResult, clearCraftGrid, getCurrentRecipeInfo } from './crafting.js';

// Cache de iconos
const iconCache = {};

// Generar icono 2D para un tipo de item
function drawItemIcon(type) {
  if (iconCache[type]) return iconCache[type];
  const S = 32;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d');
  
  function pxn(x, y, seed) {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.3) * 43758.5453;
    return n - Math.floor(n);
  }
  function noisy(x, y, w, h, baseHex, variance, seed) {
    const br = (baseHex >> 16) & 0xff, bg = (baseHex >> 8) & 0xff, bb = baseHex & 0xff;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const v = (pxn(x + dx, y + dy, seed) - 0.5) * variance;
        ctx.fillStyle = `rgb(${(br + v) | 0}, ${(bg + v) | 0}, ${(bb + v) | 0})`;
        ctx.fillRect((x + dx) * 2, (y + dy) * 2, 2, 2);
      }
    }
  }
  function rect(x1, y1, x2, y2, col) {
    if (typeof col === 'number') col = '#' + col.toString(16).padStart(6, '0');
    ctx.fillStyle = col;
    ctx.fillRect(x1 * 2, y1 * 2, (x2 - x1 + 1) * 2, (y2 - y1 + 1) * 2);
  }

  const toolColors = {
    wood: [0xC8A96E, 0xA07840, 0x8B5E2A],
    stone: [0xAAAAAA, 0x888888, 0x606060],
    iron: [0xE0D0C0, 0xC0A888, 0x906848],
    gold: [0xFFE040, 0xFFCC00, 0xCC9900],
    diamond: [0x60EEFF, 0x00CFCF, 0x007A8A],
  };
  function getMat(name) {
    for (const k of Object.keys(toolColors)) if (name.startsWith(k)) return toolColors[k];
    return toolColors.stone;
  }

  // Dibujo simplificado (similar al original)
  if (type.endsWith('_pick')) {
    const [c1, c2, c3] = getMat(type);
    noisy(7, 5, 2, 11, 0xA0784A, 30, type.length + 10);
    rect(1, 1, 13, 3, c2);
    rect(1, 1, 3, 6, c2);
    rect(11, 1, 13, 6, c2);
    rect(5, 1, 9, 4, c1);
    ctx.fillStyle = '#' + c3.toString(16).padStart(6, '0');
    ctx.fillRect(0, 4, 4, 4);
    ctx.fillRect(22, 4, 4, 4);
  } else if (type.endsWith('_axe')) {
    const [c1, c2, c3] = getMat(type);
    noisy(7, 5, 2, 11, 0xA0784A, 30, type.length + 20);
    rect(2, 1, 9, 8, c2);
    rect(2, 1, 5, 5, c1);
    rect(6, 5, 9, 8, c1);
    ctx.fillStyle = '#' + c3.toString(16).padStart(6, '0');
    ctx.fillRect(2, 2, 2, 8);
  } else if (type.endsWith('_sword')) {
    const [c1, c2, c3] = getMat(type);
    for (let i = 0; i < 7; i++) {
      const shade = i === 0 ? c3 : i < 5 ? c2 : c1;
      ctx.fillStyle = '#' + shade.toString(16).padStart(6, '0');
      ctx.fillRect((9 - i) * 2, i * 2, 4, 4);
    }
    rect(3, 7, 12, 8, 0x888888);
    noisy(7, 9, 2, 5, 0xA0784A, 30, type.length + 30);
  } else if (type === 'stick') {
    noisy(7, 1, 2, 14, 0xA0784A, 40, 99);
    noisy(6, 7, 4, 3, 0x7B4E1A, 20, 100);
  } else {
    // fallback: bloque genérico
    const bc = BLOCK_TYPES[type] ? BLOCK_TYPES[type].color : 0x888888;
    noisy(0, 0, 16, 16, bc, 35, type.charCodeAt(0) || 1);
  }
  const url = c.toDataURL();
  iconCache[type] = url;
  return url;
}

function applyIcon(element, type) {
  if (!type) {
    element.style.backgroundImage = 'none';
    element.style.backgroundColor = 'transparent';
    return;
  }
  element.style.backgroundImage = `url(${drawItemIcon(type)})`;
  element.style.backgroundSize = 'contain';
  element.style.backgroundRepeat = 'no-repeat';
  element.style.backgroundPosition = 'center';
  element.style.backgroundColor = 'transparent';
  element.style.imageRendering = 'pixelated';
}

// Registrar callback en inventory.js
registerApplyIcon(applyIcon);

// Cursor para item agarrado
const heldCursor = document.createElement('div');
heldCursor.className = 'held-cursor';
document.body.appendChild(heldCursor);

function updateHeldCursor() {
  if (heldItem) {
    heldCursor.style.display = 'block';
    applyIcon(heldCursor, heldItem.type);
  } else {
    heldCursor.style.display = 'none';
  }
}

// Mover items entre slots
function handleInvClick(prefix, i) {
  const arr = prefix === 'ih' ? hotbar : invGrid;
  const slot = arr[i];
  if (!heldItem) {
    if (slot.type) {
      setHeldItem({ type: slot.type, count: slot.count });
      slot.type = null;
      slot.count = 0;
    }
  } else {
    if (!slot.type) {
      slot.type = heldItem.type;
      slot.count = heldItem.count;
      setHeldItem(null);
    } else if (slot.type === heldItem.type) {
      const total = slot.count + heldItem.count;
      slot.count = Math.min(total, 64);
      const left = total - slot.count;
      setHeldItem(left > 0 ? { type: heldItem.type, count: left } : null);
    } else {
      const tmp = { type: slot.type, count: slot.count };
      slot.type = heldItem.type;
      slot.count = heldItem.count;
      setHeldItem(tmp);
    }
  }
  renderInventoryUI();
  renderHotbar();
  updateHeldCursor();
}

// Renderizar inventario completo
export function renderInventoryUI() {
  for (let i = 0; i < INV_SIZE; i++) {
    const s = invGrid[i];
    const iconEl = document.getElementById(`ig-i-${i}`);
    const cntEl = document.getElementById(`ig-c-${i}`);
    if (iconEl) applyIcon(iconEl, s.type);
    if (cntEl) cntEl.textContent = (s.type && s.count > 1) ? s.count : '';
  }
  for (let i = 0; i < HOTBAR_SIZE; i++) {
    const s = hotbar[i];
    const iconEl = document.getElementById(`ih-i-${i}`);
    const cntEl = document.getElementById(`ih-c-${i}`);
    if (iconEl) applyIcon(iconEl, s.type);
    if (cntEl) cntEl.textContent = (s.type && s.count > 1) ? s.count : '';
    const slotEl = document.getElementById(`ih-${i}`);
    if (slotEl) slotEl.style.borderColor = i === activeHotbarSlot ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.15)';
  }
  renderCraftGrid();
}

// Crafteo: renderizar cuadrícula
export function renderCraftGrid() {
  const recipeInfo = getCurrentRecipeInfo();
  for (let i = 0; i < 9; i++) {
    const s = craftGrid[i];
    const iconEl = document.getElementById(`cg-i-${i}`);
    const cntEl = document.getElementById(`cg-c-${i}`);
    if (iconEl) applyIcon(iconEl, s.type);
    if (cntEl) cntEl.textContent = (s.type && s.count > 1) ? s.count : '';
  }
  const resIcon = document.getElementById('craft-result-icon');
  const resCnt = document.getElementById('craft-result-cnt');
  const resName = document.getElementById('craft-result-name');
  const resSlot = document.getElementById('craft-result');
  if (recipeInfo) {
    applyIcon(resIcon, recipeInfo.result);
    resCnt.textContent = recipeInfo.count > 1 ? recipeInfo.count : '';
    resName.textContent = recipeInfo.name;
    if (resSlot) resSlot.style.borderColor = 'rgba(100,255,100,0.5)';
  } else {
    if (resIcon) applyIcon(resIcon, null);
    if (resCnt) resCnt.textContent = '';
    if (resName) resName.textContent = '';
    if (resSlot) resSlot.style.borderColor = 'rgba(255,255,255,0.15)';
  }
}

function handleCraftGridClick(i) {
  const slot = craftGrid[i];
  if (!heldItem) {
    if (slot.type) {
      setHeldItem({ type: slot.type, count: slot.count });
      craftGrid[i] = { type: null, count: 0 };
    }
  } else {
    if (BLOCK_TYPES[heldItem.type] && !BLOCK_TYPES[heldItem.type].isTool) {
      if (!slot.type) {
        craftGrid[i] = { type: heldItem.type, count: heldItem.count };
        setHeldItem(null);
      } else if (slot.type === heldItem.type) {
        const total = slot.count + heldItem.count;
        craftGrid[i].count = Math.min(total, 64);
        const left = total - craftGrid[i].count;
        setHeldItem(left > 0 ? { type: heldItem.type, count: left } : null);
      } else {
        const tmp = { type: slot.type, count: slot.count };
        craftGrid[i] = { type: heldItem.type, count: heldItem.count };
        setHeldItem(tmp);
      }
    }
  }
  updateHeldCursor();
  renderCraftGrid();
  renderInventoryUI();
  renderHotbar();
}

function onTakeCraftResult() {
  if (takeCraftResult()) {
    renderCraftGrid();
    renderInventoryUI();
    renderHotbar();
  }
}

function onClearCraftGrid() {
  clearCraftGrid(giveItem);
  renderCraftGrid();
  renderInventoryUI();
  renderHotbar();
}

// Crear slots de inventario dinámicamente
function createSlot(prefix, i, tooltip) {
  const slot = document.createElement('div');
  slot.className = 'inv-slot';
  slot.id = `${prefix}-${i}`;
  const icon = document.createElement('div');
  icon.id = `${prefix}-i-${i}`;
  const cnt = document.createElement('span');
  cnt.id = `${prefix}-c-${i}`;
  slot.appendChild(icon);
  slot.appendChild(cnt);
  slot.addEventListener('mouseenter', (e) => {
    slot.style.borderColor = 'rgba(255,255,255,0.55)';
    const arr = prefix === 'ih' ? hotbar : invGrid;
    const s = arr[i];
    if (s.type) {
      tooltip.textContent = `${BLOCK_TYPES[s.type].name} x${s.count}`;
      tooltip.style.display = 'block';
      tooltip.style.left = (e.clientX + 12) + 'px';
      tooltip.style.top = (e.clientY - 8) + 'px';
    }
  });
  slot.addEventListener('mousemove', (e) => {
    tooltip.style.left = (e.clientX + 12) + 'px';
    tooltip.style.top = (e.clientY - 8) + 'px';
  });
  slot.addEventListener('mouseleave', () => {
    slot.style.borderColor = 'rgba(255,255,255,0.15)';
    tooltip.style.display = 'none';
  });
  slot.addEventListener('click', () => handleInvClick(prefix, i));
  return slot;
}

// Construir toda la UI de inventario
export function initInventoryUI() {
  const overlay = document.createElement('div');
  overlay.id = 'inv-overlay';
  const panel = document.createElement('div');
  const tooltip = document.createElement('div');
  tooltip.id = 'inv-tooltip';
  document.body.appendChild(tooltip);

  const title = document.createElement('div');
  title.textContent = 'INVENTARIO';
  title.style.cssText = 'font-size:15px;letter-spacing:4px;color:#bbb;text-align:center;margin-bottom:16px;';
  panel.appendChild(title);

  const invLabel = document.createElement('div');
  invLabel.textContent = 'MOCHILA';
  invLabel.style.cssText = 'font-size:10px;color:#666;margin-bottom:5px;';
  panel.appendChild(invLabel);

  const invGridDiv = document.createElement('div');
  invGridDiv.style.cssText = 'display:grid;grid-template-columns:repeat(9,50px);gap:3px;margin-bottom:10px;';
  for (let i = 0; i < INV_SIZE; i++) {
    invGridDiv.appendChild(createSlot('ig', i, tooltip));
  }
  panel.appendChild(invGridDiv);

  const sep = document.createElement('div');
  sep.style.cssText = 'border-top:1px solid #383838;margin:8px 0;';
  panel.appendChild(sep);

  const hotbarLabel = document.createElement('div');
  hotbarLabel.textContent = 'BARRA RAPIDA';
  hotbarLabel.style.cssText = 'font-size:10px;color:#666;margin-bottom:5px;';
  panel.appendChild(hotbarLabel);

  const hotbarDiv = document.createElement('div');
  hotbarDiv.style.cssText = 'display:grid;grid-template-columns:repeat(9,50px);gap:3px;margin-bottom:14px;';
  for (let i = 0; i < HOTBAR_SIZE; i++) {
    hotbarDiv.appendChild(createSlot('ih', i, tooltip));
  }
  panel.appendChild(hotbarDiv);

  // Crafting area
  const craftSep = document.createElement('div');
  craftSep.style.cssText = 'border-top:1px solid #383838;margin:12px 0 8px;';
  panel.appendChild(craftSep);

  const craftLabel = document.createElement('div');
  craftLabel.textContent = 'CRAFTEO';
  craftLabel.style.cssText = 'font-size:10px;color:#666;margin-bottom:8px;';
  panel.appendChild(craftLabel);

  const craftArea = document.createElement('div');
  craftArea.style.cssText = 'display:flex;align-items:center;gap:14px;';

  const craftGridDiv = document.createElement('div');
  craftGridDiv.style.cssText = 'display:grid;grid-template-columns:repeat(3,46px);gap:3px;';
  for (let i = 0; i < 9; i++) {
    const slot = document.createElement('div');
    slot.className = 'craft-grid-slot';
    slot.id = `cg-${i}`;
    const icon = document.createElement('div');
    icon.id = `cg-i-${i}`;
    const cnt = document.createElement('span');
    cnt.id = `cg-c-${i}`;
    slot.appendChild(icon);
    slot.appendChild(cnt);
    slot.addEventListener('click', () => handleCraftGridClick(i));
    craftGridDiv.appendChild(slot);
  }
  craftArea.appendChild(craftGridDiv);

  const arrow = document.createElement('div');
  arrow.textContent = '▶';
  arrow.style.cssText = 'font-size:22px;color:#888;';
  craftArea.appendChild(arrow);

  const resultWrap = document.createElement('div');
  resultWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;';
  const resultSlot = document.createElement('div');
  resultSlot.id = 'craft-result';
  resultSlot.className = 'craft-result-slot';
  const resIcon = document.createElement('div');
  resIcon.id = 'craft-result-icon';
  const resCntSpan = document.createElement('span');
  resCntSpan.id = 'craft-result-cnt';
  const resNameSpan = document.createElement('div');
  resNameSpan.id = 'craft-result-name';
  resultSlot.appendChild(resIcon);
  resultSlot.appendChild(resCntSpan);
  resultWrap.appendChild(resultSlot);
  resultWrap.appendChild(resNameSpan);
  resultSlot.addEventListener('click', onTakeCraftResult);
  craftArea.appendChild(resultWrap);
  panel.appendChild(craftArea);

  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Limpiar mesa';
  clearBtn.style.cssText = 'margin-top:8px;background:rgba(255,80,80,0.15);border:1px solid rgba(255,80,80,0.3);color:#f88;font-family:"Courier New",monospace;font-size:10px;padding:3px 10px;border-radius:4px;cursor:pointer;';
  clearBtn.addEventListener('click', onClearCraftGrid);
  panel.appendChild(clearBtn);

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // Función para abrir/cerrar
  window.openInventory = () => {
    setInventoryOpen(true);
    overlay.style.display = 'flex';
    document.getElementById('overlay').style.display = 'none';
    renderInventoryUI();
    renderCraftGrid();
    updateHeldCursor();
  };
  window.closeInventory = () => {
    setInventoryOpen(false);
    setHeldItem(null);
    heldCursor.style.display = 'none';
    overlay.style.display = 'none';
    const tooltipEl = document.getElementById('inv-tooltip');
    if (tooltipEl) tooltipEl.style.display = 'none';
    //if (controls && controls.lock) controls.lock();
    renderHotbar();
  };
}

// Exportar funciones de apertura/cierre (serán llamadas desde main)
export function openInventory() {
  if (window.openInventory) window.openInventory();
}
export function closeInventory() {
  if (window.closeInventory) window.closeInventory();
}