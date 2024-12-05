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

  getAt(distance: number, name: string): Object | null {
    return this.ancestor(distance).values.get(name) ?? null;
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

  assignAt(distance: number, key: string, value: Object | null): void {
    this.ancestor(distance).values.set(key, value);
  }

  private ancestor(distance: number) {
    let environment: Environment = this;
    for (let i = 0; i < distance; i++) {
      if (environment.enclosing) {
        environment = environment.enclosing;
      }
    }
    return environment;
  }
}
