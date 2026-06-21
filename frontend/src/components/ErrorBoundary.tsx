import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Erro nao tratado na interface:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem' }}>
          <h1>Algo deu errado</h1>
          <p>Recarregue a página. Se o problema persistir, contate o suporte.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
