import { AssignmentExpr, BinaryExpr, Expr, ExprStmt, ExprVisitor, GroupingExpr, LiteralExpr, PrintStmt, Stmt, StmtVisitor, UnaryExpr, VarDeclStmt, VariableExpr } from "./grammar";
import { Environment } from "./environment";
import { TokenTypes } from "./token";

export class Interpreter implements ExprVisitor, StmtVisitor {
  public statements: Stmt[];
  public environment: typeof Environment;

  constructor(statements: Stmt[]) {
    this.statements = statements;
    this.environment = Environment;
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
    const operand = this.eval(expr.right);

    switch (expr.operator.type) {
      case TokenTypes.NOT:
        return !this.isTruthy(operand);
      case TokenTypes.MINUS:
        return (operand as number) * -1;
    }

    return null;
  }

  visitBinaryExpr(expr: BinaryExpr) {
    const left = this.eval(expr.left);
    const right = this.eval(expr.right);

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
    return this.eval(expr.expression);
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
      return this.environment.get(expr.name.literal) ?? null;
    }
    return null;
  }

  visitAssignmentExpr(expr: AssignmentExpr): Object | null {
    if (expr.name.literal && this.environment.has(expr.name.literal)) {
      const value = this.eval(expr.value);
      this.environment.set(expr.name.literal, value);
      return value;
    }

    return null;
  }

  visitExprStmt(stmt: ExprStmt): Object | null {
    this.eval(stmt.expression);
    return null;
  }

  visitPrintStmt(stmt: PrintStmt): Object | null {
    const value = this.eval(stmt.expression);
    console.log(value);
    return null;
  }

  visitVarDeclStmt(stmt: VarDeclStmt): void {
    let value: Object | null = null;
    if (stmt.initializer !== null) {
      value = this.eval(stmt.initializer);
    }

    if (stmt.name.literal) {
      this.environment.set(stmt.name.literal, value);
    }
  }

  private eval(expr: Expr): Object | null {
    return expr.accept(this);
  }

  private execute(statement: Stmt): void {
    statement.accept(this);
  }

  private isTruthy(object: Object | null) {
    if (object === null || object === false) return false;
    return true
  }
}
