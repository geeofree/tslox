import { Lox } from "./lox";

const [_, __, sourceFile] = process.argv

if (sourceFile) {
  Lox.runFile(sourceFile);
} else {
  Lox.runRepl();
}
