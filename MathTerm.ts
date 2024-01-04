// https://ruslanspivak.com/lsbasi-part7/
// https://craftinginterpreters.com/parsing-expressions.html

enum TokenType {
  LeftParen = "LeftParen",
  RightParen = "RightParen",
  Add = "Add",
  Multiply = "Multiply",
  Number = "Number",
  EOF = "EOF",
}

interface Token {
  type: TokenType;
  value: string;
}

const Token = (type: TokenType, value: string): Token => ({ type, value });

interface Tokens {
  advance: () => Token;
  peek: () => Token;
  prev: () => Token;
}

const lex = (input: string): Tokens => {
  const re = /[()+*]|\d+/g;
  const matches = input.matchAll(re);
  const tokens = Array.from(matches, (match) => {
    let token = match[0];
    if (token === "(") {
      return Token(TokenType.LeftParen, token);
    } else if (token === ")") {
      return Token(TokenType.RightParen, token);
    } else if (token === "+") {
      return Token(TokenType.Add, token);
    } else if (token === "*") {
      return Token(TokenType.Multiply, token);
    } else {
      return Token(TokenType.Number, token);
    }
  });

  let curr = 0;
  const advance = () => {
    if (curr >= tokens.length) {
      return Token(TokenType.EOF, "");
    }

    const token = tokens[curr];
    curr += 1;
    return token;
  };
  const peek = () => {
    if (curr >= tokens.length) {
      return Token(TokenType.EOF, "");
    }

    return tokens[curr];
  };

  const prev = () => {
    if (curr <= 0) {
      return Token(TokenType.EOF, "");
    }

    return tokens[curr - 1];
  };

  return { advance, peek, prev };
};

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

const parse = (input: string): Expr => {
  const tokens = lex(input);

  const eat = (type: TokenType): void => {
    if (tokens.peek().type !== type) {
      throw new Error(`Expected ${type}`);
    }
    tokens.advance();
  };

  /**
   * expr     : binary
   * binary   : literal ( (MUL | ADD) literal )*
   * literal  : NUMBER | LEFT_PAREN expr RIGHT_PAREN
   */
  const expr = (): Expr => {
    return binary();
  };

  const binary = (): Expr => {
    let ret = literal();
    while (
      tokens.peek().type === TokenType.Add ||
      tokens.peek().type === TokenType.Multiply
    ) {
      const token = tokens.peek();
      if (token.type === TokenType.Add) {
        eat(TokenType.Add);
        const right = literal();
        ret = AddExpr(ret, right);
      } else if (token.type === TokenType.Multiply) {
        eat(TokenType.Multiply);
        const right = literal();
        ret = MulExpr(ret, right);
      }
    }

    return ret;
  };

  const literal = (): Expr => {
    const token = tokens.peek();
    if (token.type === TokenType.Number) {
      eat(TokenType.Number);
      return NumExpr(parseInt(token.value));
    } else if (token.type === TokenType.LeftParen) {
      eat(TokenType.LeftParen);
      const exprNode = expr();
      eat(TokenType.RightParen);
      return exprNode;
    } else {
      throw new Error("Expected number or '('");
    }
  };

  return expr();
};

if (import.meta.main) {
  let input = "(1 + 2 * 3) + 4";
  const tokens = parse(input);
  console.log(tokens);
}
