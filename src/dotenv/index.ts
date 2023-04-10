import fs from 'fs';
import path from 'path';

import * as _ from 'lodash';

import { defaultArgs } from '../config';
import { DefaultLogger } from '../logger';
import { Parser } from '../parser';
import { DotenvOptions, ILogger } from '../types';
import { DotenvArgs } from '../types/dotenv';

export class Dotenv {
  private readonly options: DotenvArgs;
  private readonly parser: Parser;
  private readonly logger: ILogger;

  constructor(opts?: DotenvOptions) {
    this.options = { ...defaultArgs, ...opts };
    this.parser = new Parser(this.options);
    this.logger = this.options.logger ?? new DefaultLogger(this.options.debug);
    this.load();
  }

  load() {
    const envFiles = this.getEnvs();
    const systemVars = Object.keys(process.env);
    const envVars: Record<string, unknown> = {};

    if (this.options.require && envFiles.length <= 0) {
      const err = new Error(
        `None .env file detected at '${this.options.path}'`
      );
      this.logger.error('Error on load dotenv', err);
      throw err;
    }

    envFiles.forEach((env) => {
      this.logger.debug(
        `Loading the env file '${env}' at ${this.options.path}`
      );
      const src = fs.readFileSync(path.resolve(this.options.path, env), {
        encoding: this.options.encoding,
      });
      const parsed = this.parser.parse(src);
      Object.keys(parsed).forEach((k) => {
        switch (this.options.override) {
          case 'ALL':
            envVars[k] = parsed[k];
            break;
          case 'PARTIAL':
            if (!systemVars.includes(k)) envVars[k] = parsed[k];
            break;
          case 'NONE':
            if (!systemVars.includes(k) && !Object.keys(envVars).includes(k))
              envVars[k] = parsed[k];
        }
      });
    });

    Object.keys(envVars).forEach((k) => {
      this.logger.debug(`Setting '${k}' => '${envVars[k] as string}'`);

      _.set(process.env, k, envVars[k]);
    });

    return;
  }

  private getEnvs(): string[] {
    return [
      `.env`,
      `.env.${this.options.environment}`,
      `.env.${this.options.environment}.local`,
      `.env.local`,
    ].filter((f) => {
      const dotenvPath = path.resolve(this.options.path, f);
      return fs.existsSync(dotenvPath);
    });
  }

  static config(opts?: DotenvArgs): void {
    new Dotenv(opts);
  }
}
