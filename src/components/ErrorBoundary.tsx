import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] p-6 text-[#1F1E1D]">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#E8E2D8] p-8 text-center">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold font-serif mb-2 text-[#2A231C]">
              Something unexpected occurred
            </h1>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              RoomRevive encountered an issue while loading this view. You can reload the app to continue.
            </p>
            {this.state.error && (
              <div className="mb-6 p-3 bg-stone-50 rounded-lg text-left border border-stone-200 overflow-x-auto text-xs font-mono text-stone-700 max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#8C6849] hover:bg-[#78573C] text-white font-medium text-sm rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
