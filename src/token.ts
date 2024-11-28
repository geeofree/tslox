export const enum TokenTypes {
  // UNARY
  DOT = 'DOT',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  STAR = 'STAR',
  SLASH = 'SLASH',
  EQUALS = 'EQUALS',
  O_PAREN = 'O_PAREN',
  C_PAREN = 'C_PAREN',
  O_BRACKET = 'O_BRACKET',
  C_BRACKET = 'C_BRACKET',
  O_SBRACKET = 'O_SBRACKET',
  C_SBRACKET = 'C_SBRACKET',
  LT = 'LT',
  GT = 'GT',
  SEMICOLON = 'SEMICOLON',

  // BINARY
  PLUS_EQUALS = 'PLUS_EQUALS',
  MINUS_EQUALS = 'MINUS_EQUALS',
  STAR_EQUALS = 'STAR_EQUALS',
  SLASH_EQUALS = 'SLASH_EQUALS',
  EQUALS_EQUALS = 'EQUALS_EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  LTE = 'LESS_THAN_EQUALS',
  GTE = 'GTE',

  // COMMENT
  SLASH_SLASH = 'SLASH_SLASH',

  // KEYWORDS
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  NIL = 'NIL',
  NOT = 'NOT',
  AND = 'AND',
  OR = 'OR',
  IS = 'IS',
  WHILE = 'WHILE',
  FOR = 'FOR',
  IF = 'IF',
  ELIF = 'ELIF',
  ELSE = 'ELSE',
  IN = 'IN',
  LET = 'LET',
  FUNC = 'FUNC',
  IDENT = 'IDENT',
  PRINT = 'PRINT',

  // LITERALS
  STRING = 'STRING',
  NUMBER = 'NUMBER',
}

export const KeywordMap: Record<string, TokenTypes> = {
  'true': TokenTypes.TRUE,
  'false': TokenTypes.FALSE,
  'nil': TokenTypes.NIL,
  'not': TokenTypes.NOT,
  'and': TokenTypes.AND,
  'or': TokenTypes.OR,
  'is': TokenTypes.IS,
  'for': TokenTypes.FOR,
  'while': TokenTypes.WHILE,
  'if': TokenTypes.IF,
  'elif': TokenTypes.ELIF,
  'else': TokenTypes.ELSE,
  'in': TokenTypes.IN,
  'let': TokenTypes.LET,
  'func': TokenTypes.FUNC,
  'print': TokenTypes.PRINT,
}

export type TokenConfig = {
  type: TokenTypes;
  literal: string | null;
  row: [number, number];
  col: [number, number];
}

export class Token {
  public type: TokenTypes;
  public literal: string | null;
  public row: [number, number];
  public col: [number, number];

  constructor(tokenConfig: TokenConfig) {
    this.type = tokenConfig.type;
    this.literal = tokenConfig.literal;
    this.row = tokenConfig.row;
    this.col = tokenConfig.col;
  }
}
