import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DotenvArgs } from '../types/dotenv';

beforeEach(() => {
  vi.resetModules();
});

describe('config', () => {
  describe('given options values from system env vars', async () => {
    process.env.DOTENV_ENCODING = 'latin1';
    process.env.DOTENV_PATH = './envs';
    process.env.DOTENV_OVERRIDE = 'NONE';
    process.env.DOTENV_DEBUG = 'true';
    process.env.DOTENV_PREFIX = 'assis';
    process.env.DOTENV_REMOVE_PREFIX = 'TRUE';
    process.env.DOTENV_GROUP = 'TRUE';

    const configModule = import('../config');
    const defaultArgs: DotenvArgs = (await configModule).defaultArgs;

    it('the values loaded with success', () => {
      expect(defaultArgs.encoding).toEqual('latin1');
      expect(defaultArgs.path).toEqual('./envs');
      expect(defaultArgs.override).toEqual('NONE');
      expect(defaultArgs.debug).toEqual(true);
      expect(defaultArgs.prefix).toEqual('ASSIS');
      expect(defaultArgs.removePrefix).toEqual(true);
      expect(defaultArgs.group).toEqual(true);
    });
  });

  describe('no given config values from system env vars', () => {
    delete process.env.DOTENV_ENCODING;
    delete process.env.DOTENV_PATH;
    delete process.env.DOTENV_OVERRIDE;
    delete process.env.DOTENV_DEBUG;
    delete process.env.DOTENV_PREFIX;
    delete process.env.DOTENV_REMOVE_PREFIX;
    delete process.env.DOTENV_GROUP;

    it('the default values loaded with success', async () => {
      const configModule = import('../config');
      const defaultArgs: DotenvArgs = (await configModule).defaultArgs;

      expect(defaultArgs.encoding).toEqual('utf-8');
      expect(defaultArgs.path).toEqual('./');
      expect(defaultArgs.override).toEqual('PARTIAL');
      expect(defaultArgs.debug).toEqual(false);
      expect(defaultArgs.prefix).toBeUndefined();
      expect(defaultArgs.removePrefix).toEqual(false);
      expect(defaultArgs.group).toEqual(false);
    });
  });
});
