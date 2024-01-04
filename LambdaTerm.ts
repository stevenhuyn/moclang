import { AgentId, AgentKind, INet, Port, Slot } from "./INet";

interface LamExpr {
  kind: "Lambda";
  arg: Symbol;
  body: LambdaExpr;
}

interface AppExpr {
  kind: "Application";
  left: LambdaExpr;
  right: LambdaExpr;
}

interface VarExpr {
  kind: "Variable";
  name: Symbol;
}

interface ArgExpr {
  kind: "Argument";
  name: Symbol;
}

const LamExpr = (arg: Symbol, body: LambdaExpr): LamExpr => ({
  kind: "Lambda",
  arg,
  body,
});

const AppExpr = (left: LambdaExpr, right: LambdaExpr): AppExpr => ({
  kind: "Application",
  left,
  right,
});

const VarExpr = (name: Symbol): VarExpr => {
  return {
    kind: "Variable",
    name: name,
  };
};

type LambdaExpr = LamExpr | AppExpr | VarExpr;

const lambdaToNet = (expr: LambdaExpr): INet => {
  // Holding expression + parent to relink
  let stack: [LambdaExpr, AgentId][] = [[expr, 0]];
  let net = INet.default();
  let args: Set<Symbol> = [];

  while (stack.length > 0) {
    const [currLamExpr, parentNetId] = stack.pop()!;

    if (currLamExpr.kind == "Lambda") {
      const arg = currLamExpr.arg;
      args.add(arg);
      const currNetId = net.alloc(AgentKind.Con);

      const parentType = net.nodes[parentNetId].kind;
      if (parentType == AgentKind.Con) {
        net.link(Port.prin(currNetId), Port.right(parentNetId));
      } else if (parentType == AgentKind.Con) {
        net.link(Port.prin(currNetId), Port.left(parentNetId));
      }

      stack.push([currLamExpr.body, currNetId]);
    }
  }
};
