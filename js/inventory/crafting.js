import { craftGrid } from '../core/state.js';
import { RECIPES } from '../core/game.js';
import { giveItem } from './inventory.js';

// Verificar si la cuadrícula actual coincide con alguna receta
export function matchRecipe() {
  for (const recipe of RECIPES) {
    let match = true;
    for (let i = 0; i < 9; i++) {
      const expected = recipe.grid[i];
      const actual = craftGrid[i].type;
      if (expected !== actual) {
        match = false;
        break;
      }
    }
    if (match) return recipe;
  }
  return null;
}

// Consumir los ingredientes después de craftear
export function consumeCraftIngredients() {
  for (let i = 0; i < 9; i++) {
    if (craftGrid[i].type) {
      craftGrid[i].count--;
      if (craftGrid[i].count <= 0) {
        craftGrid[i] = { type: null, count: 0 };
      }
    }
  }
}

// Tomar el resultado del crafteo (llamado desde la UI)
export function takeCraftResult() {
  const recipe = matchRecipe();
  if (!recipe) return false;
  consumeCraftIngredients();
  giveItem(recipe.result, recipe.count);
  return true;
}

// Limpiar la mesa de crafteo (devolver items al inventario)
export function clearCraftGrid(giveItemCallback) {
  for (let i = 0; i < 9; i++) {
    if (craftGrid[i].type) {
      giveItemCallback(craftGrid[i].type, craftGrid[i].count);
      craftGrid[i] = { type: null, count: 0 };
    }
  }
}

// Obtener información de la receta actual (para mostrar en UI)
export function getCurrentRecipeInfo() {
  const recipe = matchRecipe();
  if (recipe) {
    return { result: recipe.result, count: recipe.count, name: recipe.name };
  }
  return null;
}