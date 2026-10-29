import {
  centrumAdultMineralTargets,
  centrumAdultTargets,
} from "./centrumDailyMenu.js";
import { mineralUnits } from "./mineralProfiles.js";

const portionStepGrams = 50;
const maxPortionGrams = 200;
const maxGramsByFamily = { fruit: 425, vegetable: 270 };
const maxDailyProduceGrams = Object.values(maxGramsByFamily).reduce(
  (total, grams) => total + grams,
  0,
);
const strongSeasonBoost = 1.2;
const nutrientTargets = [...centrumAdultTargets, ...centrumAdultMineralTargets]
  .filter((target) => target.key && !target.notComparable);

function convertAmount(amount, fromUnit, toUnit) {
  if (fromUnit === toUnit) return amount;
  if (fromUnit === "mg" && toUnit === "µg") return amount * 1000;
  if (fromUnit === "µg" && toUnit === "mg") return amount / 1000;
  throw new Error(`Unsupported nutrient unit conversion: ${fromUnit} to ${toUnit}`);
}

function getNutrientValue(food, target) {
  const isMineral = Object.hasOwn(mineralUnits, target.key);
  const profile = isMineral
    ? food.nutrients?.mineralsPer100g
    : food.nutrients?.per100g;
  const amount = profile?.[target.key];

  if (typeof amount !== "number") return null;

  const sourceUnit = isMineral ? mineralUnits[target.key].unit : target.unit;
  return convertAmount(amount, sourceUnit, target.unit);
}

function getNutrientDensityGain(food, grams, totals) {
  return nutrientTargets.reduce((gain, target) => {
    const amount = getNutrientValue(food, target);
    if (amount === null) return gain;

    const currentCoverage = Math.min(totals[target.key] / target.amount, 1);
    const addedAmount = (amount * grams) / 100;
    const nextCoverage = Math.min(
      (totals[target.key] + addedAmount) / target.amount,
      1,
    );
    return gain + nextCoverage - currentCoverage;
  }, 0);
}

export function generateSeasonalDailyMenu(database, monthIndex, energyBudgetKcal) {
  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    throw new RangeError("monthIndex must be an integer from 0 to 11.");
  }
  if (!Number.isFinite(energyBudgetKcal) || energyBudgetKcal <= 0) {
    throw new RangeError("energyBudgetKcal must be a positive number.");
  }

  const candidates = database
    .filter(
      (food) =>
        !food.isClass &&
        (food.season[monthIndex] === "Forte" ||
          food.season[monthIndex] === "Medio") &&
        typeof food.nutrients?.energyKcalPer100g === "number" &&
        food.nutrients.energyKcalPer100g > 0,
    )
    .sort((a, b) => a.key.localeCompare(b.key));
  const selected = new Map();
  const gramsByFamily = { fruit: 0, vegetable: 0 };
  const totals = Object.fromEntries(
    nutrientTargets.map((target) => [target.key, 0]),
  );
  let energyUsedKcal = 0;
  let totalGrams = 0;

  while (
    energyUsedKcal < energyBudgetKcal &&
    totalGrams < maxDailyProduceGrams
  ) {
    let bestCandidate = null;

    candidates.forEach((food) => {
      const currentGrams = selected.get(food.key)?.grams ?? 0;
      if (currentGrams >= maxPortionGrams) return;
      const family = food.family === "FRUTAS" ? "fruit" : "vegetable";
      const familyRemaining = maxGramsByFamily[family] - gramsByFamily[family];
      if (familyRemaining <= 0) return;

      const grams = Math.min(
        portionStepGrams,
        maxPortionGrams - currentGrams,
        maxDailyProduceGrams - totalGrams,
        familyRemaining,
      );
      const energyKcal =
        (food.nutrients.energyKcalPer100g * grams) / 100;
      if (energyUsedKcal + energyKcal > energyBudgetKcal) return;

      const gain = getNutrientDensityGain(food, grams, totals);
      if (gain <= 0) return;

      const seasonBoost = food.season[monthIndex] === "Forte"
        ? strongSeasonBoost
        : 1;
      const score = (gain * seasonBoost) / energyKcal;
      if (!bestCandidate || score > bestCandidate.score) {
        bestCandidate = { food, grams, energyKcal, score };
      }
    });

    if (!bestCandidate) break;

    const { food, grams, energyKcal, score } = bestCandidate;
    const selectedFood = selected.get(food.key) ?? {
      key: food.key,
      name: food.name,
      season: food.season[monthIndex],
      grams: 0,
      energyKcal: 0,
      densityScore: 0,
    };
    selectedFood.grams += grams;
    selectedFood.energyKcal += energyKcal;
    selectedFood.densityScore = Math.max(selectedFood.densityScore, score);
    selected.set(food.key, selectedFood);
    energyUsedKcal += energyKcal;
    totalGrams += grams;
    gramsByFamily[food.family === "FRUTAS" ? "fruit" : "vegetable"] += grams;

    nutrientTargets.forEach((target) => {
      const amount = getNutrientValue(food, target);
      if (amount !== null) totals[target.key] += (amount * grams) / 100;
    });
  }

  const selectedFoods = [...selected.values()]
    .sort((a, b) => b.densityScore - a.densityScore)
    .map((food, index) => ({ ...food, densityRank: index + 1 }));
  const fruits = selectedFoods.filter((food) =>
    candidates.find((candidate) => candidate.key === food.key)?.family === "FRUTAS",
  );
  const vegetables = selectedFoods.filter((food) => !fruits.includes(food));

  return {
    meals: [
      {
        meal: "Café da manhã e lanche",
        foods: fruits.map((food) => ({
          ...food,
          portion: "Porção ilustrativa",
        })),
      },
      {
        meal: "Refeições principais",
        foods: vegetables.map((food) => ({
          ...food,
          portion: "Porção ilustrativa",
        })),
      },
    ].filter((meal) => meal.foods.length > 0),
    totalGrams,
    energyKcal: energyUsedKcal,
    targetTotals: totals,
    targetCoverage: Object.fromEntries(
      nutrientTargets.map((target) => [
        target.key,
        Math.min((totals[target.key] / target.amount) * 100, 100),
      ]),
    ),
  };
}
