export interface LoggerLike {
  debug(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, metadata?: Record<string, unknown>): void;
}

const write = (
  level: "debug" | "info" | "warn" | "error",
  message: string,
  metadata?: Record<string, unknown>,
): void => {
  const line = metadata ? `${message} ${JSON.stringify(metadata)}` : message;
  console[level](`[fireaccess] ${line}`);
};

export const createDefaultLogger = (): LoggerLike => ({
  debug: (message, metadata) => write("debug", message, metadata),
  info: (message, metadata) => write("info", message, metadata),
  warn: (message, metadata) => write("warn", message, metadata),
  error: (message, metadata) => write("error", message, metadata),
});

export const createLogger = (logger?: Partial<LoggerLike>): LoggerLike => {
  const fallback = createDefaultLogger();

  return {
    debug: logger?.debug ?? fallback.debug,
    info: logger?.info ?? fallback.info,
    warn: logger?.warn ?? fallback.warn,
    error: logger?.error ?? fallback.error,
  };
};
