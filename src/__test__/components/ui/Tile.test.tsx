import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Tile } from "@/components/ui/Tile";
import { SectionHeading } from "@/components/ui/SectionHeading";

describe("Tile", () => {
  it("renders children inside a tile container with extra classes", () => {
    render(
      <Tile className="p-5">
        <p>body content</p>
      </Tile>,
    );
    const el = screen.getByText("body content").parentElement;
    expect(el?.className).toContain("tile");
    expect(el?.className).toContain("p-5");
  });
});

describe("SectionHeading", () => {
  it("exposes the English label to assistive tech and renders the action", () => {
    render(
      <SectionHeading label="Series" action={<a href="/cards">See all…</a>}>
        シリーズ
      </SectionHeading>,
    );
    expect(screen.getByRole("heading", { name: /Series/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See all…" })).toBeInTheDocument();
  });
});
