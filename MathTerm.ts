// https://ruslanspivak.com/lsbasi-part7/

enum TokenType {
  LeftParen,
  RightParen,
  Plus,
  Multiply,
  Number,
}

interface Tokens {
  next: () => string | null;
  peek: () => string | null;
}

function lex(input: string): Tokens {
  const re = /[()+*]|\d+/g;
  const matches = input.matchAll(re);
  const tokens = Array.from(matches, (match) => match[0]);

  let curr = 0;
  const next = () => {
    if (curr >= tokens.length) {
      return null;
    }

    const token = tokens[curr];
    curr += 1;
    return token;
  };
  const peek = () => {
    if (curr >= tokens.length) {
      return null;
    }

    return tokens[curr];
  };

  return { next, peek };
}

interface AddExpr {
  kind: "Addition";
  left: Expr;
  right: Expr;
}

interface MulExpr {
  kind: "Multiplication";
  left: Expr;
  right: Expr;
}

interface NumExpr {
  kind: "NumberLiteral";
  value: number;
}

const AddExpr = (left: Expr, right: Expr): AddExpr => ({
  kind: "Addition",
  left,
  right,
});

const MulExpr = (left: Expr, right: Expr): MulExpr => ({
  kind: "Multiplication",
  left,
  right,
});

const NumExpr = (value: number): NumExpr => ({
  kind: "NumberLiteral",
  value,
});

type Expr = AddExpr | MulExpr | NumExpr;

class Parser {
  private tokens: Tokens;

  constructor(tokens: Tokens) {
    this.tokens = tokens;
  }

  parse(): Expr | null {
    const nextToken = this.tokens.peek();
    if (nextToken === null) {
      return null;
    } else if (nextToken === "(") {
      this.tokens.next();
      const expr = this.parse();
      this.tokens.next();
      return expr;
    } else if (nextToken === ")") {
      return null;
    } else if (nextToken === "+") {
      this.tokens.next();
      const expr = this.parse();
      this.tokens.next();
      return expr;
    } else if (nextToken === "*") {
      this.tokens.next();
      const expr = this.parse();
      this.tokens.next();
      return expr;
    } else if (/\d+/.test(nextToken)) {
      this.tokens.next();
      return NumExpr(parseInt(nextToken)));
    }

    return null;
  }
}

function parse(tokens: Tokens): Expr | null {
  const nextToken = tokens.peek();
  if (nextToken === null) {
    return null;
  } else if (nextToken === "(") {
    tokens.next();
    const expr = parse(tokens);
    tokens.next();
    return expr;
  } else if (nextToken === ")") {
    return null;
  } else if (nextToken === "+") {
    tokens.next();
    const expr = parse(tokens);
    tokens.next();
    return expr;
  } else if (nextToken === "*") {
    tokens.next();
    const expr = parse(tokens);
    tokens.next();
    return expr;
  } else if (/\d+/.test(nextToken)) {
    tokens.next();
    return NumExpr(parseInt(nextToken)));
  }

  return null;
}

if (import.meta.main) {
  let input = "1 + 2 * 3";
  const tokens = lex(input);

  for (let token = tokens.next(); token !== undefined; token = tokens.next()) {
    console.log(token);
  }
}
