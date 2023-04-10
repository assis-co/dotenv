import { DotenvArgs, OverrideType } from '../types/dotenv';

const defaultArgs: DotenvArgs = {
  override: 'PARTIAL',
  debug: false,
  path: './',
  require: false,
  environment: process.env.NODE_ENV ?? 'development',
  encoding: 'utf-8',
  removePrefix: false,
  group: false,
};

if (process.env.DOTENV_ENCODING != null) {
  defaultArgs.encoding =
    process.env.DOTENV_ENCODING.toLowerCase() as BufferEncoding;
}

if (process.env.DOTENV_PATH != null) {
  defaultArgs.path = process.env.DOTENV_PATH;
}

if (process.env.DOTENV_OVERRIDE != null) {
  const mode = process.env.DOTENV_OVERRIDE.toUpperCase() as OverrideType;

  defaultArgs.override = mode;
}

if (process.env.DOTENV_DEBUG != null) {
  defaultArgs.debug = process.env.DOTENV_DEBUG.toLowerCase() === 'true';
}

if (process.env.DOTENV_PREFIX != null) {
  defaultArgs.prefix = process.env.DOTENV_PREFIX.toUpperCase();
}

if (process.env.DOTENV_REMOVE_PREFIX != null) {
  defaultArgs.removePrefix =
    process.env.DOTENV_REMOVE_PREFIX.toLowerCase() === 'true';
}

if (process.env.DOTENV_GROUP != null) {
  defaultArgs.group = process.env.DOTENV_GROUP.toLowerCase() === 'true';
}

export { defaultArgs };
