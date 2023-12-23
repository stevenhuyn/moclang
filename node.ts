export type Node = App | Lam | Dup | Era | Var;

enum Cell {
  App = "app",
  Lam = "lam",
  Dup = "dup",
  Era = "era",
  Var = "var",
}

enum PortType {
  Prin = "prin",
  Left = "left",
  Right = "right",
}

// Define a port as a tuple of a port to connect to and its port type
type Port = [Node, PortType];

export interface App {
  type: Cell.App;
  // id: number;
  prin: Port | null;
  left: Port | null;
  right: Port | null;
}

export interface Lam {
  type: Cell.Lam;
  // id: number;
  prin: Port | null;
  left: Port | null;
  right: Port | null;
}

export interface Dup {
  type: Cell.Dup;
  // id: number;
  prin: Port | null;
  left: Port | null;
  right: Port | null;
}

export interface Era {
  type: Cell.Era;
  // id: number;
  prin: Port | null;
}

export interface Var {
  type: Cell.Var;
  // id: number;
  prin: Port | null;
}

const assignPort = (node: Node, portType: PortType, port: Port) => {
  switch (node.type) {
    case Cell.App:
    case Cell.Dup:
    case Cell.Lam:
      if (portType === PortType.Prin || portType === PortType.Left || portType === PortType.Right) {
        node[portType] = port;
      }
      break;
    case Cell.Era:
    case Cell.Var:
      if (portType === PortType.Prin) {
        node[portType] = port;
      }
      break;
  }
};

const link = (a: Node, aPortType: PortType, b: Node, bPortType: PortType) => {
  const portA: Port = [b, bPortType];
  const portB: Port = [a, aPortType];

  assignPort(a, aPortType, portA);
  assignPort(b, bPortType, portB);
};

const con = (type: Cell): Node => {
  if (Cell.App === type || Cell.Lam === type || Cell.Dup === type) {
    return { type, prin: null, left: null, right: null };
  } else if (Cell.Era === type || Cell.Var === type) {
    return { type, prin: null };
  }

  throw new Error("Invalid type");
};

const printNode = (node: Node, visited: Set<Node>): void => {
  if (visited.has(node)) {
    console.log(`Node (already visited): ${node.type}`);
    return;
  }

  visited.add(node);

  console.log(`Node: ${node.type}`);
  for (const portType of Object.values(PortType)) {
    const port = node[portType];
    if (port) {
      const [connectedNode, connectedPortType] = port;
      console.log(`  ${portType} -> ${connectedNode.type}:${connectedPortType}`);
      printNode(connectedNode, visited);
    }
  }
};

const printGraph = (root: Node): void => {
  const visited = new Set<Node>();
  printNode(root, visited);
};

type Tree = Node;
type ActivePair = [Tree, Tree];

class Net {
  private nodes: Tree[];
  private activePairs: ActivePair[];

  constructor() {
    this.nodes = [];
    this.activePairs = [];
  }
}

/** Network Lang
 * # First name all loose wires
 * root
 *
 * # Then name all nodes
 * # (type id prin left right)
 *
 * (lam lamf root era lamn.0)
 * (lam lamn lamf.1 lamn.1 lamn.0)
 */

// Defining 0 \fx.x
// let root = con(Cell.Var);
// let era = con(Cell.Era);
// let flam = con(Cell.Lam);
// let nlam = con(Cell.Lam);
// root.prin = [flam, PortType.Prin];

// link(root, PortType.Prin, flam, PortType.Prin);
// link(flam, PortType.Left, era, PortType.Prin);
// link(flam, PortType.Right, nlam, PortType.Prin);
// link(nlam, PortType.Left, nlam, PortType.Right);

// printGraph(root);
