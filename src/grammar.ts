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
  abstract visitLogicalExpr(expr: LogicalExpr): Object | null;
  abstract visitCallExpr(expr: CallExpr): Object | null;
}

export abstract class Stmt {
  abstract accept(visitor: StmtVisitor): void;
}

export abstract class StmtVisitor {
  abstract visitExprStmt(stmt: ExprStmt): void;
  abstract visitPrintStmt(stmt: PrintStmt): void;
  abstract visitVarDeclStmt(stmt: VarDeclStmt): void;
  abstract visitBlockStmt(stmt: BlockStmt): void;
  abstract visitIfStmt(stmt: IfStmt): void;
  abstract visitWhileStmt(stmt: WhileStmt): void;
  abstract visitFuncDeclStmt(stmt: FuncDeclStmt): void;
  abstract visitReturnStmt(stmt: ReturnStmt): void;
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

export class LogicalExpr extends Expr {
  public left: Expr;
  public operator: Token;
  public right: Expr;

  constructor(left: Expr, operator: Token, right: Expr) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept(visitor: ExprVisitor): Object | null {
    return visitor.visitLogicalExpr(this);
  }
}

export class CallExpr extends Expr {
  public callee: Expr;
  public paren: Token;
  public arguments: Expr[] | null;

  constructor(callee: Expr, paren: Token, args: Expr[] | null) {
    super();
    this.callee = callee;
    this.paren = paren;
    this.arguments = args;
  }

  accept(visitor: ExprVisitor): Object | null {
    return visitor.visitCallExpr(this);
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

export class BlockStmt extends Stmt {
  public statements: Stmt[];

  constructor(statements: Stmt[]) {
    super();
    this.statements = statements;
  }

  accept(visitor: StmtVisitor): void {
    visitor.visitBlockStmt(this);
  }
}

export class IfStmt extends Stmt {
  public condition: Expr;
  public thenBranch: Stmt;
  public elseBranch: Stmt | null;

  constructor(condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null) {
    super();
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept(visitor: StmtVisitor): void {
    visitor.visitIfStmt(this);
  }
}

export class WhileStmt extends Stmt {
  public condition: Expr;
  public statements: Stmt[];

  constructor(condition: Expr, statements: Stmt[]) {
    super();
    this.condition = condition;
    this.statements = statements;
  }

  accept(visitor: StmtVisitor): void {
    visitor.visitWhileStmt(this);
  }
}

export class FuncDeclStmt extends Stmt {
  public name: Token;
  public params: Token[];
  public body: BlockStmt;

  constructor(name: Token, params: Token[], body: BlockStmt) {
    super();
    this.name = name;
    this.params = params;
    this.body = body;
  }

  accept(visitor: StmtVisitor): void {
    visitor.visitFuncDeclStmt(this);
  }
}

export class ReturnStmt extends Stmt {
  public keyword: Token;
  public value: Expr | null;

  constructor(keyword: Token, value: Expr | null) {
    super();
    this.keyword = keyword;
    this.value= value;
  }

  accept(visitor: StmtVisitor): void {
    visitor.visitReturnStmt(this);
  }
}
