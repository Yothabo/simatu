import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "../../src/systems/homepage/pages/HomePage";

function emitTransition(target: Element, propertyName: string) {
  const event = new Event("transitionend", { bubbles: true });
  Object.defineProperty(event, "propertyName", { value: propertyName });
  act(() => target.dispatchEvent(event));
}


vi.mock("../../src/systems/homepage/hero/Hero", async () => {
  const React = await import("react");
  return { default: () => React.createElement(React.Fragment, null,
    React.createElement("nav", { className: "hero-navigation" }, "Mock header"),
    React.createElement("section", { className: "novae-hero" }, "Mock hero")) };
});

vi.mock("../../src/systems/homepage/footer", async () => {
  const React = await import("react");
  return { default: () => React.createElement("footer", null, "Mock footer") };
});

vi.mock("../../src/systems/homepage/discover/KineticMoodboard", async () => {
  const React = await import("react");
  return { default: ({ colorReveal, interactive, onExit }: { colorReveal: boolean; interactive: boolean; onExit?: () => void }) =>
    React.createElement("div", { className: "kinetic-moodboard", "data-color-reveal": String(colorReveal), "data-interactive": String(interactive) },
      colorReveal && React.createElement("div", { className: "mock-discovery-controls" },
        React.createElement("button", { type: "button", onClick: onExit }, "Home"),
        React.createElement("input", { "aria-label": "Search discovery" })),
      React.createElement("span", { className: "kinetic-moodboard__reveal-sentinel", style: { opacity: colorReveal ? 1 : 0 } })) };
});

describe("Homepage Discover transition", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("hides homepage instantly and starts the moodboard reveal on Discover click", () => {
    const { container } = render(<HomePage />);
    const root = container.querySelector(".homepage-layered-experience");

    expect(root).toHaveClass("phase-idle");
    fireEvent.click(screen.getByRole("button", { name: "Discover our brand network" }));

    expect(root).toHaveClass("phase-reveal");
    expect(container.querySelector(".homepage-foreground")).toBeInTheDocument();
    expect(container.querySelector(".kinetic-moodboard")).toHaveAttribute("data-color-reveal", "true");
    expect(container.querySelector(".kinetic-moodboard")).toHaveAttribute("data-interactive", "false");
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Search discovery" })).toBeInTheDocument();
  });

  it("activates moodboard interactions after reveal and supports Home return", () => {
    const { container } = render(<HomePage />);
    const root = container.querySelector(".homepage-layered-experience");

    fireEvent.click(screen.getByRole("button", { name: "Discover our brand network" }));
    act(() => vi.advanceTimersByTime(1450));
    expect(root).toHaveClass("phase-active");
    expect(container.querySelector(".kinetic-moodboard")).toHaveAttribute("data-interactive", "true");

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(root).toHaveClass("phase-return");
    expect(container.querySelector(".kinetic-moodboard")).toHaveAttribute("data-color-reveal", "false");
    act(() => vi.advanceTimersByTime(780));
    expect(root).toHaveClass("phase-idle");
  });
});
