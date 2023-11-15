import { Token, TokenKeywordMap, TokenType } from "./token";

export class Scanner {
  private source: string;
  private head: number;
  private pointer: number;
  private line: number;
  private lineOffset: number;
  private tokens: Token[];

  constructor(source: string) {
    this.source = source;
    this.pointer = 0;
    this.head = this.pointer;
    this.line = 1;
    this.lineOffset = this.head;
    this.tokens = [];
  }

  scan(): Token[] {
    while (!this.isEOF()) {
      this.head = this.pointer;
      this.scanToken();
    }

    this.tokens.push(Token.create({
      type: TokenType.EOF,
      line: this.line,
      lineOffset: this.pointer,
      offset: this.pointer,
    }));
    return this.tokens;
  }

  private isEOF(): boolean {
    return this.pointer >= this.source.length;
  }

  private scanToken(): void {
    const char = this.chomp();

    switch (char) {
      case '(':
        this.addLexeme(TokenType.LEFT_PAREN);
        break;

      case ')':
        this.addLexeme(TokenType.RIGHT_PAREN);
        break;

      case '{':
        this.addLexeme(TokenType.LEFT_BRACE);
        break;

      case '}':
        this.addLexeme(TokenType.RIGHT_BRACE);
        break;

      case ',':
        this.addLexeme(TokenType.COMMA);
        break;

      case '.':
        this.addLexeme(TokenType.DOT);
        break;

      case '+':
        this.addLexeme(TokenType.PLUS);
        break;

      case '-':
        this.addLexeme(TokenType.MINUS);
        break;

      case ';':
        this.addLexeme(TokenType.SEMICOLON);
        break;

      case '/':
        if (this.matchNext('/')) {
          // Comments go up until a new line
          while (this.peek() !== '\n' && !this.isEOF()) {
            this.chomp();
          }
        } else {
          this.addLexeme(TokenType.SLASH);
        }
        break;

      case '*':
        this.addLexeme(TokenType.STAR);
        break;

      case '=':
        this.addLexeme(this.matchNext('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
        break;

      case '!':
        this.addLexeme(this.matchNext('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;

      case '>':
        this.addLexeme(this.matchNext('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
        break;

      case '<':
        this.addLexeme(this.matchNext('=') ? TokenType.LESS_EQUAL : TokenType.LESS_EQUAL);
        break;

      case ' ':
      case '\r':
      case '\t':
        break;

      case '\n':
        this.line += 1;
        this.lineOffset = this.head;
        break;

      case '"':
      case '\'':
        this.chompStringLiteral(char);
        this.addLiteral(TokenType.STRING);
        break;

      default:
        if (this.isDigit(char)) {
          this.chompNumberLiteral();
          this.addLiteral(TokenType.NUMBER);
          break;
        }

        if (this.isAlpha(char)) {
          while (this.isAlphaNumeric(this.peek()) && !this.isEOF()) {
            this.chomp();
          }

          const string = this.source.substring(this.head, this.pointer);
          const keywordType = TokenKeywordMap.get(string);

          if (keywordType) {
            this.addLexeme(keywordType);
          } else {
            this.addIdentifier();
          }
          break;
        }

        console.error(`Unexpected character: ${char}`);
        break;
    }
  }

  private chomp(): string {
    const char = this.source[this.pointer];
    this.pointer += 1;
    return char;
  }

  private chompStringLiteral(stringChar: string): void {
    const stringStartLineOffset = this.head;

    while (this.peek() !== stringChar && !this.isEOF()) {
      if (this.peek() === '\n') {
        this.line += 1;
        this.lineOffset = this.pointer;
      }

      this.chomp();
    }

    if (this.isEOF()) {
      console.error(`Unterminated string: ${this.source.substring(stringStartLineOffset, this.pointer)}`);
      return;
    }

    this.chomp();
  }

  private chompNumberLiteral(): void {
    while (this.isDigit(this.peek()) && !this.isEOF()) {
      this.chomp();
    }

    if (this.peek() === '.') {
      this.chomp();

      if (!this.isDigit(this.peek())) {
        console.error(`Unterminated float/decimal number at offset: [${this.line}:${this.columnOffset()}]`);
        return;
      }

      while (this.isDigit(this.peek()) && !this.isEOF()) {
        this.chomp();
      }
    }
  }

  private peek(): string {
    if (this.isEOF()) {
      return ''; 
    }

    return this.source[this.pointer]
  }

  private matchNext(expected: string): boolean {
    if (this.isEOF()) {
      return false
    };

    if (this.source[this.pointer] !== expected) {
      return false;
    }

    this.pointer += 1;
    return true;
  }

  private addLexeme(tokenType: TokenType): void {
    const lexeme = this.source.substring(this.head, this.pointer);
    this.tokens.push(Token.create({
      type: tokenType,
      lexeme,
      line: this.line,
      lineOffset: this.lineOffset,
      offset: this.head,
    }));
  }

  private addLiteral(tokenType: TokenType): void {
    const literal = this.source.substring(this.head, this.pointer);
    this.tokens.push(Token.create({
      type: tokenType,
      literal,
      line: this.line,
      lineOffset: this.lineOffset,
      offset: this.head,
    }));
  }

  private addIdentifier(): void {
    const lexeme = this.source.substring(this.head, this.pointer);
    this.tokens.push(Token.create({
      type: TokenType.IDENTIFIER,
      lexeme,
      line: this.line,
      lineOffset: this.lineOffset,
      offset: this.head,
    }));
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9'
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_'
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private columnOffset(): number {
    return this.pointer - this.lineOffset - 1;
  }
}
