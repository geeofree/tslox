import { FunctionType } from "./callable";
import {
  BlockStmt,
  Stmt,
  ExprVisitor,
  StmtVisitor,
  Expr,
  VarDeclStmt,
  VariableExpr,
  AssignmentExpr,
  FuncDeclStmt,
  ExprStmt,
  IfStmt,
  PrintStmt,
  ReturnStmt,
  WhileStmt,
  BinaryExpr,
  CallExpr,
  GroupingExpr,
  LiteralExpr,
  LogicalExpr,
  UnaryExpr,
} from "./grammar";
import { Interpreter } from "./interpreter";
import { Token } from "./token";

export class Resolver implements ExprVisitor, StmtVisitor {
  private interpreter: Interpreter;
  private scopes: Map<string, boolean>[];
  private currentFunction: FunctionType;

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
    this.scopes = [];
    this.currentFunction = FunctionType.NONE;
  }

  public visitBlockStmt(stmt: BlockStmt): void {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
  }

  public visitVarDeclStmt(stmt: VarDeclStmt): void {
    this.declare(stmt.name);
    if (stmt.initializer !== null) {
      this.resolveExpr(stmt.initializer);
    }
    this.define(stmt.name);
  }

  public visitVarExpr(expr: VariableExpr): Object | null {
    if (
      !this.isScopesEmpty() &&
      expr.name.literal &&
      this.scopesPeek().get(expr.name.literal) === false
    ) {
      throw new Error("Can't read local variable in its own initializer.");
    }

    this.resolveLocal(expr, expr.name);
    return null;
  }

  public visitAssignmentExpr(expr: AssignmentExpr): Object | null {
    this.resolveExpr(expr.value);
    this.resolveLocal(expr, expr.name);
    return null;
  }

  public visitFuncDeclStmt(stmt: FuncDeclStmt): void {
    this.declare(stmt.name);
    this.define(stmt.name);
    this.resolveFunction(stmt, FunctionType.FUNCTION);
  }

  public visitExprStmt(stmt: ExprStmt): void {
    this.resolveExpr(stmt.expression);
  }

  public visitIfStmt(stmt: IfStmt): void {
    this.resolveExpr(stmt.condition);
    this.resolveStmt(stmt.thenBranch);
    if (stmt.elseBranch !== null) {
      this.resolveStmt(stmt.elseBranch);
    }
  }

  public visitPrintStmt(stmt: PrintStmt): void {
    this.resolveExpr(stmt.expression);
  }

  public visitReturnStmt(stmt: ReturnStmt): void {
    if (this.currentFunction === FunctionType.NONE) {
      throw new Error("Can't return from top-level code.");
    }
    if (stmt.value !== null) {
      this.resolveExpr(stmt.value);
    }
  }

  public visitWhileStmt(stmt: WhileStmt): void {
    this.resolveExpr(stmt.condition);
    this.resolve(stmt.statements);
  }

  public visitBinaryExpr(expr: BinaryExpr): Object | null {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
    return null;
  }

  public visitCallExpr(expr: CallExpr): Object | null {
    this.resolveExpr(expr.callee);
    expr.arguments?.forEach((arg) => {
      this.resolveExpr(arg);
    });
    return null;
  }

  public visitGroupingExpr(expr: GroupingExpr): Object | null {
    this.resolveExpr(expr.expression);
    return null;
  }

  public visitLiteralExpr(_expr: LiteralExpr): Object | null {
    return null;
  }

  public visitLogicalExpr(expr: LogicalExpr): Object | null {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
    return null;
  }

  public visitUnaryExpr(expr: UnaryExpr): Object | null {
    this.resolveExpr(expr.right);
    return null;
  }

  private declare(name: Token) {
    if (this.isScopesEmpty()) {
      return;
    }

    if (name.literal) {
      const scope = this.scopesPeek();
      if (scope.has(name.literal)) {
        throw new Error("Already a variable with this name in this scope.");
      }
      scope.set(name.literal, false);
    }
  }

  private define(name: Token) {
    if (this.isScopesEmpty()) {
      return;
    }
    if (name.literal) {
      this.scopesPeek().set(name.literal, true);
    }
  }

  private scopesPeek(): Map<string, boolean> {
    return this.scopes[0];
  }

  private isScopesEmpty(): boolean {
    return this.scopes.length === 0;
  }

  private beginScope() {
    this.scopes.push(new Map<string, boolean>());
  }

  public resolve(statements: Stmt[]) {
    statements.forEach((statement) => {
      this.resolveStmt(statement);
    });
  }

  private resolveStmt(stmt: Stmt) {
    stmt.accept(this);
  }

  private resolveExpr(expr: Expr) {
    expr.accept(this);
  }

  private resolveFunction(stmt: FuncDeclStmt, funcType: FunctionType) {
    const enclosingFunc = this.currentFunction;
    this.currentFunction = funcType;
    this.beginScope();
    stmt.params.forEach((param) => {
      this.declare(param);
      this.define(param);
    });
    this.resolve(stmt.body.statements);
    this.endScope();
    this.currentFunction = enclosingFunc;
  }

  private resolveLocal(expr: Expr, name: Token) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (name.literal && this.scopes[i].has(name.literal)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }

  private endScope() {
    this.scopes.pop();
  }
}
