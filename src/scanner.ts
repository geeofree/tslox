import { KeywordMap, Token, TokenConfig, TokenTypes } from "./token";
import { Optional } from "./types";

export class Scanner {
  public fileContents: string;
  private source: string[];
  private head: number;
  private tail: number;
  private colStart: number;
  private line: number;
  private lineEnd: number;
  private tokens: Token[];

  constructor(fileContents: string) {
    this.fileContents = fileContents;
    this.source = fileContents.split('');
    this.head = 0;
    this.tail = 0;
    this.colStart = 0;
    this.line = 1;
    this.lineEnd = 1;
    this.tokens = [];
  }

  public scan(): Token[] {
    while (this.isNotEOF()) {
      this.tokenize();
    }
    return this.tokens;
  }

  private tokenize(): void {
    const char = this.currentChar();
    switch(char) {
      case '\n': {
        this.line += 1;
        this.lineEnd = this.line;
        this.head += 1;
        this.tail = this.head;
        this.colStart = this.head - 1;
        break;
      }

      case '\t':
      case ' ': {
        let nextChar = this.advance();
        while (nextChar === ' ' || nextChar === '\t') {
          nextChar = this.advance();
        }
        this.head = this.tail;
        break;
      }

      case '.': {
        this.pushToken({ type: TokenTypes.DOT });
        this.head += 1;
        this.tail = this.head;
        break;
      }

      case '(': {
        this.pushToken({ type: TokenTypes.O_PAREN });
        this.head += 1;
        this.tail = this.head;
        break;
      }

      case ')': {
        this.pushToken({ type: TokenTypes.C_PAREN });
        this.head += 1;
        this.tail = this.head;
        break;
      }

      case '{': {
        this.pushToken({ type: TokenTypes.O_BRACKET });
        this.head += 1;
        this.tail = this.head;
        break;
      }

      case '}': {
        this.pushToken({ type: TokenTypes.C_BRACKET });
        this.head += 1;
        this.tail = this.head;
        break;
      }

      case '[': {
        this.pushToken({ type: TokenTypes.O_SBRACKET });
        this.head += 1;
        this.tail = this.head;
        break;
      }

      case ']': {
        this.pushToken({ type: TokenTypes.C_SBRACKET });
        this.head += 1;
        this.tail = this.head;
        break;
      }

      case '+': {
        if (this.advance() === '=') {
          this.pushToken({ type: TokenTypes.PLUS_EQUALS });
          this.head = this.tail + 1;
          this.tail = this.head;
        } else {
          this.pushToken({ type: TokenTypes.PLUS });
          this.head = this.tail
        }
        break;
      }

      case '-': {
        if (this.advance() === '=') {
          this.pushToken({ type: TokenTypes.MINUS_EQUALS });
          this.head = this.tail + 1;
          this.tail = this.head;
        } else {
          this.pushToken({ type: TokenTypes.MINUS });
          this.head = this.tail;
        }
        break;
      }

      case '*': {
        if (this.advance() === '=') {
          this.pushToken({ type: TokenTypes.STAR_EQUALS });
          this.head = this.tail + 1;
          this.tail = this.head;
        } else {
          this.pushToken({ type: TokenTypes.STAR });
          this.head = this.tail;
        }
        break;
      }

      case '=': {
        if (this.advance() === '=') {
          this.pushToken({ type: TokenTypes.EQUALS_EQUALS });
          this.head = this.tail + 1;
          this.tail = this.head;
        } else {
          this.pushToken({ type: TokenTypes.EQUALS });
          this.head = this.tail;
        }
        break;
      }

      case '<': {
        if (this.advance() === '=') {
          this.pushToken({ type: TokenTypes.LTE });
          this.head = this.tail + 1;
          this.tail = this.head;
        } else {
          this.pushToken({ type: TokenTypes.LT });
          this.head = this.tail;
        }
        break;
      }

      case '>': {
        if (this.advance() === '=') {
          this.pushToken({ type: TokenTypes.GTE });
          this.head = this.tail + 1;
          this.tail = this.head;
        } else {
          this.pushToken({ type: TokenTypes.GT });
          this.head = this.tail;
        }
        break;
      }

      case '/': {
        switch (this.advance()) {
          case '/': {
            while (this.advance() !== '\n');
            this.pushToken({
              type: TokenTypes.SLASH_SLASH,
              literal: this.getLiteral(),
            });
            this.head = this.tail + 1;
            this.tail = this.head;
            break;
          }

          case '=': {
            this.pushToken({ type: TokenTypes.SLASH_EQUALS });
            this.head = this.tail + 1;
            this.tail = this.head;
            break;
          }

          default: {
            this.pushToken({ type: TokenTypes.SLASH });
            this.head = this.tail;
            break;
          }
        }
        break;
      }

      case "'":
      case '"': {
        this.chompString(char);
        break;
      }

      default: {
        if (this.isNumber(char)) {
          this.chompNumber();
          break;
        }

        if (char === '_' || this.isAlpha(char)) {
          this.chompKeywordsOrIdentifiers();
          break;
        }

        this.head += 1;
        console.warn(`Unknown symbol: ${char}`);
        break;
      }
    }
  }

  private chompString(char: string) {
    let nextChar = this.advance();
    while (nextChar !== char && this.isNotEOF()) {
      if (nextChar === '\n') {
        this.lineEnd += 1;
        this.colStart = this.tail - 1;
      }
      nextChar = this.advance();
    }

    if (nextChar !== char && !this.isNotEOF()) {
      throw new Error(`Unclosed string.`);
    }

    this.advance();
    this.pushToken({
      type: TokenTypes.STRING,
      literal: this.getLiteral(),
    });
    this.head = this.tail;
    this.line = this.lineEnd;
  }

  private chompNumber() {
    if (this.currentChar() === '0' && this.peek() !== '.') {
      // TODO: Provide row and column insights.
      throw new Error('Not a valid number.');
    }

    let hasDecimalAlready = false;
    let nextChar = this.advance();

    while(this.isNumber(nextChar) || nextChar === '.') {
      if (nextChar === '.') {
        if (hasDecimalAlready) {
          // TODO: Provide row and column insights.
          throw new Error('Not a valid number.');
        } else {
          hasDecimalAlready = true;
        }
      }
      nextChar = this.advance();
    }

    this.pushToken({
      type: TokenTypes.NUMBER,
      literal: this.getLiteral(),
    });
    this.head = this.tail;
  }

  private chompKeywordsOrIdentifiers(): void {
    while(this.isAlphaNumeric(this.advance()));
    let keywordToken = KeywordMap[this.getLiteral()];

    if (keywordToken) {
      this.pushToken({ type: keywordToken });
    } else {
      this.pushToken({ type: TokenTypes.IDENT, literal: this.getLiteral() });
    }
    this.head = this.tail
  }

  private advance(): string {
    this.tail += 1;
    return this.source[this.tail];
  }

  private peek(): string {
    return this.source[this.head + 1];
  }

  private currentChar(): string {
    return this.source[this.head];
  }

  private isNumber(char: string): boolean {
    return /\d/.test(char);
  }

  private isAlpha(char: string): boolean {
    return /[A-Za-z]/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return /[0-9A-Za-z]/.test(char);
  }

  private pushToken(token: Optional<TokenConfig, "literal" | "row" | "col">) {
    this.tokens.push(new Token({
      type: token.type,
      literal: token.literal ?? null,
      row: token.row ?? [this.line, this.lineEnd],
      col: token.col ?? [this.head - this.colStart, this.tail - this.colStart],
    }));
  }

  private getLiteral(): string {
    return this.source.slice(this.head, this.tail).join('');
  }

  private isNotEOF(): boolean {
    return this.tail < this.fileContents.length && this.head < this.fileContents.length;
  }
}
