import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Dotenv } from '../dotenv';
import { DotenvOptions } from '../types';

beforeEach(() => {
  vi.resetModules();
});

describe('dotenv', () => {
  describe('#require', () => {
    describe('when require is true', () => {
      const opts = {
        require: true,
        path: './none',
      };
      describe('and not have .env file ', () => {
        it('exception are throw', () => {
          expect(() => new Dotenv(opts)).toThrowError(
            new Error(`None .env file detected at '${opts.path}'`)
          );
        });
      });

      describe('and have .env file ', () => {
        it('initialize with success', () => {
          opts.path = './test-data';
          expect(() => new Dotenv(opts)).not.toThrowError();
        });
      });
    });

    describe('when require is false', () => {
      const opts = {
        require: false,
        path: './none',
      };
      describe('and not have .env file ', () => {
        it('initialize with success', () => {
          expect(() => new Dotenv(opts)).not.toThrowError();
        });
      });

      describe('and have .env file ', () => {
        it('initialize with success', () => {
          opts.path = './test-data';
          expect(() => new Dotenv(opts)).not.toThrowError();
        });
      });
    });
  });

  describe('#load', () => {
    describe('.env.local', () => {
      describe("when override are 'PARTIAL'", () => {
        it('the values of other env files will be replaced', () => {
          process.env = {};
          new Dotenv({
            path: './test-data',
            override: 'PARTIAL',
          });

          expect(process.env.ASSIS_DOTENV_DATABASE_POSTGRES_HOST).toEqual(
            '127.0.0.1'
          );
          expect(process.env.ASSIS_DOTENV_ONLY_LOCAL).toEqual('true');
          expect(process.env.ASSIS_DOTENV_APP_STAGE).toEqual('local');
        });

        it('the values of system vars will be preserved', () => {
          process.env = {};
          process.env.ASSIS_DOTENV_NODE_ENV = 'system';
          new Dotenv({
            path: './test-data',
            override: 'PARTIAL',
          });
          expect(process.env.ASSIS_DOTENV_NODE_ENV).toEqual('system');
        });
      });

      describe("when override are 'ALL", () => {
        it('the values of other env files will be replaced', () => {
          process.env = {};
          new Dotenv({
            path: './test-data',
            override: 'ALL',
          });

          expect(process.env.ASSIS_DOTENV_DATABASE_POSTGRES_HOST).toEqual(
            '127.0.0.1'
          );
          expect(process.env.ASSIS_DOTENV_ONLY_LOCAL).toEqual('true');
          expect(process.env.ASSIS_DOTENV_APP_STAGE).toEqual('local');
        });

        it('the values of system vars will be replaced', () => {
          process.env = {};
          process.env.ASSIS_DOTENV_NODE_ENV = 'system';
          new Dotenv({
            path: './test-data',
            override: 'ALL',
          });
          expect(process.env.ASSIS_DOTENV_NODE_ENV).toEqual('local');
        });
      });

      describe("when override are 'NONE", () => {
        it('the values will be preserved in order', () => {
          process.env = {};
          process.env.ASSIS_DOTENV_NODE_ENV = 'system';
          new Dotenv({
            path: './test-data',
            override: 'NONE',
          });
          expect(process.env.ASSIS_DOTENV_DATABASE_POSTGRES_HOST).toEqual(
            'localhost'
          );
          expect(process.env.ASSIS_DOTENV_APP_STAGE).toEqual('dev');
          expect(process.env.ASSIS_DOTENV_ONLY_LOCAL).toEqual('true');
          expect(process.env.ASSIS_DOTENV_NODE_ENV).toEqual('system');
        });
      });
    });

    describe('.env.<environment>', () => {
      const opts = {
        path: './test-data',
        environment: 'custom',
        override: 'PARTIAL',
      };

      it('the values will be loaded with success', () => {
        process.env = {};
        new Dotenv(opts as DotenvOptions);
        expect(process.env.ASSIS_DOTENV_ONLY_CUSTOM).toEqual('true');
        expect(process.env.ASSIS_DOTENV_ONLY_CUSTOM_LOCAL).toEqual('true');
      });

      it('and in the correct order', () => {
        process.env = {};
        new Dotenv(opts as DotenvOptions);
        expect(process.env.ASSIS_DOTENV_APP_STAGE_ROOT).toEqual('dev'); //.env

        expect(process.env.ASSIS_DOTENV_APP_STAGE_CUSTOM).toEqual('custom'); //env.<environment>
        expect(process.env.ASSIS_DOTENV_APP_STAGE_CUSTOM_LOCAL).toEqual(
          'custom_local'
        ); //env.<environment>.local
        expect(process.env.ASSIS_DOTENV_APP_STAGE).toEqual('local'); //.env.local
      });
    });
  });

  describe('#prefix', () => {
    describe("when prefix are 'ASSIS_DOTENV'", () => {
      it('only vars if starts with prefix will be loaded', () => {
        process.env = {};
        new Dotenv({
          path: './test-data',
          override: 'PARTIAL',
          prefix: 'ASSIS_DOTENV',
        });
        expect(process.env.ASSIS_DOTENV_APP_STAGE_ROOT).toEqual('dev'); //.env
        expect(process.env.ASSIS_DOTENV_APP_STAGE).toEqual('local'); //.env.local
        expect(process.env.APP_PORT).toBeUndefined();
      });

      describe('when removePrefix is enabled', () => {
        it('the prefix will be removed from var name', () => {
          process.env = {};
          new Dotenv({
            path: './test-data',
            override: 'PARTIAL',
            prefix: 'ASSIS_DOTENV',
            removePrefix: true,
          });

          expect(process.env.APP_STAGE_ROOT).toEqual('dev'); //.env
          expect(process.env.APP_STAGE).toEqual('local'); //.env.local
          expect(process.env.ASSIS_DOTENV_APP_STAGE_ROOT).toBeUndefined(); //.env
          expect(process.env.ASSIS_DOTENV_APP_STAGE).toBeUndefined(); //.env.local
          expect(process.env.APP_PORT).toBeUndefined();
        });
      });
    });
  });

  describe('#group', () => {
    describe('when group is enabled', () => {
      it('the envs will be group by path', () => {
        process.env = {};
        new Dotenv({
          path: './test-data',
          override: 'PARTIAL',
          prefix: 'ASSIS_DOTENV',
          removePrefix: true,
          group: true,
        });

        expect(process.env.DATABASE).toMatchObject({
          POSTGRES: { USER: 'sample$@2213', PASSWORD: 'password@quote' },
        });
        const app = process.env.APP as unknown as {
          STAGE: string;
        };
        expect(app.STAGE).toEqual('local'); //.env
        expect(process.env['APP-NAME']).toEqual('assis-dotenv');
      });
    });
  });
});
