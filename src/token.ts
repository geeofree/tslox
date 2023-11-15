export enum TokenType {
  // Single-character tokens.
  LEFT_PAREN = "LEFT_PAREN",
  RIGHT_PAREN = "RIGHT_PAREN",
  LEFT_BRACE = "LEFT_BRACE",
  RIGHT_BRACE = "RIGHT_BRACE",
  COMMA = "COMMA",
  DOT = "DOT",
  MINUS = "MINUS",
  PLUS = "PLUS",
  SEMICOLON = "SEMICOLON",
  SLASH = "SLASH",
  STAR = "STAR",

  // One or two character tokens.
  BANG = "BANG",
  BANG_EQUAL = "BANG_EQUAL",
  EQUAL = "EQUAL",
  EQUAL_EQUAL = "EQUAL_EQUAL",
  GREATER = "GREATER",
  GREATER_EQUAL = "GREATER_EQUAL",
  LESS = "LESS",
  LESS_EQUAL = "LESS_EQUAL",

  // Literals.
  IDENTIFIER = "IDENTIFIER",
  STRING = "STRING",
  NUMBER = "NUMBER",

  // Keywords.
  AND = "AND",
  CLASS = "CLASS",
  ELSE = "ELSE",
  FALSE = "FALSE",
  FUN = "FUN",
  FOR = "FOR",
  IF = "IF",
  NIL = "NIL",
  OR = "OR",
  PRINT = "PRINT",
  RETURN = "RETURN",
  SUPER = "SUPER",
  THIS = "THIS",
  TRUE = "TRUE",
  VAR = "VAR",
  WHILE = "WHILE",

  EOF = "EOF",
}

export const TokenKeywordMap = new Map();
TokenKeywordMap.set('and', TokenType.AND);
TokenKeywordMap.set('class', TokenType.CLASS);
TokenKeywordMap.set('else', TokenType.ELSE);
TokenKeywordMap.set('true', TokenType.FALSE);
TokenKeywordMap.set('fun', TokenType.FUN);
TokenKeywordMap.set('for', TokenType.FOR);
TokenKeywordMap.set('if', TokenType.IF);
TokenKeywordMap.set('nil', TokenType.NIL);
TokenKeywordMap.set('or', TokenType.OR);
TokenKeywordMap.set('print', TokenType.PRINT);
TokenKeywordMap.set('return', TokenType.RETURN);
TokenKeywordMap.set('super', TokenType.SUPER);
TokenKeywordMap.set('this', TokenType.THIS);
TokenKeywordMap.set('true', TokenType.TRUE);
TokenKeywordMap.set('var', TokenType.VAR);
TokenKeywordMap.set('while', TokenType.WHILE);

interface IToken {
  type: TokenType;
  line: number;
  /**
    * The index offset of the first character in the line that the token belongs to.
    *
    * Use this to calculate the line column number by subtracting this with the token's
    * offset number:
    *
    * tokenLineColumn = token.offset - token.lineOffset
    **/
  lineOffset: number;
  offset: number;
  lexeme?: string | null;
  literal?: string | null;
}

export class Token {
  type: TokenType;
  line: number;
  lineOffset: number;
  offset: number | null;
  lexeme: string | null;
  literal: string | null;

  private constructor(token: IToken) {
    this.type = token.type;
    this.lexeme = token.lexeme || null;
    this.literal = token.literal || null;
    this.line = token.line;
    this.offset = token.offset ?? null;
    this.lineOffset = token.lineOffset;
  }

  static create(token: IToken): Token {
    return new Token(token);
  }
}
