import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="bg-white/5 border border-rose-500/30 rounded-3xl p-8 text-center space-y-4"
      >
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" aria-hidden="true" />
        <div>
          <h3 className="text-base font-bold text-white">
            {this.props.fallbackTitle || 'Something went wrong'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {this.state.error?.message || 'An unexpected error occurred while rendering this section.'}
          </p>
        </div>
        <button
          type="button"
          onClick={this.handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }
}
