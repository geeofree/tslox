import fs from "fs/promises";
import { Scanner } from "./scanner";

export class Lox {
  static async runFile(filePath: string): Promise<void> {
    const file = await fs.readFile(filePath, { encoding: 'utf8' });
    const scanner = new Scanner(file);
    const tokens = scanner.scan();
    console.log(tokens);
  }

  static runPrompt(): void {
    console.log('<unimplemented lox interpreter>');
  }
}
