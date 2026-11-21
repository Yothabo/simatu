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

  it("clicks Discover and follows exit, reveal, activation, and Home return in order", () => {
    const { container } = render(<HomePage />);
    const root = container.querySelector(".homepage-layered-experience");

    expect(root).toHaveClass("phase-idle");
    expect(screen.getByRole("button", { name: "Discover our brand network" })).toBeEnabled();
    expect(container.querySelector(".homepage-moodboard-background")).toHaveAttribute("aria-hidden", "true");

    fireEvent.click(screen.getByRole("button", { name: "Discover our brand network" }));
    expect(root).toHaveClass("phase-exit");

    // Emit the four transition events the exit handler is waiting for.
    emitTransition(container.querySelector(".hero-navigation")!, "transform");
    emitTransition(container.querySelector(".novae-hero")!, "transform");
    emitTransition(container.querySelector("footer")!, "transform");
    emitTransition(container.querySelector(".homepage-discover-trigger-section")!, "opacity");

    expect(root).toHaveClass("phase-reveal");
    expect(container.querySelector(".homepage-moodboard-background")).toHaveAttribute("aria-hidden", "false");
    expect(container.querySelector(".kinetic-moodboard")).toHaveAttribute("data-color-reveal", "true");
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Search discovery" })).toBeInTheDocument();
    expect(container.querySelector(".kinetic-moodboard")).toHaveAttribute("data-interactive", "false");

    emitTransition(container.querySelector(".kinetic-moodboard__reveal-sentinel")!, "opacity");

    expect(root).toHaveClass("phase-active");
    expect(container.querySelector(".kinetic-moodboard")).toHaveAttribute("data-interactive", "true");

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(root).toHaveClass("phase-idle");
    expect(container.querySelector(".homepage-moodboard-background")).toHaveAttribute("aria-hidden", "true");
  });

  it("uses the 1,250ms exit watchdog if exit transition events never arrive", () => {
    const { container } = render(<HomePage />);
    const root = container.querySelector(".homepage-layered-experience");

    fireEvent.click(screen.getByRole("button", { name: "Discover our brand network" }));
    expect(root).toHaveClass("phase-exit");

    act(() => vi.advanceTimersByTime(1250));

    expect(root).toHaveClass("phase-reveal");
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
  });

  it("uses the 5,200ms reveal watchdog if sentinel transition never arrives", () => {
    const { container } = render(<HomePage />);
    const root = container.querySelector(".homepage-layered-experience");

    fireEvent.click(screen.getByRole("button", { name: "Discover our brand network" }));
    act(() => vi.advanceTimersByTime(1250));
    expect(root).toHaveClass("phase-reveal");

    act(() => vi.advanceTimersByTime(5200));

    expect(root).toHaveClass("phase-active");
    expect(container.querySelector(".kinetic-moodboard")).toHaveAttribute("data-interactive", "true");
  });
});
