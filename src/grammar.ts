import { Token } from "./token";

export abstract class Expr {
  abstract accept(visitor: ExprVisitor): void;
}

export abstract class ExprVisitor {
  abstract visitBinaryExpr(expr: Expr): void;
  abstract visitUnaryExpr(expr: Expr): void;
  abstract visitLiteralExpr(expr: Expr): void;
  abstract visitGroupingExpr(expr: Expr): void;
}

export class BinaryExpr extends Expr {
  public left: Expr;
  public operator: Token;
  public right: Expr;

  constructor(left: Expr, operator: Token, right: Expr) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept(visitor: ExprVisitor): void {
    visitor.visitBinaryExpr(this);
  }
}

export class UnaryExpr extends Expr {
  public operator: Token;
  public right: Expr;

  constructor(operator: Token, right: Expr) {
    super();
    this.operator = operator;
    this.right = right;
  }

  accept(visitor: ExprVisitor): void {
    visitor.visitUnaryExpr(this);
  }
}

export class LiteralExpr<T = unknown> extends Expr {
  public value: T;

  constructor(value: T) {
    super();
    this.value = value;
  }

  accept(visitor: ExprVisitor): void {
    visitor.visitLiteralExpr(this);
  }
}

export class GroupingExpr extends Expr {
  public expr: Expr;

  constructor(expr: Expr) {
    super();
    this.expr = expr;
  }

  accept(visitor: ExprVisitor): void {
    visitor.visitGroupingExpr(this);
  }
}
