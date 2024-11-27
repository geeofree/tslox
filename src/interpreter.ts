import { AssignmentExpr, BinaryExpr, BlockStmt, Expr, ExprStmt, ExprVisitor, GroupingExpr, LiteralExpr, PrintStmt, Stmt, StmtVisitor, UnaryExpr, VarDeclStmt, VariableExpr } from "./grammar";
import { Environment } from "./environment";
import { TokenTypes } from "./token";

export class Interpreter implements ExprVisitor, StmtVisitor {
  public statements: Stmt[];
  public environment: Environment;

  constructor(statements: Stmt[]) {
    this.statements = statements;
    this.environment = new Environment();
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

  private evaluate(expr: Expr): Object | null {
    return expr.accept(this);
  }

  private execute(statement: Stmt): void {
    statement.accept(this);
  }

  private executeBlock(statements: Stmt[], environment: Environment) {
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
