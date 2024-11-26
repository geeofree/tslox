import fs from "fs/promises";
import util from "util";
import readline from "readline/promises";
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
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.setPrompt('Lox> ');
    rl.prompt();
    rl.on('line', input => {
      const tokens = new Scanner(input).scan();
      const ast = new Parser(tokens).parse();
      if (ast) {
        new Interpreter(ast).interpret();
      }
    });
  }
}
