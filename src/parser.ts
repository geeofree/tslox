import { BinaryExpr, Expr, GroupingExpr, LiteralExpr, UnaryExpr } from "./grammar";
import { Token, TokenTypes } from "./token";

export class Parser {
  public tokens: Token[];
  private head: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.head = 0;
  }

  public parse(): Expr | null {
    try {
      return this.expression();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private expression(): Expr {
    return this.equality();
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
      const right: Expr = this.unary();
      return new UnaryExpr(operator, right);
    }

    return this.primary();
  }

  private primary(): Expr {
    if (this.match(TokenTypes.FALSE)) return new LiteralExpr<false>(false);
    if (this.match(TokenTypes.TRUE)) return new LiteralExpr<true>(true);
    if (this.match(TokenTypes.NIL)) return new LiteralExpr<null>(null);

    if (this.match(TokenTypes.NUMBER, TokenTypes.STRING)) {
      return new LiteralExpr<string>(this.previous().literal as string);
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

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.head += 1;
    }
    return this.tokens[this.head];
  }

  private consume(tokenType: TokenTypes, message: string): Token {
    if (this.current().type === tokenType) {
      return this.advance();
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
