import { Component, ReactNode } from "react";
import { AlertOctagon } from "lucide-react";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

// Catches unexpected render-time errors anywhere below it in the tree and
// swaps in a friendly fallback instead of a blank white screen.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cream text-brown">
            <AlertOctagon size={26} />
          </div>
          <h1 className="font-display text-2xl text-ink">Something broke on our end</h1>
          <p className="mt-2 max-w-sm text-graphite">
            The page hit an unexpected error. Reloading usually fixes it.
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
