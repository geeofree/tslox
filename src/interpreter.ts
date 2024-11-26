import fs from "fs/promises";
import util from "util";
import { Scanner } from "./scanner";
import { Parser } from "./parser";
import { Evaluator } from "./evaluator";

export class Interpreter {
  public static async runFile(sourceFile: string) {
    const file = await fs.readFile(sourceFile, { encoding: 'utf8' });
    const tokens = new Scanner(file).scan();
    const ast = new Parser(tokens).parse();
    console.log(tokens, util.inspect(ast, { showHidden: false ,depth: null, colors: true }));
    if (ast) {
      new Evaluator().evaluate(ast);
    }
  }

  public static runRepl() {
    console.warn("REPL not yet implemented!");
  }
}
