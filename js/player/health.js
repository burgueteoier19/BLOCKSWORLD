import { camera } from '../core/scene.js';
import { GAME_MODE } from '../core/game.js';
import { getHeight } from '../world/terrain.js';
import { resetVelocity } from './movement.js';

// Variables de salud
let playerHealth = 20;
const PLAYER_MAX_HP = 20;
let invincibleTimer = 0;

// Función para renderizar la barra de vida (corazones)
export function renderHealthBar() {
  for (let i = 0; i < 10; i++) {
    const el = document.getElementById(`heart-${i}`);
    if (!el) continue;
    const hp2 = i * 2;
    if (playerHealth >= hp2 + 2) {
      el.style.color = '#e03030';
      el.style.opacity = '1';
    } else if (playerHealth >= hp2 + 1) {
      el.style.color = '#e03030';
      el.style.opacity = '0.45';
    } else {
      el.style.color = '#555';
      el.style.opacity = '0.4';
    }
  }
}

// Daño al jugador
export function damagePlayer(amount) {
  if (GAME_MODE === 'creative') return;
  if (invincibleTimer > 0) return;
  playerHealth = Math.max(0, playerHealth - amount);
  invincibleTimer = 0.5;
  renderHealthBar();
  if (playerHealth <= 0) {
    respawnPlayer();
  }
}

// Curar jugador
export function healPlayer(amount) {
  playerHealth = Math.min(PLAYER_MAX_HP, playerHealth + amount);
  renderHealthBar();
}

// Reiniciar al morir
function respawnPlayer() {
  const spawnY = getHeight(0, 0) + 1.62 + 2; // altura ojos + 2
  camera.position.set(0, spawnY, 0);
  // velocity se reinicia desde movement.js, se hará mediante import dinámico o exportación
  // Por simplicidad, exportaremos también una función para resetear velocidad
  resetVelocity();
  playerHealth = PLAYER_MAX_HP;
  renderHealthBar();
}

// Necesitamos resetear velocidad, pero velocity está en movement.js -> importación circular.
// Para evitar problemas, usaremos una función que se define en movement.js y se llama desde aquí.
// O mejor: exponer una función para resetear desde movement.js.
// Como esto es modular, haremos un pequeño puente:

let resetVelocityCallback = null;
export function registerResetVelocity(callback) {
  resetVelocityCallback = callback;
}

// Llamado al caer al suelo (para registrar caída)
export function onLand() {
  // actualmente la lógica de caída está en movement.js, pero aquí podemos dejarlo vacío por ahora
}

// Actualizar invencibilidad
export function updateInvincible(delta) {
  if (invincibleTimer > 0) {
    invincibleTimer -= delta;
    if (invincibleTimer < 0) invincibleTimer = 0;
  }
}

// Para permitir que movement.js pueda resetear velocidad
// También exportamos getter/setter por si acaso
export function getPlayerHealth() { return playerHealth; }
export function setPlayerHealth(health) { playerHealth = Math.min(PLAYER_MAX_HP, Math.max(0, health)); renderHealthBar(); }