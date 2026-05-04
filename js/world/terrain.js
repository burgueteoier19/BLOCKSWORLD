// Ruido suave para altura del terreno
export function smoothNoise(x, z, seed) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  const a = pseudoRand(ix,   iz,   seed);
  const b = pseudoRand(ix+1, iz,   seed);
  const c = pseudoRand(ix,   iz+1, seed);
  const d = pseudoRand(ix+1, iz+1, seed);
  return a + (b - a) * ux + (c - a) * uz + (d - a) * ux * uz + (d - b - c + a) * ux * uz;
}

export function pseudoRand(x, z, seed) {
  const n = Math.sin(x * 127.1 + z * 311.7 + seed * 74.3) * 43758.5453;
  return n - Math.floor(n);
}

export function getHeight(x, z) {
  const base    = smoothNoise(x * 0.04,  z * 0.04,  1) * 18;
  const detail  = smoothNoise(x * 0.12,  z * 0.12,  2) * 5;
  const micro   = smoothNoise(x * 0.35,  z * 0.35,  3) * 2;
  const mountain = smoothNoise(x * 0.015, z * 0.015, 5);
  const mBoost = mountain > 0.65 ? (mountain - 0.65) * 40 : 0;
  return Math.floor(base + detail + micro + mBoost - 8);
}