export class Environment {
  public values: Map<string, Object | null>;

  constructor() {
    this.values = new Map();
  }

  get(key: string): Object | null {
    const value = this.values.get(key);

    if (value !== undefined) {
      return value;
    }

    throw new Error(`Undefined variable name: ${key}.`);
  }

  add(key: string, value: Object | null): void {
    this.values.set(key, value);
  }

  remove(key: string): void {
    this.values.delete(key);
  }
}
