import {
  AssignmentExpr,
  BinaryExpr,
  BlockStmt,
  CallExpr,
  Expr,
  ExprStmt,
  ExprVisitor,
  FuncDeclStmt,
  GroupingExpr,
  IfStmt,
  LiteralExpr,
  LogicalExpr,
  PrintStmt,
  ReturnStmt,
  Stmt,
  StmtVisitor,
  UnaryExpr,
  VarDeclStmt,
  VariableExpr,
  WhileStmt,
} from "./grammar";
import { Environment } from "./environment";
import { TokenTypes } from "./token";
import { ClockLoxCallable, LoxCallable, LoxFunction, Return } from "./callable";

export class Interpreter implements ExprVisitor, StmtVisitor {
  public statements: Stmt[];
  public globals: Environment;
  public environment: Environment;

  constructor(statements: Stmt[]) {
    this.statements = statements;
    this.globals = new Environment();
    this.globals.set("clock", new ClockLoxCallable());
    this.environment = this.globals;
  }

  interpret() {
    try {
      this.statements.forEach(statement => {
        this.execute(statement);
      });
    } catch (error) {
      console.error(error);
    }
  }

  visitUnaryExpr(expr: UnaryExpr) {
    const operand = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenTypes.NOT:
        return !this.isTruthy(operand);
      case TokenTypes.MINUS:
        return (operand as number) * -1;
    }

    return null;
  }

  visitBinaryExpr(expr: BinaryExpr) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    if (typeof left === "string" && typeof right === "string" && expr.operator.type === TokenTypes.PLUS) {
      return left + right;
    }

    if (typeof left === "number" && typeof right === "number") {
      switch (expr.operator.type) {
        case TokenTypes.PLUS:
          return left + right;
        case TokenTypes.MINUS:
          return left - right;
        case TokenTypes.STAR:
          return left * right;
        case TokenTypes.SLASH:
          return left / right;

        case TokenTypes.GT:
          return left > right;
        case TokenTypes.GTE:
          return left >= right;
        case TokenTypes.LT:
          return left < right;
        case TokenTypes.LTE:
          return left <= right;
        case TokenTypes.EQUALS_EQUALS:
          return left === right;
        case TokenTypes.NOT_EQUALS:
          return left !== right;
      }
    }

    return null;
  }

  visitGroupingExpr(expr: GroupingExpr) {
    return this.evaluate(expr.expression);
  }

  visitLiteralExpr(expr: LiteralExpr) {
    if (typeof expr.value === "number") {
      return expr.value as number;
    }

    if (typeof expr.value === "string") {
      return expr.value as string;
    }

    return expr.value as null;
  }

  visitVarExpr(expr: VariableExpr): Object | null {
    if (expr.name.literal) {
      return this.environment.get(expr.name.literal);
    }
    return null;
  }

  visitAssignmentExpr(expr: AssignmentExpr): Object | null {
    if (expr.name.literal) {
      const value = this.evaluate(expr.value);
      this.environment.assign(expr.name.literal, value);
      return value;
    }

    return null;
  }

  visitLogicalExpr(expr: LogicalExpr): Object | null {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenTypes.OR:
        return this.isTruthy(left) || this.isTruthy(right);
      case TokenTypes.AND:
        return this.isTruthy(left) && this.isTruthy(right);
      default:
        return false
    }
  }

  visitCallExpr(expr: CallExpr): Object | null {
    const callee = this.evaluate(expr.callee);
    const args: Array<Object | null> = expr.arguments?.map(arg => this.evaluate(arg)) ?? [];

    if (!(callee instanceof LoxCallable)) {
      throw new Error("Can only call functions and classes.");
    }

    const func: LoxCallable = callee as LoxCallable;

    if (args.length !== func.arity()) {
      throw new Error(`${expr.paren.type} Expected ${func.arity()} arguments but got ${args.length}.`);
    }
    return func.call(this, args);
  }

  visitExprStmt(stmt: ExprStmt): Object | null {
    this.evaluate(stmt.expression);
    return null;
  }

  visitPrintStmt(stmt: PrintStmt): Object | null {
    const value = this.evaluate(stmt.expression);
    console.log(value);
    return null;
  }

  visitVarDeclStmt(stmt: VarDeclStmt): void {
    let value: Object | null = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    if (stmt.name.literal) {
      this.environment.set(stmt.name.literal, value);
    }
  }

  visitBlockStmt(stmt: BlockStmt): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  visitIfStmt(stmt: IfStmt): void {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch !== null) {
      this.execute(stmt.elseBranch);
    }
  }

  visitWhileStmt(stmt: WhileStmt): void {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.executeBlock(stmt.statements, new Environment(this.environment));
      this.visitWhileStmt(stmt);
    }
  }

  visitFuncDeclStmt(stmt: FuncDeclStmt): void {
    if (stmt.name.literal) {
      const func: LoxFunction = new LoxFunction(stmt, this.environment);
      this.environment.set(stmt.name.literal, func);
    }
  }

  visitReturnStmt(stmt: ReturnStmt): void {
    let value: Object | null = null;
    if (stmt.value !== null)  {
      value = this.evaluate(stmt.value);
    }
    throw new Return(value);
  }

  private evaluate(expr: Expr): Object | null {
    return expr.accept(this);
  }

  private execute(statement: Stmt): void {
    statement.accept(this);
  }

  public executeBlock(statements: Stmt[], environment: Environment) {
    const previousEnv: Environment = this.environment;

    this.environment = environment;

    try {
      statements.forEach((statement) => {
        this.execute(statement);
      });
    } finally {
      this.environment = previousEnv;
    }
  }

  private isTruthy(object: Object | null) {
    if (object === null || object === false) return false;
    return true
  }
}
