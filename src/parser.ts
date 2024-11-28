import {
  AssignmentExpr,
  BinaryExpr,
  BlockStmt,
  Expr,
  ExprStmt,
  GroupingExpr,
  IfStmt,
  LiteralExpr,
  PrintStmt,
  Stmt,
  UnaryExpr,
  VarDeclStmt,
  VariableExpr,
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

    return this.statement();
  }

  private varDeclaration(): Stmt {
    const name = this.consume(TokenTypes.IDENT, "Variable declaration must have identifier.");

    let initializer: Expr | null = null;
    if (this.match(TokenTypes.EQUALS)) {
      initializer = this.expression();
    }

    return new VarDeclStmt(name, initializer);
  }

  private statement(): Stmt {
    if (this.match(TokenTypes.PRINT)) {
      return this.printStatement();
    }

    if (this.match(TokenTypes.O_BRACKET)) {
      return this.blockStatement();
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

  private expressionStatement(): Stmt {
    const expr: Expr = this.expression();
    return new ExprStmt(expr);
  }

  private expression(): Expr {
    return this.assignment();
  }

  private assignment(): Expr {
    const expr: Expr = this.equality();

    if (this.match(TokenTypes.EQUALS)) {
      const value: Expr = this.assignment();

      if (expr instanceof VariableExpr) {
        return new AssignmentExpr(expr.name, value);
      }

      throw new Error("Invalid assignment target.");
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

    while (this.match(TokenTypes.GT, TokenTypes.GTE, TokenTypes.LT, TokenTypes.LTE)) {
      const operator: Token = this.previous();
      const right: Expr = this.term();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private term(): Expr {
    let expr = this.factor()

    while(this.match(TokenTypes.PLUS, TokenTypes.MINUS)) {
      const operator: Token = this.previous();
      const right: Expr = this.factor();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr
  }

  private factor(): Expr {
    let expr = this.unary();

    while(this.match(TokenTypes.STAR, TokenTypes.SLASH)) {
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

    return this.primary();
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

    throw new Error('Invalid expression.');
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
