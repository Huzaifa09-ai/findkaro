import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, ErrorState> {
  declare state: ErrorState;
  declare props: Props;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>Application Error</h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '14px' }}>
              An error occurred while initializing the application. Please check your browser console for details.
            </p>
            <p style={{ color: '#9ca3af', fontSize: '12px', fontFamily: 'monospace', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px', marginBottom: '1.5rem' }}>
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1f2937',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
