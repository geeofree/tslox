import { Token } from "./token";

export abstract class Expr {
  abstract accept(visitor: ExprVisitor): Object | null;
}

export abstract class ExprVisitor {
  abstract visitBinaryExpr(expr: BinaryExpr): Object | null;
  abstract visitUnaryExpr(expr: UnaryExpr): Object | null;
  abstract visitLiteralExpr(expr: LiteralExpr): Object | null;
  abstract visitGroupingExpr(expr: GroupingExpr): Object | null;
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

  accept(visitor: ExprVisitor): Object | null{
    return visitor.visitBinaryExpr(this);
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

  accept(visitor: ExprVisitor): Object | null {
    return visitor.visitUnaryExpr(this);
  }
}

export class LiteralExpr extends Expr {
  public value: Object | null;

  constructor(value: Object | null) {
    super();
    this.value = value;
  }

  accept(visitor: ExprVisitor): Object | null {
    return visitor.visitLiteralExpr(this);
  }
}

export class GroupingExpr extends Expr {
  public expression: Expr;

  constructor(expr: Expr) {
    super();
    this.expression = expr;
  }

  accept(visitor: ExprVisitor): Object | null {
    return visitor.visitGroupingExpr(this);
  }
}
