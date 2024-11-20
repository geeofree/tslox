import { Interpreter } from "./interpreter";

const [_, __, sourceFile] = process.argv

if (sourceFile) {
  Interpreter.runFile(sourceFile);
} else {
  Interpreter.runRepl();
}
