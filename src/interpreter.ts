import fs from "fs/promises";
import { Scanner } from "./scanner";

export class Interpreter {
  public static async runFile(sourceFile: string) {
    const file = await fs.readFile(sourceFile, { encoding: 'utf8' });
    const tokens = new Scanner(file).scan();
    console.log(tokens);
  }

  public static runRepl() {
    console.warn("REPL not yet implemented!");
  }
}
