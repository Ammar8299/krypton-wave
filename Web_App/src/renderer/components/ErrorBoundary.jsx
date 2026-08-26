import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          width: '100vw',
          backgroundColor: '#0a0d0a',
          color: '#e0ffe0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'monospace',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: 'rgba(255, 51, 102, 0.1)',
            border: '1px solid #ff3366',
            borderRadius: 8,
            padding: 24,
            maxWidth: 600,
            width: '100%',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#ff3366', margin: '0 0 12px 0', fontSize: 16 }}>
              ⚠️ UI RENDERING ERROR CAUGHT
            </h2>
            <div style={{ color: '#ff8899', fontSize: 12, marginBottom: 16, wordBreak: 'break-all' }}>
              {this.state.error?.toString()}
            </div>
            <button
              onClick={this.handleReset}
              style={{
                background: '#00ff41',
                color: '#000',
                border: 'none',
                padding: '8px 20px',
                borderRadius: 4,
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}
            >
              RELOAD APPLICATION
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
