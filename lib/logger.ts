type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerOptions {
  label?: string;
}

const isProduction = process.env.NODE_ENV === 'production';

function getTimestamp() {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, message: string, label?: string) {
  const parts = [`[${getTimestamp()}]`, `[${level.toUpperCase()}]`];
  if (label) parts.push(`[${label}]`);
  parts.push(message);
  return parts.join(' ');
}

export class Logger {
  private label?: string;

  constructor(options?: LoggerOptions) {
    this.label = options?.label;
  }

  info(message: string, ...optionalParams: any[]) {
    console.info(formatMessage('info', message, this.label), ...optionalParams);
  }

  warn(message: string, ...optionalParams: any[]) {
    console.warn(formatMessage('warn', message, this.label), ...optionalParams);
  }

  error(message: string, ...optionalParams: any[]) {
    console.error(formatMessage('error', message, this.label), ...optionalParams);
  }

  debug(message: string, ...optionalParams: any[]) {
    if (!isProduction) {
      console.debug(formatMessage('debug', message, this.label), ...optionalParams);
    }
  }
}

// Default global logger
const logger = new Logger();

export default logger;
