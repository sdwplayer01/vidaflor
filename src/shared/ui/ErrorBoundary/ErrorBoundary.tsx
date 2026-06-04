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
    console.error('[VidaFlor] Erro capturado pelo ErrorBoundary:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight:      '100vh',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        '24px',
          background:     '#fdf6f0',
          fontFamily:     'system-ui, sans-serif',
          textAlign:      'center',
          gap:            16,
        }}>
          <div style={{ fontSize: 48 }}>🌸</div>
          <h2 style={{ margin: 0, fontSize: 20, color: '#3c1c24' }}>
            Algo deu errado
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: '#888', maxWidth: 320 }}>
            O aplicativo encontrou um erro inesperado. Recarregue para continuar.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding:      '10px 24px',
              borderRadius: 12,
              border:       'none',
              background:   '#c1566b',
              color:        '#fff',
              fontSize:     14,
              fontWeight:   700,
              cursor:       'pointer',
            }}
          >
            Recarregar
          </button>
          {import.meta.env.DEV && (
            <pre style={{
              fontSize:    10,
              color:       '#999',
              maxWidth:    400,
              overflow:    'auto',
              textAlign:   'left',
              background:  '#f5f5f5',
              padding:     8,
              borderRadius: 8,
            }}>
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
