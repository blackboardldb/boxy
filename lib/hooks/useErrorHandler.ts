import { useState, useCallback } from "react";

interface ErrorHandlerOptions {
  logError?: boolean;
  fallbackMessage?: string;
}

interface ErrorState {
  error: Error | null;
  isError: boolean;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    logError = true,
    fallbackMessage = "Ha ocurrido un error inesperado",
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
  });

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));

      if (logError) {
        console.error("Error handled:", errorObj);
      }

      setErrorState({
        error: errorObj,
        isError: true,
      });

      return errorObj;
    },
    [logError]
  );

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
    });
  }, []);

  const handleAsyncError = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      customMessage?: string
    ): Promise<T | null> => {
      try {
        clearError();
        return await asyncFn();
      } catch (error) {
        handleError(error, customMessage);
        return null;
      }
    },
    [handleError, clearError]
  );

  return {
    error: errorState.error,
    isError: errorState.isError,
    handleError,
    clearError,
    handleAsyncError,
  };
}
