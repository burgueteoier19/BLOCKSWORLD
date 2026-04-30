// =====================================================================
// TIPOS DE BLOQUES Y RECETAS
// =====================================================================
export const BLOCK_TYPES = {
  bedrock: { color: 0x333333, name: 'Piedra madre', unbreakable: true  },
  stone:   { color: 0x888888, name: 'Piedra'   },
  cobble:  { color: 0x777070, name: 'Piedra tallada' },
  dirt:    { color: 0x8B6914, name: 'Tierra'   },
  grass:   { color: 0x3dbb3d, name: 'Cesped'   },
  sand:    { color: 0xE8D87A, name: 'Arena'    },
  gravel:  { color: 0x9E9483, name: 'Grava'    },
  log:     { color: 0x6B4423, name: 'Tronco'   },
  leaves:  { color: 0x1E7A1E, name: 'Hojas'    },
  plank:   { color: 0xC8A96E, name: 'Tablon'   },
  glass:   { color: 0xB0D8E8, name: 'Cristal'  },
  coal:      { color: 0x2a2a2a, name: 'Carbon'      },
  iron_ore:  { color: 0xC87840, name: 'Mineral de hierro' },
  gold_ore:  { color: 0xFFD700, name: 'Mineral de oro'    },
  diamond_ore:   { color: 0x00CFCF, name: 'Mineral de diamante' },
  emerald_ore:   { color: 0x00B050, name: 'Mineral de esmeralda' },
  lapis_ore:     { color: 0x1A3E9A, name: 'Mineral de lapislazuli' },
  redstone_ore:  { color: 0xCC1111, name: 'Mineral de redstone' },
  iron_ingot:   { color: 0xD8C8B8, name: 'Lingote de hierro', stackSize: 64 },
  gold_ingot:   { color: 0xFFD700, name: 'Lingote de oro',    stackSize: 64 },
  diamond:      { color: 0x44EEFF, name: 'Diamante',          stackSize: 64 },
  emerald:      { color: 0x00FF55, name: 'Esmeralda',         stackSize: 64 },
  lapis:        { color: 0x3A5FCC, name: 'Lapislazuli',       stackSize: 64 },
  redstone:     { color: 0xFF2222, name: 'Redstone',          stackSize: 64 },
  wood_pick:    { color: 0xC8A96E, name: 'Pico de madera',    isTool: true, stackSize: 1 },
  stone_pick:   { color: 0x888888, name: 'Pico de piedra',    isTool: true, stackSize: 1 },
  iron_pick:    { color: 0xD8C8B8, name: 'Pico de hierro',    isTool: true, stackSize: 1 },
  gold_pick:    { color: 0xFFD700, name: 'Pico de oro',       isTool: true, stackSize: 1 },
  diamond_pick: { color: 0x44EEFF, name: 'Pico de diamante',  isTool: true, stackSize: 1 },
  wood_axe:     { color: 0xC8A96E, name: 'Hacha de madera',   isTool: true, stackSize: 1 },
  stone_axe:    { color: 0x888888, name: 'Hacha de piedra',   isTool: true, stackSize: 1 },
  iron_axe:     { color: 0xD8C8B8, name: 'Hacha de hierro',   isTool: true, stackSize: 1 },
  wood_sword:   { color: 0xC8A96E, name: 'Espada de madera',  isTool: true, stackSize: 1 },
  stone_sword:  { color: 0x888888, name: 'Espada de piedra',  isTool: true, stackSize: 1 },
  iron_sword:   { color: 0xD8C8B8, name: 'Espada de hierro',  isTool: true, stackSize: 1 },
  diamond_sword:{ color: 0x44EEFF, name: 'Espada de diamante',isTool: true, stackSize: 1 },
  stick:        { color: 0xA0784A, name: 'Palo',              stackSize: 64 },
};

export const BLOCK_TOOL = {
  stone: 'pick',  cobble: 'pick', bedrock: null,
  dirt:  'hand',  grass:  'hand', sand: 'hand', gravel: 'hand',
  log:   'axe',   leaves: 'hand', plank: 'axe',
  glass: 'pick',  coal:   'pick',
  iron_ore: 'pick', gold_ore: 'pick', diamond_ore: 'pick',
  emerald_ore: 'pick', lapis_ore: 'pick', redstone_ore: 'pick',
};

export const TOOL_TYPE = {
  wood_pick:  'pick', stone_pick:  'pick', iron_pick: 'pick', gold_pick: 'pick', diamond_pick: 'pick',
  wood_axe:   'axe',  stone_axe:   'axe',  iron_axe:  'axe',
  wood_sword: 'sword',stone_sword: 'sword',iron_sword: 'sword', diamond_sword: 'sword',
};

export const BLOCK_DROPS = {
  stone: 'cobble', cobble: 'cobble', dirt: 'dirt',  grass: 'dirt',
  sand: 'sand',    gravel: 'gravel', log: 'log',    plank: 'plank',
  glass: 'glass',  coal: 'coal',     leaves: null,  bedrock: null,
  iron_ore: 'iron_ingot', gold_ore: 'gold_ingot',
  diamond_ore: 'diamond', emerald_ore: 'emerald',
  lapis_ore: 'lapis',     redstone_ore: 'redstone',
};

// =====================================================================
// RECETAS
// =====================================================================
export const RECIPES = [
  {
    grid: [null,null,null, null,'log',null, null,null,null],
    result: 'plank', count: 4,
    name: 'Tablones'
  },
  {
    grid: [null,null,null, null,'plank',null, null,'plank',null],
    result: 'stick', count: 4,
    name: 'Palos'
  },
  {
    grid: [null,null,null, null,'plank','plank', null,'plank','plank'],
    result: 'plank', count: 1,
    name: 'Mesa (decorativa)'
  },
  {
    grid: ['plank','plank','plank', null,'stick',null, null,'stick',null],
    result: 'wood_pick', count: 1,
    name: 'Pico de madera'
  },
  {
    grid: ['cobble','cobble','cobble', null,'stick',null, null,'stick',null],
    result: 'stone_pick', count: 1,
    name: 'Pico de piedra'
  },
  {
    grid: [null,'plank',null, null,'plank',null, null,'stick',null],
    result: 'wood_sword', count: 1,
    name: 'Espada de madera'
  },
  {
    grid: [null,'cobble',null, null,'cobble',null, null,'stick',null],
    result: 'stone_sword', count: 1,
    name: 'Espada de piedra'
  },
  {
    grid: ['plank','plank',null, 'plank','stick',null, null,'stick',null],
    result: 'wood_pick', count: 1,
    name: 'Hacha de madera'
  },
  {
    grid: ['cobble','cobble',null, 'cobble','stick',null, null,'stick',null],
    result: 'stone_pick', count: 1,
    name: 'Hacha de piedra'
  },
  {
    grid: [null,null,null, 'sand','sand','sand', null,null,null],
    result: 'glass', count: 3,
    name: 'Cristal'
  },
  {
    grid: ['iron_ingot','iron_ingot','iron_ingot', null,'stick',null, null,'stick',null],
    result: 'iron_pick', count: 1,
    name: 'Pico de hierro'
  },
  {
    grid: ['gold_ingot','gold_ingot','gold_ingot', null,'stick',null, null,'stick',null],
    result: 'gold_pick', count: 1,
    name: 'Pico de oro'
  },
  {
    grid: ['diamond','diamond','diamond', null,'stick',null, null,'stick',null],
    result: 'diamond_pick', count: 1,
    name: 'Pico de diamante'
  },
  {
    grid: ['iron_ingot','iron_ingot',null, 'iron_ingot','stick',null, null,'stick',null],
    result: 'iron_axe', count: 1,
    name: 'Hacha de hierro'
  },
  {
    grid: [null,'iron_ingot',null, null,'iron_ingot',null, null,'stick',null],
    result: 'iron_sword', count: 1,
    name: 'Espada de hierro'
  },
  {
    grid: [null,'diamond',null, null,'diamond',null, null,'stick',null],
    result: 'diamond_sword', count: 1,
    name: 'Espada de diamante'
  },
];

// =====================================================================
// MODO DE JUEGO
// =====================================================================
export let GAME_MODE = 'survival';

export function setGameMode(mode) {
  GAME_MODE = mode;
  const badge = document.getElementById('mode-badge');
  if (badge) {
    badge.textContent = mode === 'creative' ? '✦ CREATIVO' : '❤ SUPERVIVENCIA';
    badge.style.color = mode === 'creative' ? '#6ac' : '#f88';
  }
  const healthWrap = document.getElementById('health-wrap');
  if (healthWrap) healthWrap.style.display = mode === 'creative' ? 'none' : 'flex';
  const hintJump = document.getElementById('hint-jump');
  if (hintJump) hintJump.textContent = mode === 'creative'
    ? 'ESPACIO/SHIFT: subir/bajar'
    : 'ESPACIO: saltar';
}

export function canBreakBlock(blockType, heldItemType) {
  if (GAME_MODE === 'creative') return true;
  const required = BLOCK_TOOL[blockType];
  if (required === null) return false;
  if (required === 'hand') return true;
  if (!heldItemType) return false;
  return TOOL_TYPE[heldItemType] === required;
}