import { render, screen } from "@testing-library/react";
import {
  PageLoading,
  PageError,
  PageNotFound,
  PageEmpty,
} from "@/components/PageStates";

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
      render(<PageNotFound />);
      expect(screen.getByText("Not found.")).toBeInTheDocument();
    });

    it("renders custom message when provided", () => {
      render(<PageNotFound message="Page does not exist." />);
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
