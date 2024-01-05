import { AgentId, AgentKind, INet, Port, Slot } from "./INet.ts";

interface LamExpr {
  kind: "Lambda";
  arg: symbol;
  body: LambdaExpr;
}

interface AppExpr {
  kind: "Application";
  left: LambdaExpr;
  right: LambdaExpr;
}

interface VarExpr {
  kind: "Variable";
  name: symbol;
}

interface ArgExpr {
  kind: "Argument";
  name: symbol;
}

const LamExpr = (arg: symbol, body: LambdaExpr): LamExpr => ({
  kind: "Lambda",
  arg,
  body,
});

const AppExpr = (left: LambdaExpr, right: LambdaExpr): AppExpr => ({
  kind: "Application",
  left,
  right,
});

const VarExpr = (name: symbol): VarExpr => {
  return {
    kind: "Variable",
    name: name,
  };
};

type LambdaExpr = LamExpr | AppExpr | VarExpr;

// const lambdaToNet = (expr: LambdaExpr): INet => {
//   // Holding expression + parent to relink
//   let stack: [LambdaExpr, AgentId][] = [[expr, 0]];
//   let net = INet.default();
//   let args: Set<symbol> = [];

//   while (stack.length > 0) {
//     const [currLamExpr, parentNetId] = stack.pop()!;

//     if (currLamExpr.kind == "Lambda") {
//       const arg = currLamExpr.arg;
//       args.add(arg);
//       const currNetId = net.alloc(AgentKind.Con);

//       const parentType = net.nodes[parentNetId].kind;
//       if (parentType == AgentKind.Con) {
//         net.link(Port.prin(currNetId), Port.right(parentNetId));
//       } else if (parentType == AgentKind.Con) {
//         net.link(Port.prin(currNetId), Port.left(parentNetId));
//       }

//       stack.push([currLamExpr.body, currNetId]);
//     }
//   }
// };
