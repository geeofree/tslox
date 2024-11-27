export class Environment {
  private values: Map<string, Object | null>;
  private enclosing: Environment | null;

  constructor(enclosing?: Environment) {
    this.values = new Map();
    this.enclosing = enclosing ?? null;
  }

  get(key: string): Object | null {
    if (this.values.has(key)) {
      return this.values.get(key) ?? null;
    }

    if (this.enclosing) {
      return this.enclosing.get(key);
    }

    throw new Error(`Undefined variable: ${key}.`);
  }

  set(key: string, value: Object | null): void {
    this.values.set(key, value);
  }

  assign(key: string, value: Object | null): void {
    if (this.values.has(key)) {
      return this.set(key, value);
    }

    if (this.enclosing) {
      return this.enclosing.assign(key, value);
    }

    throw new Error(`Undefined variable: ${key}`);
  }
}
