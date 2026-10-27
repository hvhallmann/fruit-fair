import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import App from "./App";

describe("Feira da Fruta App", () => {
  it("loads the initial page and renders produce cards with images", () => {
    render(<App />);

    // Verify introductory section is present
    expect(
      screen.getByText(/A sugestao é levar os seguintes produtos/i),
    ).toBeInTheDocument();

    // Verify images are rendered on the page
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);

    // Verify the first image is properly loaded with valid src and alt attributes
    const firstImage = images[0];
    expect(firstImage).toBeInTheDocument();
    expect(firstImage).toHaveAttribute("src");
    expect(firstImage.getAttribute("src")).toMatch(/\.webp$/i);
    expect(firstImage.getAttribute("alt")).toBeTruthy();
  });
});
