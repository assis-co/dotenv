import { describe, expect, it } from 'vitest';

import { defaultArgs } from '../config';
import { Parser } from '../parser';

describe('parser', () => {
  describe('when prefix is false', () => {
    const parser = new Parser(defaultArgs);
    const env = `DATABASE_POSTGRES_USER=sample$@2213
    DATABASE_POSTGRES_PASSWORD="password@quote"
    CERTIFICATE="-----BEGIN PRIVATE KEY-----\\nAndoi21he8qhsad8zhjkzcnjkahd2 \\n-----END PRIVATE KEY-----\\n"`;
    const parsed = parser.parse(env);
    it('the content is parsed with success', () => {
      expect(parsed.DATABASE_POSTGRES_USER).toEqual('sample$@2213');
      expect(parsed.DATABASE_POSTGRES_PASSWORD).toEqual('password@quote');
      expect(parsed.CERTIFICATE).toEqual(
        '-----BEGIN PRIVATE KEY-----\nAndoi21he8qhsad8zhjkzcnjkahd2 \n-----END PRIVATE KEY-----\n'
      );
    });
  });

  describe('when prefix is true', () => {
    const env = `ASSIS_DOTENV_DATABASE_POSTGRES_USER=sample$@2213
                 ASSIS_DOTENV_DATABASE_POSTGRES_PASSWORD="password@quote"
                 DEBUG=false`;

    describe('and remove_prefix is false', () => {
      const parser = new Parser({
        ...defaultArgs,
        ...{
          prefix: 'ASSIS_DOTENV',
          removePrefix: false,
        },
      });
      const parsed = parser.parse(env);

      it('the only prefixed values are parsed', () => {
        expect(parsed.ASSIS_DOTENV_DATABASE_POSTGRES_USER).toEqual(
          'sample$@2213'
        );
        expect(parsed.ASSIS_DOTENV_DATABASE_POSTGRES_PASSWORD).toEqual(
          'password@quote'
        );
        expect(parsed.DEBUG).toBeUndefined();
      });
    });

    describe('and remove_prefix is true', () => {
      const parser = new Parser({
        ...defaultArgs,
        ...{
          prefix: 'ASSIS_DOTENV',
          removePrefix: true,
        },
      });
      const parsed = parser.parse(env);

      it('the only prefixed values are parsed', () => {
        expect(parsed.DATABASE_POSTGRES_USER).toEqual('sample$@2213');
        expect(parsed.DATABASE_POSTGRES_PASSWORD).toEqual('password@quote');
        expect(parsed.ASSIS_DOTENV_DATABASE_POSTGRES_USER).toBeUndefined();
        expect(parsed.DEBUG).toBeUndefined();
      });
    });
  });

  describe('when grouping is true', () => {
    const parser = new Parser({ ...defaultArgs, ...{ group: true } });
    const env = `DATABASE_POSTGRES_USER=sample$@2213
    DATABASE_POSTGRES_PASSWORD="password@quote"
    CERTIFICATE="-----BEGIN PRIVATE KEY-----\\nAndoi21he8qhsad8zhjkzcnjkahd2 \\n-----END PRIVATE KEY-----\\n"`;
    const parsed = parser.parse(env);

    it('values will be grouped', () => {
      expect(parsed.DATABASE).toMatchObject({
        POSTGRES: { USER: 'sample$@2213', PASSWORD: 'password@quote' },
      });
    });
  });
});
