import { ILogger } from './logger';

export interface DotenvOptions {
  override?: OverrideType;
  debug?: boolean;
  path?: string;
  require?: boolean;
  environment?: string;
  encoding?: BufferEncoding;
  prefix?: string;
  removePrefix?: boolean;
  group?: boolean;
  logger?: ILogger;
}

export interface DotenvArgs {
  override: OverrideType;
  debug: boolean;
  path: string;
  require: boolean;
  environment: string;
  encoding: BufferEncoding;
  prefix?: string;
  removePrefix: boolean;
  group: boolean;
  logger?: ILogger;
}

export type OverrideType = 'NONE' | 'PARTIAL' | 'ALL';
