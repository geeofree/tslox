import fs from "fs/promises";
import util from "util";
import { Scanner } from "./scanner";
import { Parser } from "./parser";

export class Interpreter {
  public static async runFile(sourceFile: string) {
    const file = await fs.readFile(sourceFile, { encoding: 'utf8' });
    const tokens = new Scanner(file).scan();
    const ast = new Parser(tokens).parse();
    console.log(tokens, util.inspect(ast, { showHidden: false ,depth: null, colors: true }));
  }

  public static runRepl() {
    console.warn("REPL not yet implemented!");
  }
}
