import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected error occurred.',
    };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('MUSAFIR ErrorBoundary caught:', error, info);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f7f5f0] text-[#141714] flex items-center justify-center p-6">
          <div className="bg-white rounded-[28px] border border-black/10 p-8 max-w-lg text-center shadow-lg space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1d4738]">
              MUSAFIR
            </p>
            <h1 className="font-editorial text-2xl font-semibold">
              Something went wrong
            </h1>
            <p className="text-sm text-[#5a6159]">
              Please reload the page to restore your session.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-[#1d4738] text-white text-sm font-semibold px-6 py-2.5 rounded-full cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
