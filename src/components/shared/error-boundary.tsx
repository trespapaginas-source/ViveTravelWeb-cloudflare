import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * ErrorBoundary — captura errores de runtime en cualquier subárbol de React
 * y evita la pantalla blanca (White Screen of Death).
 *
 * En lugar de desmontar toda la app, renderiza un estado de recuperación con
 * un botón para reintentar (resetea el estado del error) y otro para recargar
 * la página (resuelve casos donde el error viene de un caché de ruta viejo).
 *
 * Uso: envolver <App/> o rutas críticas. El error original se loguea a consola
 * para facilitar el debug, pero el usuario nunca ve una pantalla vacía.
 */
interface Props {
  children: ReactNode;
  /** Elemento opcional para personalizar el fallback. Si se omite, usa el UI por defecto. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log para debug (no se muestra al usuario).
    console.error("[ErrorBoundary] Error capturado:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-7 w-7 text-neutral-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Algo salió mal
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Hubo un problema al cargar esta página. Podés intentar de nuevo o
              recargar el sitio.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
