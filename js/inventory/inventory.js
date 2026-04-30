import { hotbar, invGrid, activeHotbarSlot, HOTBAR_SIZE, INV_SIZE, setActiveHotbarSlot } from '../core/state.js';
import { BLOCK_TYPES } from '../core/game.js';

// Renderizar la hotbar en la interfaz (DOM)
let hotbarElements = {
    slots: [],
    icons: [],
    counts: []
};

// Inicializar referencias a elementos del DOM (se llama desde main.js o ui.js)
export function initHotbarUI() {
    for (let i = 0; i < HOTBAR_SIZE; i++) {
        const slotEl = document.getElementById(`hs-${i}`);
        const iconEl = document.getElementById(`hi-${i}`);
        const cntEl = document.getElementById(`hc-${i}`);
        if (slotEl) hotbarElements.slots[i] = slotEl;
        if (iconEl) hotbarElements.icons[i] = iconEl;
        if (cntEl) hotbarElements.counts[i] = cntEl;
    }
    renderHotbar();
}

export function renderHotbar() {
    for (let i = 0; i < HOTBAR_SIZE; i++) {
        const s = hotbar[i];
        const slotEl = hotbarElements.slots[i];
        const iconEl = hotbarElements.icons[i];
        const cntEl = hotbarElements.counts[i];
        if (!slotEl) continue;
        slotEl.style.border = `2px solid ${i === activeHotbarSlot ? '#fff' : 'rgba(255,255,255,0.2)'}`;
        slotEl.style.transform = i === activeHotbarSlot ? 'scale(1.1)' : 'scale(1)';
        if (iconEl) applyIcon(iconEl, s.type);
        if (cntEl) cntEl.textContent = (s.type && s.count > 1) ? s.count : '';
    }
    const active = hotbar[activeHotbarSlot];
    const nameEl = document.getElementById('block-name');
    if (nameEl) nameEl.textContent = active.type ? BLOCK_TYPES[active.type].name : '(vacio)';
}

// Función auxiliar para aplicar ícono (necesita importar drawItemIcon de ui.js, pero lo definimos más tarde)
// Para evitar dependencia circular, dejamos una función que se asignará desde ui.js.
let applyIconCallback = null;
export function registerApplyIcon(callback) {
    applyIconCallback = callback;
}
function applyIcon(element, type) {
    if (applyIconCallback) applyIconCallback(element, type);
}

export function getActiveBlock() {
    return hotbar[activeHotbarSlot].type;
}

export function giveItem(type, amount) {
    if (!BLOCK_TYPES[type]) return;
    let rem = amount;
    const all = [...hotbar, ...invGrid];
    for (const s of all) {
        if (s.type === type && s.count < 64) {
            const add = Math.min(64 - s.count, rem);
            s.count += add;
            rem -= add;
            if (rem <= 0) { renderHotbar(); return; }
        }
    }
    for (const s of all) {
        if (!s.type) {
            s.type = type;
            s.count = Math.min(rem, 64);
            rem -= s.count;
            if (rem <= 0) { renderHotbar(); return; }
        }
    }
    renderHotbar();
}

export function removeItemFromHotbar(slot, count = 1) {
    const s = hotbar[slot];
    if (!s.type) return false;
    s.count -= count;
    if (s.count <= 0) {
        s.type = null;
        s.count = 0;
    }
    renderHotbar();
    return true;
}

export function setActiveSlot(slot) {
    setActiveHotbarSlot(slot);
    renderHotbar();
}

// Inicializar inventario con items por defecto (para pruebas)
export function initDefaultInventory() {
    const defaultItems = ['grass','dirt','stone','cobble','sand','log','plank','glass','coal','gravel','leaves'];
    for (let i = 0; i < defaultItems.length; i++) {
        if (i < HOTBAR_SIZE) hotbar[i] = { type: defaultItems[i], count: 64 };
        else invGrid[i - HOTBAR_SIZE] = { type: defaultItems[i], count: 64 };
    }
    renderHotbar();
}