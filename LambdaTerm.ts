interface LamExpr {
  kind: "Lambda";
  body: Expr;
}

interface AppExpr {
  kind: "Application";
  left: Expr;
  right: Expr;
}

interface VarExpr {
  kind: "Variable";
  name: string;
}

const LamExpr = (body: Expr): LamExpr => ({
  kind: "Lambda",
  body,
});

const AppExpr = (left: Expr, right: Expr): AppExpr => ({
  kind: "Application",
  left,
  right,
});

const VarExpr = (name: string): VarExpr => ({
  kind: "Variable",
  name,
});

type Expr = LamExpr | AppExpr | VarExpr;
