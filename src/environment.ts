export class Environment {
  private values: Map<string, Object | null>;

  constructor() {
    this.values = new Map();
  }

  get(key: string): Object | null {
    return this.values.get(key) ?? null;
  }

  set(key: string, value: Object | null): void {
    this.values.set(key, value);
  }

  assign(key: string, value: Object | null): void {
    if (this.values.has(key)) {
      return this.set(key, value);
    }

    throw new Error(`Undefined variable: ${key}`);
  }
}
