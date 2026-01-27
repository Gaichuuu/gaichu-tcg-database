import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
          <h2 className="text-errorText mb-4 text-xl font-bold">
            Something went wrong
          </h2>
          <p className="text-secondaryText mb-6 max-w-md text-center">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <div className="flex gap-4">
            <button
              onClick={this.handleReset}
              className="bg-interactiveText rounded px-4 py-2 text-white"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="border-secondaryBorder rounded border px-4 py-2"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
