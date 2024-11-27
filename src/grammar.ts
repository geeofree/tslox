import { Token } from "./token";

export abstract class Expr {
  abstract accept(visitor: ExprVisitor): Object | null;
}

export abstract class ExprVisitor {
  abstract visitBinaryExpr(expr: BinaryExpr): Object | null;
  abstract visitUnaryExpr(expr: UnaryExpr): Object | null;
  abstract visitLiteralExpr(expr: LiteralExpr): Object | null;
  abstract visitGroupingExpr(expr: GroupingExpr): Object | null;
  abstract visitVarExpr(expr: VariableExpr): Object | null;
  abstract visitAssignmentExpr(expr: AssignmentExpr): Object | null;
}

export abstract class Stmt {
  abstract accept(visitor: StmtVisitor): void;
}

export abstract class StmtVisitor {
  abstract visitExprStmt(stmt: ExprStmt): void;
  abstract visitPrintStmt(stmt: PrintStmt): void;
  abstract visitVarDeclStmt(stmt: VarDeclStmt): void;
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

export class VariableExpr extends Expr {
  public name: Token;

  constructor(name: Token) {
    super();
    this.name = name;
  }

  accept(visitor: ExprVisitor): Object | null {
    return visitor.visitVarExpr(this);
  }
}

export class AssignmentExpr extends Expr {
  public name: Token;
  public value: Expr;

  constructor(name: Token, value: Expr) {
    super();
    this.name = name;
    this.value = value;
  }

  accept(visitor: ExprVisitor): Object | null {
    return visitor.visitAssignmentExpr(this);
  }
}

export class ExprStmt extends Stmt {
  public expression: Expr;

  constructor(expr: Expr) {
    super();
    this.expression = expr;
  }

  accept(visitor: StmtVisitor): void {
    visitor.visitExprStmt(this);
  }
}

export class PrintStmt extends Stmt {
  public expression: Expr;

  constructor(expr: Expr) {
    super();
    this.expression = expr;
  }

  accept(visitor: StmtVisitor): void {
    visitor.visitPrintStmt(this);
  }
}

export class VarDeclStmt extends Stmt {
  public name: Token;
  public initializer: Expr | null;

  constructor(name: Token, initializer: Expr | null) {
    super();
    this.name = name;
    this.initializer = initializer;
  }

  accept(visitor: StmtVisitor): void {
    visitor.visitVarDeclStmt(this);
  }
}
