import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "../../src/systems/homepage/pages/HomePage";

vi.mock("../../src/systems/homepage/hero/Hero", () => ({
  default: () => React.createElement(
    React.Fragment,
    null,
    React.createElement("header", null, "Mock header"),
    React.createElement("section", { className: "novae-hero" }, "Mock hero")
  ),
}));

vi.mock("../../src/systems/homepage/footer", () => ({
  default: () => React.createElement("footer", null, "Mock footer"),
}));

vi.mock("../../src/systems/homepage/discover/KineticMoodboard", () => ({
  default: ({ colorReveal, interactive, onExit }: { colorReveal: boolean; interactive: boolean; onExit?: () => void }) =>
    React.createElement(
      "div",
      { className: "kinetic-moodboard", "data-color-reveal": String(colorReveal), "data-interactive": String(interactive) },
      colorReveal && React.createElement("div", { className: "mock-discovery-controls" },
        React.createElement("button", { type: "button", onClick: onExit }, "Home"),
        React.createElement("input", { "aria-label": "Search discovery" })
      ),
      React.createElement("span", { className: "kinetic-moodboard__reveal-sentinel", style: { opacity: colorReveal ? 1 : 0 } })
    ),
}));

describe("Homepage Discover transition", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("clicks Discover and follows exit, reveal, and activation in order", () => {
    const { container } = render(<HomePage />);
    const root = container.querySelector(".homepage-layered-experience");

    expect(root).toHaveClass("phase-idle");
    expect(screen.getByRole("button", { name: "Discover our brand network" })).toBeEnabled();
    expect(screen.queryByRole("textbox", { name: "Search discovery" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Discover our brand network" }));
    expect(root).toHaveClass("phase-exit");

    // Complete each real transition target that HomePage tracks.
    fireEvent.transitionEnd(container.querySelector("header")!, { propertyName: "transform" });
    fireEvent.transitionEnd(container.querySelector(".novae-hero")!, { propertyName: "transform" });
    fireEvent.transitionEnd(container.querySelector("footer")!, { propertyName: "transform" });
    fireEvent.transitionEnd(container.querySelector(".homepage-discover-trigger-section")!, { propertyName: "opacity" });

    expect(root).toHaveClass("phase-reveal");
    expect(container.querySelector(".kinetic-moodboard")?.getAttribute("data-color-reveal")).toBe("true");
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Search discovery" })).toBeInTheDocument();
    expect(container.querySelector(".kinetic-moodboard")?.getAttribute("data-interactive")).toBe("false");

    fireEvent.transitionEnd(container.querySelector(".kinetic-moodboard__reveal-sentinel")!, { propertyName: "opacity" });

    expect(root).toHaveClass("phase-active");
    expect(container.querySelector(".kinetic-moodboard")?.getAttribute("data-interactive")).toBe("true");
  });

  it("uses the 1,250ms exit watchdog when exit transition events never arrive", () => {
    const { container } = render(<HomePage />);
    const root = container.querySelector(".homepage-layered-experience");

    fireEvent.click(screen.getByRole("button", { name: "Discover our brand network" }));
    expect(root).toHaveClass("phase-exit");

    act(() => vi.advanceTimersByTime(1250));

    expect(root).toHaveClass("phase-reveal");
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
  });

  it("uses the 4,000ms reveal watchdog when the sentinel transition never arrives", () => {
    const { container } = render(<HomePage />);
    const root = container.querySelector(".homepage-layered-experience");

    fireEvent.click(screen.getByRole("button", { name: "Discover our brand network" }));
    act(() => vi.advanceTimersByTime(1250));
    expect(root).toHaveClass("phase-reveal");

    act(() => vi.advanceTimersByTime(4000));

    expect(root).toHaveClass("phase-active");
    expect(container.querySelector(".kinetic-moodboard")?.getAttribute("data-interactive")).toBe("true");
  });
});
