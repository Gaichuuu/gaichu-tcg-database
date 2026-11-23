import { render, screen } from "@testing-library/react";
import {
  PageLoading,
  PageError,
  PageNotFound,
  PageEmpty,
} from "@/components/PageStates";
import { renderWithProviders } from "@/__test__/testUtils";

describe("PageStates", () => {
  describe("PageLoading", () => {
    it("renders default message", () => {
      render(<PageLoading />);
      expect(screen.getByText("Loading…")).toBeInTheDocument();
    });

    it("renders custom message when provided", () => {
      render(<PageLoading message="Loading cards..." />);
      expect(screen.getByText("Loading cards...")).toBeInTheDocument();
    });
  });

  describe("PageError", () => {
    it("renders default message", () => {
      render(<PageError />);
      expect(
        screen.getByText("Something went wrong. Please try again."),
      ).toBeInTheDocument();
    });

    it("renders custom message when provided", () => {
      render(<PageError message="Failed to load data." />);
      expect(screen.getByText("Failed to load data.")).toBeInTheDocument();
    });
  });

  describe("PageNotFound", () => {
    it("renders default message", () => {
      renderWithProviders(<PageNotFound />);
      expect(
        screen.getByText(/Nothing lives at this address/),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Browse cards" }),
      ).toHaveAttribute("href", "/cards");
    });

    it("renders custom message when provided", () => {
      renderWithProviders(<PageNotFound message="Page does not exist." />);
      expect(screen.getByText("Page does not exist.")).toBeInTheDocument();
    });
  });

  describe("PageEmpty", () => {
    it("renders default message", () => {
      render(<PageEmpty />);
      expect(screen.getByText("No items to display.")).toBeInTheDocument();
    });

    it("renders custom message when provided", () => {
      render(<PageEmpty message="No cards found." />);
      expect(screen.getByText("No cards found.")).toBeInTheDocument();
    });
  });
});
