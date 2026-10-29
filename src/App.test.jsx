import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import App from "./App";
import Card from "./Card";
import staticDb from "./db/dbWithNutrients.js";
import {
  centrumAdultTargets,
  centrumAdultMineralTargets,
  demoUserProfile,
} from "./db/centrumDailyMenu.js";
import { generateSeasonalDailyMenu } from "./db/seasonalMenu.js";

function estimatedNutrient(menu, database, nutrientKey, category, targetUnit) {
  const mineralUnit =
    nutrientKey === "selenium" ? "µg" : category === "minerals" ? "mg" : targetUnit;

  return menu.meals
    .flatMap((meal) => meal.foods)
    .reduce((total, food) => {
      const produce = database.find((item) => item.key === food.key);
      const profile =
        category === "minerals"
          ? produce.nutrients.mineralsPer100g
          : produce.nutrients.per100g;
      const value = profile[nutrientKey];
      if (typeof value !== "number") return total;

      const converted =
        mineralUnit === targetUnit
          ? value
          : mineralUnit === "mg"
            ? value * 1000
            : value / 1000;
      return total + (converted * food.grams) / 100;
    }, 0);
}

function formatExpectedAmount(amount) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(amount);
}

describe("Feira da Fruta App", () => {
  it("loads the initial page and renders produce cards with images", () => {
    const { container } = render(<App />);

    // Verify introductory section is present
    expect(
      screen.getByText(/A sugestão é levar os seguintes produtos/i),
    ).toBeInTheDocument();

    expect(container.querySelectorAll(".produce-grid")).toHaveLength(4);

    // Verify images are rendered on the page
    const images = container.querySelectorAll("img");
    expect(images.length).toBeGreaterThan(0);

    // Verify the first image is properly loaded with valid src and alt attributes
    const firstImage = images[0];
    expect(firstImage).toBeInTheDocument();
    expect(firstImage).toHaveAttribute("src");
    expect(firstImage.getAttribute("src")).toMatch(/\.webp$/i);
    expect(firstImage).toHaveAttribute("alt");
  });

  it("uses a main landmark and a single top-level heading", () => {
    render(<App />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 2 })).not.toHaveLength(0);
  });

  it("switches between seasonal produce and the vitamins and minerals information", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Vitaminas e minerais" }));

    expect(
      screen.getByRole("heading", {
        name: "Vitaminas e minerais nos alimentos in natura",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Exemplo de cardápio diário com itens da sua base",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) =>
          element.classList.contains("daily-menu-intro") &&
          element.textContent.includes("1,8 m") &&
          element.textContent.includes("78 kg"),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Limite energético da seleção diária (kcal)"),
    ).toHaveValue(2000);
    const currentMenu = generateSeasonalDailyMenu(
      staticDb,
      new Date().getMonth(),
      2000,
    );
    expect(
      screen.getByRole("table", {
        name: /Valores estimados no cardápio comparados.*vitaminas/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("table", {
        name: /Valores estimados no cardápio comparados.*minerais/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/não é possível afirmar equivalência nutricional total/),
    ).toBeInTheDocument();
    const vitaminC = estimatedNutrient(
      currentMenu,
      staticDb,
      "vitaminC",
      "vitamins",
      "mg",
    );
    const vitaminCRow = screen.getByRole("row", { name: /Vitamina C/ });
    expect(vitaminCRow).toHaveTextContent(`${formatExpectedAmount(vitaminC)} mg`);
    expect(vitaminCRow).toHaveTextContent(
      `${formatExpectedAmount((vitaminC / 45) * 100)}%`,
    );
    const vitaminB1 = estimatedNutrient(
      currentMenu,
      staticDb,
      "vitaminB1",
      "vitamins",
      "mg",
    );
    expect(
      screen.getByRole("rowheader", { name: "Vitamina B1" }).closest("tr"),
    ).toHaveTextContent(`${formatExpectedAmount(vitaminB1)} mg`);
    expect(
      screen.getByRole("rowheader", { name: "Vitamina B5" }).closest("tr"),
    ).toHaveTextContent("Não calculado: dado ausente na base");
    expect(
      screen.getByRole("button", { name: "Vitaminas e minerais" }),
    ).toHaveAttribute("aria-current", "page");
    const calciumRow = screen.getByRole("rowheader", { name: "Cálcio" }).closest("tr");
    const calcium = estimatedNutrient(
      currentMenu,
      staticDb,
      "calcium",
      "minerals",
      "mg",
    );
    expect(calciumRow).toHaveTextContent(`${formatExpectedAmount(calcium)} mg`);
    expect(calciumRow).toHaveTextContent(
      `${formatExpectedAmount((calcium / 250) * 100)}%`,
    );
    const copper = estimatedNutrient(
      currentMenu,
      staticDb,
      "copper",
      "minerals",
      "µg",
    );
    expect(
      screen.getByRole("rowheader", { name: "Cobre" }).closest("tr"),
    ).toHaveTextContent(`${formatExpectedAmount(copper)} µg`);
    const potassiumRow = screen
      .getByRole("rowheader", { name: "Potássio" })
      .closest("tr");
    expect(potassiumRow).toHaveTextContent("10 µg");
    expect(potassiumRow).toHaveTextContent("precisa ser confirmada");

    const energyInput = screen.getByLabelText(
      "Limite energético da seleção diária (kcal)",
    );
    const lowerBudgetMenu = generateSeasonalDailyMenu(
      staticDb,
      new Date().getMonth(),
      500,
    );
    fireEvent.change(energyInput, { target: { value: "500" } });
    expect(screen.getAllByRole("listitem")).toHaveLength(
      lowerBudgetMenu.meals.flatMap((meal) => meal.foods).length,
    );
    expect(screen.getByText(/500 kcal disponíveis/)).toBeInTheDocument();

    fireEvent.change(energyInput, { target: { value: "0" } });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Informe um limite energético maior que zero",
    );
    expect(
      screen.queryByRole("table", {
        name: /Valores estimados no cardápio comparados.*vitaminas/,
      }),
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Feira do mês" }));

    expect(
      screen.getByText(/A sugestão é levar os seguintes produtos/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: "Exemplo de cardápio diário com itens da sua base",
      }),
    ).toBeNull();
  });

  it("generates different in-season menus under the user's manually set energy target", () => {
    const januaryMenu = generateSeasonalDailyMenu(staticDb, 0, 2000);
    const juneMenu = generateSeasonalDailyMenu(staticDb, 5, 2000);
    const januaryFoods = januaryMenu.meals.flatMap((meal) => meal.foods);
    const juneFoods = juneMenu.meals.flatMap((meal) => meal.foods);

    expect(januaryFoods.length).toBeGreaterThan(0);
    expect(juneFoods.length).toBeGreaterThan(0);
    expect(januaryFoods.some((food) =>
      staticDb.find((item) => item.key === food.key).family === "FRUTAS",
    )).toBe(true);
    expect(januaryFoods.some((food) =>
      staticDb.find((item) => item.key === food.key).family !== "FRUTAS",
    )).toBe(true);
    expect(januaryFoods.map((food) => food.key)).not.toEqual(
      juneFoods.map((food) => food.key),
    );
    [januaryFoods, juneFoods].forEach((foods, index) => {
      const month = index === 0 ? 0 : 5;
      foods.forEach((food) => {
        expect(staticDb.find((item) => item.key === food.key).season[month]).toMatch(
          /^(Forte|Medio)$/,
        );
        expect(food.grams).toBeLessThanOrEqual(200);
      });
    });
    expect(januaryMenu.energyKcal).toBeLessThanOrEqual(2000);
    expect(juneMenu.energyKcal).toBeLessThanOrEqual(2000);
    expect(januaryMenu.totalGrams).toBeLessThanOrEqual(695);
    expect(juneMenu.totalGrams).toBeLessThanOrEqual(695);
    expect(demoUserProfile).toMatchObject({
      heightCm: 180,
      weightKg: 78,
      energyTargetKcal: 2000,
    });
    expect(() => generateSeasonalDailyMenu(staticDb, 0, 0)).toThrow(
      "energyBudgetKcal must be a positive number.",
    );
    expect(centrumAdultTargets).toHaveLength(13);
    expect(centrumAdultMineralTargets).toHaveLength(13);
    expect(
      centrumAdultTargets
        .filter((target) => target.key === null)
        .map((target) => target.name),
    ).toEqual(["Vitamina B5", "Vitamina K", "Biotina"]);
    expect(
      centrumAdultMineralTargets
        .filter((target) => target.key === null)
        .map((target) => target.name),
    ).toEqual(["Cromo", "Iodo", "Molibdênio", "Cloro"]);
  });

  it("provides sourced vitamin and mineral profiles for produce items", () => {
    const produce = staticDb.filter((item) => !item.isClass);

    expect(produce).toHaveLength(65);
    produce.forEach((item) => {
      expect(item.nutrients).toBeDefined();
      expect(item.nutrients.basisGrams).toBe(100);
      expect(item.nutrients.source).toBe("TBCA");
      expect(item.nutrients.sourceUrl).toMatch(/^https:\/\/www\.tbca\.net\.br\//);
      expect(item.nutrients.per100g).toHaveProperty("vitaminC");
      expect(Array.isArray(item.nutrients.highlights)).toBe(true);
      expect(item.nutrients.mineralsPer100g).toHaveProperty("calcium");
      expect(Array.isArray(item.nutrients.mineralHighlights)).toBe(true);
      expect(
        item.nutrients.energyKcalPer100g === null ||
          item.nutrients.energyKcalPer100g > 0,
      ).toBe(true);
    });

    const guavaNutrients = staticDb.find(
      (item) => item.key === "goiaba",
    ).nutrients;
    expect(guavaNutrients.per100g).toMatchObject({
      vitaminC: 89.9,
      vitaminA: 53.1,
    });
    expect(guavaNutrients.highlights).toContainEqual({
      nutrient: "vitaminC",
      label: "Vitamina C",
      amount: 89.9,
      unit: "mg",
    });
    expect(
      staticDb.find((item) => item.key === "coco-verde").nutrients.note,
    ).toMatch(/não apresentou um perfil específico/);
    expect(
      Object.values(
        staticDb.find((item) => item.key === "coco-verde").nutrients
          .mineralsPer100g,
      ).every((amount) => amount === null),
    ).toBe(true);
    expect(
      staticDb.find((item) => item.key === "caqui").nutrients.mineralsPer100g
        .copper,
    ).toBeNull();
    expect(
      staticDb.find((item) => item.key === "ameixa").nutrients.mineralsPer100g
        .selenium,
    ).toBe(0);
  });

  it("opens tips from a button and closes with Escape, restoring focus", () => {
    render(<Card image="banana" title="Banana" tip="Dica de teste" />);

    const cardButton = screen.getByRole("button", { name: "Banana" });
    cardButton.focus();
    fireEvent.click(cardButton);

    const dialog = screen.getByRole("dialog", { name: "Dica sobre Banana" });
    expect(dialog).toHaveFocus();
    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(cardButton).toHaveFocus();
  });
});
