import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import App from "./App";
import Card from "./Card";

describe("Feira da Fruta App", () => {
  it("loads the initial page and renders produce cards with images", () => {
    const { container } = render(<App />);

    // Verify introductory section is present
    expect(
      screen.getByText(/A sugestao é levar os seguintes produtos/i),
    ).toBeInTheDocument();

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
