import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

describe("SegmentedControl", () => {
  const options = [
    { value: "all", label: "All" },
    { value: "holo", label: "Holo ✦" },
  ];

  it("renders all options and marks the selected one pressed", () => {
    render(
      <SegmentedControl
        options={options}
        value="holo"
        onChange={() => {}}
        ariaLabel="variant"
      />,
    );
    expect(screen.getByRole("button", { name: "Holo ✦" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("calls onChange with the option value when clicked", () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        options={options}
        value="all"
        onChange={onChange}
        ariaLabel="variant"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Holo ✦" }));
    expect(onChange).toHaveBeenCalledWith("holo");
  });
});
