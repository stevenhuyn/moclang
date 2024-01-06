import { AgentId, AgentKind, INet, Port, Slot } from "./INet.ts";

interface LamExpr {
  kind: "Lambda";
  arg: VarExpr;
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
type parentContext = "arg" | "body" | "left" | "right" | "root";
type AgentLookup = Map<AgentId, LambdaExpr["kind"] | "Root">;

const lambdaToNet = (expr: LambdaExpr): INet => {
  // (lamCurrent, lamParent, netParentId, parentContext)
  let stack: [LambdaExpr, LambdaExpr | null, AgentId, parentContext][] = [[expr, null, 0, "root"]];
  let net = INet.default();
  let lookup: AgentLookup = new Map();
  lookup.set(0, "Root");

  while (stack.length > 0) {
    const [currLamExpr, parentLamExpr, parentNetId, context] = stack.pop()!;

    if (currLamExpr.kind == "Lambda") {
      const currNetId = net.alloc(AgentKind.Con);
      lookup.set(currNetId, "Lambda");
      stack.push([currLamExpr.arg, currLamExpr, currNetId, "arg"]);
      stack.push([currLamExpr.body, currLamExpr, currNetId, "body"]);

      if (parentLamExpr === null) {
        net.link(Port.prin(currNetId), Port.prin(parentNetId));
      } else if (parentLamExpr.kind == "Lambda") {
        if (context == "arg") {
          throw new Error("Impossible");
        } else if (context == "body") {
          net.link(Port.prin(currNetId), Port.right(parentNetId));
        }
      } else if (parentLamExpr.kind == "Application") {
        if (context == "left") {
          net.link(Port.prin(currNetId), Port.prin(parentNetId));
        } else if (context == "right") {
          net.link(Port.prin(currNetId), Port.left(parentNetId));
        }
      }


    } else if (currLamExpr.kind == "Application") {
      const currNetId = net.alloc(AgentKind.Con);
      lookup.set(currNetId, "Application");
      stack.push([currLamExpr.left, currLamExpr, currNetId, "left"]);
      stack.push([currLamExpr.right, currLamExpr, currNetId, "right"]);

      if (parentLamExpr === null) {
        net.link(Port.right(currNetId), Port.prin(parentNetId));
      } else if (parentLamExpr.kind === "Application") {
        if (context == "left") {
          net.link(Port.right(currNetId), Port.prin(parentNetId));
        } else if (context == "right") {
          net.link(Port.right(currNetId), Port.left(parentNetId));
        }
      } else if (parentLamExpr.kind === "Lambda") {
        if (context == "arg") {
          throw new Error("Impossible");
        } else if (context == "body") {
          net.link(Port.right(currNetId), Port.right(parentNetId));
        }
      }
    } else if (currLamExpr.kind == "Variable") {
      const currNetId = net.alloc(AgentKind.Era);
      lookup.set(currNetId, "Variable");

      if (parentLamExpr === null) {
        throw new Error("Impossible");
      } else if (parentLamExpr.kind === "Lambda") {
        if (context == "arg") {
          net.link(Port.prin(currNetId), Port.left(parentNetId));
        } else if (context == "body") {
          net.link(Port.prin(currNetId), Port.right(parentNetId));
        }
      } else if (parentLamExpr.kind === "Application") {
        if (context == "left") {
          net.link(Port.prin(currNetId), Port.prin(parentNetId));
        } else if (context == "right") {
          net.link(Port.prin(currNetId), Port.left(parentNetId));
        }
      } 
    }
  }

  return net;
};
