import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "@/components/ErrorBoundary";

const Bomb: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error("test error");
  return <div>No error</div>;
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("No error")).toBeInTheDocument();
    expect(
      screen.queryByText("Something went wrong"),
    ).not.toBeInTheDocument();
  });

  it('shows "Something went wrong" when child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.queryByText("No error")).not.toBeInTheDocument();
  });

  it('shows "Try again" and "Refresh page" buttons in error state', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /refresh page/i }),
    ).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    const customFallback = <div>Custom error UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Custom error UI")).toBeInTheDocument();
    expect(
      screen.queryByText("Something went wrong"),
    ).not.toBeInTheDocument();
  });

  it('"Try again" resets error state and re-renders children', () => {
    let throwError = true;

    const ResettableBomb: React.FC = () => {
      if (throwError) throw new Error("test error");
      return <div>No error</div>;
    };

    render(
      <ErrorBoundary>
        <ResettableBomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    throwError = false;

    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(tryAgainButton);

    expect(screen.getByText("No error")).toBeInTheDocument();
    expect(
      screen.queryByText("Something went wrong"),
    ).not.toBeInTheDocument();
  });

  it('"Refresh page" calls window.location.reload', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    );

    const refreshButton = screen.getByRole("button", { name: /refresh page/i });
    fireEvent.click(refreshButton);

    expect(reloadMock).toHaveBeenCalledOnce();
  });
});
