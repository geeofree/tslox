interface Log {
  type: "info" | "warning" | "error";
  title: string;
  description: string;
  data: any;
}

export class Logger {
  logs: Log[];

  constructor() {
    this.logs = [];
  }

  static addError(char: string, line: number, columnOffset: number): void {
    console.error(`Unexpected character: ${char} [${line}:${columnOffset}]`);
  }
}
