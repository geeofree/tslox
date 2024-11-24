import { BinaryExpr, Expr, ExprVisitor, GroupingExpr, LiteralExpr, UnaryExpr } from "./grammar";
import { TokenTypes } from "./token";

export class Evaluator extends ExprVisitor {
  evaluate(expr: Expr): Object | null {
    return this.eval(expr);
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

  private eval(expr: Expr): Object | null {
    return expr.accept(this);
  }

  private isTruthy(object: Object | null) {
    if (object === null || object === false) return false;
    return true
  }
}
