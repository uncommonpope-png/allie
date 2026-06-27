import { Component, type ErrorInfo, type ReactNode } from 'react'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  error: Error | null
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Containment Observatory crashed', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-screen bg-void text-text-primary p-6 font-mono">
        <div className="glass-panel p-5 max-w-3xl mx-auto mt-10 border-danger">
          <div className="text-danger text-xs tracking-widest mb-3">CONTAINMENT OBSERVATORY CRASHED</div>
          <h1 className="text-lg font-bold mb-3">Runtime error caught instead of black screen</h1>
          <pre className="text-xs text-text-secondary whitespace-pre-wrap overflow-auto">
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
        </div>
      </div>
    )
  }
}
