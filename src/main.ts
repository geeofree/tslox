import { Lox } from "./lox";

const file = process.argv[2];

if (file) {
  Lox.runFile(file);
} else {
  Lox.runPrompt();
}
