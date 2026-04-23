import React from 'react';

/**
 * Error Boundary component — catches errors and shows user-friendly message
 * Wrap the entire app in this to prevent blank white screen crashes
 */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log full error details to console for debugging
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
          <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-lg text-center">
            {/* Error Icon */}
            <div className="mb-6 text-6xl">⚠️</div>

            {/* Error Title */}
            <h1 className="text-3xl font-black text-navy mb-2">Oops!</h1>
            <p className="text-slate-600 mb-6">
              Something went wrong. We're really sorry! Try refreshing the page.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 mb-6 p-4 bg-red-50 rounded-lg border border-red-200 text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-red-700 mb-2">
                  <strong>Error:</strong> {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <p className="text-xs font-mono text-red-600">
                    <strong>Stack:</strong> {this.state.errorInfo.componentStack}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={this.handleRefresh}
                className="flex-1 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
              >
                🔄 Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-brand hover:text-brand"
              >
                🏠 Go Home
              </button>
            </div>

            {/* Support Message */}
            <p className="mt-6 text-xs text-slate-500">
              If the problem persists, please contact support or clear your browser cache.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
