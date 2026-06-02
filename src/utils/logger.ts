export interface LoggerLike {
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, metadata?: Record<string, unknown>): void;
}

const formatMetadata = (metadata?: Record<string, unknown>): string => {
  if (!metadata || Object.keys(metadata).length === 0) {
    return "";
  }

  try {
    return ` ${JSON.stringify(metadata)}`;
  } catch {
    return " [unserializable metadata]";
  }
};

export const createDefaultLogger = (): LoggerLike => ({
  info(message, metadata) {
    console.info(`[fireaccess] ${message}${formatMetadata(metadata)}`);
  },
  warn(message, metadata) {
    console.warn(`[fireaccess] ${message}${formatMetadata(metadata)}`);
  },
  error(message, metadata) {
    console.error(`[fireaccess] ${message}${formatMetadata(metadata)}`);
  },
});

export const createLogger = (logger?: Partial<LoggerLike>): LoggerLike => {
  const fallback = createDefaultLogger();

  return {
    info(message, metadata) {
      if (logger?.info) {
        logger.info(message, metadata);
        return;
      }

      fallback.info(message, metadata);
    },
    warn(message, metadata) {
      if (logger?.warn) {
        logger.warn(message, metadata);
        return;
      }

      fallback.warn(message, metadata);
    },
    error(message, metadata) {
      if (logger?.error) {
        logger.error(message, metadata);
        return;
      }

      fallback.error(message, metadata);
    },
  };
};
