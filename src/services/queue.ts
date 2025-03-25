import logger from "./logger";

interface MessageQueueHandler {
  (message: NotificationMessage, ack: () => void): void;
}

export interface NotificationMessage {
  type: "email" | "sms";
  recipient: string;
  message: string;
  userId: number;
  attempts: number;
}

export interface MessageQueue {
  send(message: NotificationMessage): void;
  listen(handler: MessageQueueHandler): void;
  stop(): void;
}

export class InMemoryQueue implements MessageQueue {
  private queue: NotificationMessage[] = [];
  private handler: MessageQueueHandler | null = null;
  private processing = false;
  private rateLimit: number;
  private windowMs: number;
  private timer: NodeJS.Timeout | null = null;

  constructor(rateLimit: number, windowMs: number) {
    if (isNaN(rateLimit) || rateLimit <= 0) {
      throw new Error("Rate limit must be a positive number");
    }
    if (isNaN(windowMs) || windowMs <= 0) {
      throw new Error("Window size must be a positive number");
    }
    this.rateLimit = rateLimit;
    this.windowMs = windowMs;
    this.startProcessing();
  }

  send(message: NotificationMessage): void {
    this.queue.push(message);
    logger.info("Message queued", {
      userId: message.userId,
      type: message.type,
    });
  }

  listen(handler: MessageQueueHandler): void {
    this.handler = handler;
  }

  private startProcessing(): void {
    const interval = Math.ceil(this.windowMs / this.rateLimit);

    this.timer = setInterval(() => {
      if (!this.processing && this.queue.length > 0 && this.handler) {
        this.processing = true;
        const message = this.queue[0];

        this.handler(message, () => {
          this.queue.shift();
          this.processing = false;
        });
      }
    }, interval);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
