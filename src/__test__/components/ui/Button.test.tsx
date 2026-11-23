import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "@/components/ui/Button";
import { buttonClasses } from "@/components/ui/buttonClasses";

describe("Button", () => {
  it("renders children, defaults to type=button, and fires onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Reset</Button>);
    const btn = screen.getByRole("button", { name: "Reset" });
    expect(btn).toHaveAttribute("type", "button");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies the variant and size classes", () => {
    render(
      <Button variant="ghost" size="sm">
        Share
      </Button>,
    );
    const cls = screen.getByRole("button", { name: "Share" }).className;
    expect(cls).toContain("btn-ghost");
    expect(cls).toContain("btn-sm");
  });
});

describe("buttonClasses", () => {
  it("defaults to the primary medium button", () => {
    expect(buttonClasses()).toBe("btn-primary");
  });

  it("adds the small modifier", () => {
    expect(buttonClasses("ghost", "sm")).toBe("btn-ghost btn-sm");
  });
});
