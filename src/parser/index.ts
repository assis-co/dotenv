import _ from 'lodash';

import { DotenvArgs } from '../types/dotenv';

const expr =
  /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;

export class Parser {
  private readonly options: DotenvArgs;
  private readonly obj: Record<string, unknown>;

  constructor(options: DotenvArgs) {
    this.options = options;
    this.obj = {};
  }

  parse(src: string) {
    const content = src.toString().replace(/\r\n?/gm, '\n');

    [...content.matchAll(expr)]
      .filter((m) => {
        return (
          this.options.prefix == null ||
          m[1].startsWith(`${this.options.prefix}_`)
        );
      })
      .forEach((m) => {
        console.log(m[1]);
        const k = this.key(m[1]);
        const val = this.value(m[2] || '');

        if (!this.options.group) {
          this.obj[k] = val;
        } else {
          this.group(k, val);
        }
      });

    return this.obj;
  }

  private key(k: string): string {
    if (this.options.prefix && this.options.removePrefix) {
      k = k.replace(new RegExp(`^${this.options.prefix}_`), ''); // remove prefix
    }
    return k;
  }

  private value(val: string) {
    if (val.startsWith('"')) {
      // new line
      val = val.replace(/\\n/g, '\n');
      val = val.replace(/\\r/g, '\r');
    }
    return val.trim().replace(/^(['"`])([\s\S]*)\1$/gm, '$2');
  }

  private group(k: string, v: string) {
    const result = k.match(/^([-a-zA-Z0-9]+)(_?)/);
    if (!result) return;

    const rootKey = result[1];
    const nKey = k.replace(/^([-a-zA-Z0-9]+)(_?)/, '');
    if (!nKey) {
      this.obj[rootKey] = this.value(v);
      return;
    } else {
      _.set(this.obj, k.replaceAll('_', '.'), this.value(v));
    }
  }
}
