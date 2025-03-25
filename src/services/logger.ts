import chalk from "chalk";

interface LoggerOptions {
  useColors: boolean;
}

interface LogContext extends Record<string, any> {}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
}

class Logger {
  private static instance: Logger;
  private useColors: boolean;

  private constructor(options: LoggerOptions) {
    this.useColors = options.useColors;
  }

  public static getInstance(
    options: LoggerOptions = { useColors: false }
  ): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(options);
    }
    return Logger.instance;
  }

  private formatLog(
    level: string,
    message: string,
    context?: LogContext
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
    };
  }

  private log(
    level: string,
    color: (text: string) => string,
    message: string,
    context?: LogContext
  ) {
    const logEntry = this.formatLog(level, message, context);
    const logString = JSON.stringify(logEntry);

    console.log(this.useColors ? color(logString) : logString);
  }

  public error(message: string, context?: LogContext) {
    this.log("ERROR", chalk.red, message, context);
  }

  public warn(message: string, context?: LogContext) {
    this.log("WARN", chalk.yellow, message, context);
  }

  public info(message: string, context?: LogContext) {
    this.log("INFO", chalk.blue, message, context);
  }

  public debug(message: string, context?: LogContext) {
    this.log("DEBUG", chalk.gray, message, context);
  }
}

export default Logger.getInstance({
  useColors: process.env.NODE_ENV === "development",
});
