import fs from "fs/promises";
import util from "util";
import { Scanner } from "./scanner";
import { Parser } from "./parser";
import { Interpreter } from "./interpreter";

export class Lox {
  public static async runFile(sourceFile: string) {
    const file = await fs.readFile(sourceFile, { encoding: 'utf8' });
    const tokens = new Scanner(file).scan();
    const ast = new Parser(tokens).parse();
    if (ast) {
      console.log(tokens, util.inspect(ast, { showHidden: false ,depth: null, colors: true }));
      new Interpreter(ast).interpret();
    }
  }

  public static runRepl() {
    console.warn("REPL not yet implemented!");
  }
}
