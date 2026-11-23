import { Component, type ErrorInfo, type ReactNode } from "react";
import { buttonClasses } from "@/components/ui/buttonClasses";

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

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, info.componentStack);
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
        <section
          role="alert"
          className="mx-auto flex min-h-[50vh] max-w-160 flex-col items-center justify-center gap-5 py-12 text-center"
        >
          <h2 className="font-display text-primaryText flex flex-wrap items-baseline justify-center gap-x-3.5 text-[30px] leading-[1.2] font-bold [text-shadow:2px_2px_0_rgba(0,0,0,0.55)]">
            Something went wrong
            <span
              aria-hidden
              lang="ja"
              className="font-jp text-accentAmber text-[22px] font-normal text-shadow-none"
            >
              エラー
            </span>
          </h2>
          <p className="text-secondaryText max-w-md text-pretty">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={this.handleReset}
              className={buttonClasses()}
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={buttonClasses("ghost")}
            >
              Refresh page
            </button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
