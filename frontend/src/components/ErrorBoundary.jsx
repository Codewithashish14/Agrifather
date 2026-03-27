import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service if needed
    // console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Something went wrong.</h1>
          <p className="text-gray-700 mb-4">Please refresh the page or contact support if the problem persists.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
