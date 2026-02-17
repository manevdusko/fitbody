import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">
              Се случи грешка
            </h1>
            
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Извинете, се случи неочекувана грешка. Ве молиме освежете ја страницата или обидете се повторно.
            </p>
            
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Освежи страница
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Почетна страница
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left bg-gray-900 p-4 rounded-lg">
                <summary className="cursor-pointer text-red-400 font-semibold mb-2">
                  Детали за грешката (development mode)
                </summary>
                <pre className="text-xs text-gray-300 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;