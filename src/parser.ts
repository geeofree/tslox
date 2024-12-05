import {
  AssignmentExpr,
  BinaryExpr,
  BlockStmt,
  CallExpr,
  Expr,
  ExprStmt,
  FuncDeclStmt,
  GroupingExpr,
  IfStmt,
  LiteralExpr,
  LogicalExpr,
  PrintStmt,
  ReturnStmt,
  Stmt,
  UnaryExpr,
  VarDeclStmt,
  VariableExpr,
  WhileStmt,
} from "./grammar";
import { Token, TokenTypes } from "./token";

export class Parser {
  public tokens: Token[];
  private head: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.head = 0;
  }

  public parse(): Stmt[] | null {
    try {
      const statements: Stmt[] = [];
      while (!this.isAtEnd()) {
        statements.push(this.declaration());
      }
      return statements;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private declaration(): Stmt {
    if (this.match(TokenTypes.LET)) {
      return this.varDeclaration();
    }

    if (this.match(TokenTypes.FUNC)) {
      return this.funcDeclaration();
    }

    return this.statement();
  }

  private varDeclaration(): Stmt {
    const name = this.consume(
      TokenTypes.IDENT,
      "Variable declaration must have identifier.",
    );

    let initializer: Expr | null = null;
    if (this.match(TokenTypes.EQUALS)) {
      initializer = this.expression();
    }

    return new VarDeclStmt(name, initializer);
  }

  private funcDeclaration(): Stmt {
    const name = this.consume(
      TokenTypes.IDENT,
      "Expected identifer for function declaration.",
    );
    this.consume(TokenTypes.O_PAREN, "Expected '(' after function declaration");
    const params: Token[] = [];
    if (!this.check(TokenTypes.C_PAREN)) {
      do {
        if (params.length >= 255) {
          console.error("Can't have more than 255 parameters.");
        }
        params.push(this.consume(TokenTypes.IDENT, "Expected parameter name."));
      } while (this.match(TokenTypes.COMMA));
    }
    this.consume(
      TokenTypes.C_PAREN,
      "Expected ')' after function parameters declaration",
    );
    this.consume(TokenTypes.O_BRACKET, "Expected '{' before function body");
    const body = this.blockStatement();
    return new FuncDeclStmt(name, params, body as BlockStmt);
  }

  private statement(): Stmt {
    if (this.match(TokenTypes.PRINT)) {
      return this.printStatement();
    }

    if (this.match(TokenTypes.O_BRACKET)) {
      return this.blockStatement();
    }

    if (this.match(TokenTypes.IF)) {
      return this.ifStatement();
    }

    if (this.match(TokenTypes.FOR)) {
      return this.forStatement();
    }

    if (this.match(TokenTypes.WHILE)) {
      return this.whileStatement();
    }

    if (this.match(TokenTypes.RETURN)) {
      return this.returnStatement();
    }

    return this.expressionStatement();
  }

  private printStatement(): Stmt {
    const expr: Expr = this.expression();
    return new PrintStmt(expr);
  }

  private blockStatement(): Stmt {
    const statements: Stmt[] = [];

    while (!this.check(TokenTypes.C_BRACKET) && !this.isAtEnd()) {
      statements.push(this.declaration());
    }

    this.consume(TokenTypes.C_BRACKET, "Expected '}' after block.");

    return new BlockStmt(statements);
  }

  private ifStatement(): Stmt {
    this.consume(TokenTypes.O_PAREN, "if statement requires '('");
    const condition = this.expression();
    this.consume(TokenTypes.C_PAREN, "Expected ')'.");

    const thenBranch = this.statement();
    let elseBranch: Stmt | null = null;

    if (this.match(TokenTypes.ELSE)) {
      elseBranch = this.statement();
    }

    return new IfStmt(condition, thenBranch, elseBranch);
  }

  private forStatement(): Stmt {
    this.consume(TokenTypes.O_PAREN, "Expected '(' after 'for'.");

    let initializer: Stmt | null;
    if (this.match(TokenTypes.SEMICOLON)) {
      initializer = null;
    } else if (this.match(TokenTypes.LET)) {
      initializer = this.varDeclaration();
      this.consume(TokenTypes.SEMICOLON, "Expected ';' after initializer");
    } else {
      initializer = this.expressionStatement();
      this.consume(TokenTypes.SEMICOLON, "Expected ';' after initializer");
    }

    let condition: Expr | null = null;
    if (!this.check(TokenTypes.SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(TokenTypes.SEMICOLON, "Expected ';' after loop condition.");

    let increment: Expr | null = null;
    if (!this.check(TokenTypes.C_PAREN)) {
      increment = this.expression();
    }
    this.consume(TokenTypes.C_PAREN, "Expected ')' after for clause.");

    let body: Stmt = this.statement();

    if (increment !== null) {
      body = new BlockStmt([body, new ExprStmt(increment)]);
    }

    if (condition == null) {
      condition = new LiteralExpr(true);
    }
    body = new WhileStmt(condition, [body]);

    if (initializer !== null) {
      body = new BlockStmt([initializer, body]);
    }

    return body;
  }

  private whileStatement(): Stmt {
    this.consume(TokenTypes.O_PAREN, "while statement requirements '('");
    const condition = this.expression();
    this.consume(TokenTypes.C_PAREN, "Expected ')'.");
    this.consume(TokenTypes.O_BRACKET, "while statement requires '{'");

    let statements: Stmt[] = [];
    while (!this.check(TokenTypes.C_BRACKET) && !this.isAtEnd()) {
      statements.push(this.declaration());
    }
    this.consume(TokenTypes.C_BRACKET, "Expected '}'");

    return new WhileStmt(condition, statements);
  }

  private returnStatement(): Stmt {
    const keyword: Token = this.previous();
    let value: Expr | null = null;
    if (!this.check(TokenTypes.SEMICOLON)) {
      value = this.expression();
    }
    this.consume(TokenTypes.SEMICOLON, "Expected ';' after return value");
    return new ReturnStmt(keyword, value);
  }

  private expressionStatement(): Stmt {
    const expr: Expr = this.expression();
    return new ExprStmt(expr);
  }

  private expression(): Expr {
    return this.assignment();
  }

  private assignment(): Expr {
    const expr: Expr = this.or();

    if (this.match(TokenTypes.EQUALS)) {
      const value: Expr = this.assignment();

      if (expr instanceof VariableExpr) {
        return new AssignmentExpr(expr.name, value);
      }

      throw new Error("Invalid assignment target.");
    }

    return expr;
  }

  private or(): Expr {
    let expr = this.and();

    while (this.match(TokenTypes.OR)) {
      const operator: Token = this.previous();
      const right = this.and();
      expr = new LogicalExpr(expr, operator, right);
    }

    return expr;
  }

  private and(): Expr {
    let expr = this.equality();

    while (this.match(TokenTypes.AND)) {
      const operator: Token = this.previous();
      const right = this.equality();
      expr = new LogicalExpr(expr, operator, right);
    }

    return expr;
  }

  private equality(): Expr {
    let expr: Expr = this.comparison();

    while (this.match(TokenTypes.EQUALS_EQUALS, TokenTypes.NOT_EQUALS)) {
      const operator: Token = this.previous();
      const right: Expr = this.comparison();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expr {
    let expr: Expr = this.term();

    while (
      this.match(TokenTypes.GT, TokenTypes.GTE, TokenTypes.LT, TokenTypes.LTE)
    ) {
      const operator: Token = this.previous();
      const right: Expr = this.term();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private term(): Expr {
    let expr = this.factor();

    while (this.match(TokenTypes.PLUS, TokenTypes.MINUS)) {
      const operator: Token = this.previous();
      const right: Expr = this.factor();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expr {
    let expr = this.unary();

    while (this.match(TokenTypes.STAR, TokenTypes.SLASH)) {
      const operator: Token = this.previous();
      const right: Expr = this.unary();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenTypes.NOT, TokenTypes.MINUS)) {
      const operator: Token = this.previous();
      const right: Expr = this.expression();
      return new UnaryExpr(operator, right);
    }

    return this.call();
  }

  private call(): Expr {
    let expr: Expr = this.primary();

    while (true) {
      if (this.match(TokenTypes.O_PAREN)) {
        expr = this.finishCall(expr);
      } else {
        break;
      }
    }

    return expr;
  }

  private primary(): Expr {
    if (this.match(TokenTypes.FALSE)) return new LiteralExpr(false);
    if (this.match(TokenTypes.TRUE)) return new LiteralExpr(true);
    if (this.match(TokenTypes.NIL)) return new LiteralExpr(null);

    if (this.match(TokenTypes.STRING)) {
      return new LiteralExpr(this.previous().literal as string);
    }

    if (this.match(TokenTypes.NUMBER)) {
      return new LiteralExpr(Number(this.previous().literal as string));
    }

    if (this.match(TokenTypes.IDENT)) {
      return new VariableExpr(this.previous());
    }

    if (this.match(TokenTypes.O_PAREN)) {
      const expr = this.expression();
      this.consume(TokenTypes.C_PAREN, 'Expected ")" after expression.');
      return new GroupingExpr(expr);
    }

    throw new Error("Invalid expression.");
  }

  private finishCall(callee: Expr): Expr {
    const args: Expr[] = [];

    if (!this.check(TokenTypes.C_PAREN)) {
      do {
        if (args.length >= 255) {
          console.error("Can't have more than 255 arguments.");
        }
        args.push(this.expression());
      } while (this.match(TokenTypes.COMMA));
    }

    const paren: Token = this.consume(
      TokenTypes.C_PAREN,
      "Expected ')' after arguments.",
    );

    return new CallExpr(callee, paren, args);
  }

  private match(...tokenTypes: TokenTypes[]): boolean {
    if (!this.isAtEnd() && tokenTypes.includes(this.current().type)) {
      this.advance();
      return true;
    }
    return false;
  }

  private current(): Token {
    return this.tokens[this.head];
  }

  private check(tokenType: TokenTypes): boolean {
    return this.current().type === tokenType;
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.head += 1;
    }
    return this.tokens[this.head];
  }

  private consume(tokenType: TokenTypes, message: string): Token {
    if (this.current().type === tokenType) {
      this.advance();
      return this.previous();
    }

    throw new Error(message);
  }

  private previous(): Token {
    return this.tokens[this.head - 1];
  }

  private isAtEnd(): boolean {
    return this.head >= this.tokens.length;
  }
}
