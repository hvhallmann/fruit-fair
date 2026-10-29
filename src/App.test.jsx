import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import App from "./App";
import Card from "./Card";
import staticDb from "./db/dbWithNutrients.js";
import {
  centrumAdultTargets,
  centrumDailyMenu,
} from "./db/centrumDailyMenu.js";

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

  it("switches between seasonal produce and the vitamins information", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Vitaminas" }));

    expect(
      screen.getByRole("heading", { name: "Vitaminas nos alimentos in natura" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Exemplo de cardápio diário com itens da sua base",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("695 g")).toBeInTheDocument();
    expect(
      screen.getByRole("table", {
        name: /Valores estimados no cardápio comparados/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/não é possível afirmar equivalência nutricional total/),
    ).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /Vitamina C/ })).toHaveTextContent(
      "282,3 mg",
    );
    expect(screen.getByRole("row", { name: /Vitamina C/ })).toHaveTextContent(
      "627,4%",
    );
    expect(
      screen.getByRole("rowheader", { name: "Vitamina B1" }).closest("tr"),
    ).toHaveTextContent("parcial; faltam dados");
    expect(
      screen.getByRole("rowheader", { name: "Vitamina B5" }).closest("tr"),
    ).toHaveTextContent("Não calculado: dado ausente na base");
    expect(screen.getByRole("button", { name: "Vitaminas" })).toHaveAttribute(
      "aria-current",
      "page",
    );

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

  it("defines a one-day menu and Centrum targets without implying unsupported nutrients", () => {
    const menuFoods = centrumDailyMenu.flatMap((meal) => meal.foods);
    const menuWeight = menuFoods.reduce((total, food) => total + food.grams, 0);

    expect(menuWeight).toBe(695);
    expect(menuFoods.every((food) => staticDb.some((item) => item.key === food.key)))
      .toBe(true);
    expect(centrumAdultTargets).toHaveLength(13);
    expect(
      centrumAdultTargets
        .filter((target) => target.key === null)
        .map((target) => target.name),
    ).toEqual(["Vitamina B5", "Vitamina K", "Biotina"]);
  });

  it("provides sourced vitamin profiles for produce items", () => {
    const produce = staticDb.filter((item) => !item.isClass);

    expect(produce).toHaveLength(65);
    produce.forEach((item) => {
      expect(item.nutrients).toBeDefined();
      expect(item.nutrients.basisGrams).toBe(100);
      expect(item.nutrients.source).toBe("TBCA");
      expect(item.nutrients.sourceUrl).toMatch(/^https:\/\/www\.tbca\.net\.br\//);
      expect(item.nutrients.per100g).toHaveProperty("vitaminC");
      expect(Array.isArray(item.nutrients.highlights)).toBe(true);
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
