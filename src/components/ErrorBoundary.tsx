import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Trip Optimizer crashed:', error, info.componentStack);
  }

  handleReset = () => {
    // a full reload clears whatever state triggered the crash, not just the error flag
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Algo se rompió</h1>
          <p className="text-sm text-ink-soft">
            Tuvimos un error inesperado armando tu itinerario. Puedes intentar de nuevo — si vuelve a pasar,
            cuéntame qué estabas haciendo justo antes.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-2xl bg-terracotta px-5 py-3 text-sm font-semibold text-paper shadow-soft"
          >
            Volver a intentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
