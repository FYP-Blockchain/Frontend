import React from 'react';

interface ErrorBoundaryState { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
     constructor(props: React.PropsWithChildren) {
          super(props);
          this.state = { hasError: false };
     }

     static getDerivedStateFromError(error: Error): ErrorBoundaryState {
          return { hasError: true, error };
     }

     componentDidCatch(error: Error, info: React.ErrorInfo) {
          console.error('UI ErrorBoundary caught:', error, info);
     }

     render() {
          if (this.state.hasError) {
               return (
                    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                         <h1 className="text-2xl font-bold mb-2">Something went wrong.</h1>
                         <p className="text-sm text-muted-foreground mb-4">{this.state.error?.message}</p>
                         <button onClick={() => location.reload()} className="px-4 py-2 rounded bg-primary text-primary-foreground">Reload</button>
                    </div>
               );
          }
          return this.props.children;
     }
}

export default ErrorBoundary;
