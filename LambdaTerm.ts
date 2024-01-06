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

const LamExpr = (arg: VarExpr, body: LambdaExpr): LamExpr => ({
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

const lambdaToNet = (expr: LambdaExpr): INet => {
  // (lamCurrent, lamParent, netParentId, parentContext)
  let stack: [LambdaExpr, LambdaExpr | null, AgentId, parentContext][] = [[expr, null, 0, "root"]];
  let net = INet.default();
  let argSymbols: Map<symbol, AgentId> = new Map();
  let varSymbols: Map<symbol, Port[]> = new Map();

  while (stack.length > 0) {
    const [currLamExpr, parentLamExpr, parentNetId, context] = stack.pop()!;

    if (currLamExpr.kind == "Lambda") {
      const currNetId = net.alloc(AgentKind.Con);
      argSymbols.set(currLamExpr.arg.name, currNetId);

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

      if (!varSymbols.has(currLamExpr.name)) {
        varSymbols.set(currLamExpr.name, []);
      }


      if (parentLamExpr === null) {
        throw new Error("Impossible");
      } else if (parentLamExpr.kind === "Lambda") {
        if (context == "arg") {
          // Don't push here because it's an argSymbol
          // varSymbols.get(currLamExpr.name)!.push(Port.left(parentNetId));
          net.link(Port.prin(currNetId), Port.left(parentNetId));
        } else if (context == "body") {
          varSymbols.get(currLamExpr.name)!.push(Port.right(parentNetId));
          net.link(Port.prin(currNetId), Port.right(parentNetId));
        }
      } else if (parentLamExpr.kind === "Application") {
        if (context == "left") {
          varSymbols.get(currLamExpr.name)!.push(Port.prin(parentNetId));
          net.link(Port.prin(currNetId), Port.prin(parentNetId));
        } else if (context == "right") {
          varSymbols.get(currLamExpr.name)!.push(Port.left(parentNetId));
          net.link(Port.prin(currNetId), Port.left(parentNetId));
        }
      } 
    }
  }

  console.log(argSymbols);
  console.log(varSymbols);

  // Now to link up any variables to args
  for (const [symbol, agentId] of argSymbols) {
    if (!varSymbols.has(symbol)) {
      throw new Error("Impossible");
    }

    const varAgentData = varSymbols.get(symbol)!;
    let connections = [Port.left(agentId)];

    for (let i = 0; i < varAgentData.length - 1; i++) {
      let dup = net.alloc(AgentKind.Dup);
      let connection = connections.pop()!;

      net.link(Port.prin(dup), Port.left(connection.id));
      connections.push(Port.right(dup), Port.left(dup));
    }

    const toBeKilled = [];

    // zipping varAgentData and connections
    for (let i = 0; i < varAgentData.length; i++) {
      const varPort = varAgentData[i];
      const argPort = connections[i];

      const varPortParent = net.nodes[net.enter(varPort).id].kind;
      const argPortParent = net.nodes[net.enter(argPort).id].kind;
      if (varPortParent == AgentKind.Era) {
        toBeKilled.push(net.enter(varPort).id);
      }

      if (argPortParent == AgentKind.Era) {
        toBeKilled.push(net.enter(argPort).id);
      }
      
      console.log(argPort, varPort);
      net.link(argPort, varPort);
    }

    // Remove dead ERAs
    for (const eraId of toBeKilled) {
      net.kill(eraId);
    }
  }

  return net;
};


if (import.meta.main) {
  const x = VarExpr(Symbol("x"));
  const y = VarExpr(Symbol("y"));
  const doubleApplyExpr = LamExpr(x, AppExpr(x, x));
  const appliedExpr = AppExpr(doubleApplyExpr, y);

  const net = lambdaToNet(appliedExpr);
  net.display();
  net.reduce();
}