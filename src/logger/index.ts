import { ILogger } from '../types';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DefaultLogger implements ILogger {
  private readonly debugEnabled: boolean;

  constructor(debugEnabled: boolean) {
    this.debugEnabled = debugEnabled;
  }

  debug = (message: string, meta?: any) => {
    if (this.debugEnabled) console.debug(message, meta);
  };
  info = (message: string, meta?: any) => console.info(message, meta);
  warn = (message: string, meta?: any) => console.warn(message, meta);
  error = (message: string, meta?: any) => console.error(message, meta);
}
/* eslint-enable @typescript-eslint/no-explicit-any */
