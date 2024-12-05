import { Environment } from "./environment";
import { FuncDeclStmt } from "./grammar";
import { Interpreter } from "./interpreter";

export abstract class LoxCallable {
  abstract arity(): number;
  abstract call(
    interpreter: Interpreter,
    args: Array<Object | null>,
  ): Object | null;
}

export class ClockLoxCallable extends LoxCallable {
  arity(): number {
    return 0;
  }

  call(interpreter: Interpreter, args: Array<Object | null>): Object | null {
    return Date.now() / 1000;
  }
}

export class LoxFunction extends LoxCallable {
  private declaration: FuncDeclStmt;
  private closure: Environment;

  constructor(declaration: FuncDeclStmt, closure: Environment) {
    super();
    this.declaration = declaration;
    this.closure = closure;
  }

  arity(): number {
    return this.declaration.params.length;
  }

  call(interpreter: Interpreter, args: Array<Object | null>): Object | null {
    const environment = new Environment(this.closure);
    this.declaration.params.forEach((param, i) => {
      if (param.literal) {
        environment.set(param.literal, args[i]);
      }
    });
    try {
      interpreter.executeBlock(this.declaration.body.statements, environment);
    } catch (error: unknown) {
      if (error instanceof Return) {
        return error.value;
      }
    }
    return null;
  }
}

export class Return extends Error {
  public value: Object | null;

  constructor(value: Object | null) {
    super();
    this.value = value;
  }
}
