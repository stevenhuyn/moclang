enum NodeType {
  Aux,
  Nil,
  Two,
}

interface Aux {
  type: NodeType.Aux;
  other: Aux;
  label: string;
}

interface Nil {
  type: NodeType.Nil;
  label: undefined;
}

interface Two {
  type: NodeType.Two;
  tag: number;
  label: undefined;
  left: Tree;
  right: Tree;
}

type Tree = Aux | Nil | Two;

const con = (a: Tree, b: Tree): Tree => {
  return ctr(0, a, b);
};

const dup = (a: Tree, b: Tree): Tree => {
  return ctr(1, a, b);
};

// Helper constructor
const ctr = (tag: number, a: Tree, b: Tree): Tree => {
  return {
    type: NodeType.Two,
    tag,
    label: undefined,
    left: a,
    right: b,
  };
};

const wire = (label: string): [Aux, Aux] => {
  // unsafe
  {
    const x: Aux = { type: NodeType.Aux, other: null!, label };
    const y: Aux = { type: NodeType.Aux, other: x as Aux, label };
    x.other = y;
    return [x, y];
  }
};

export type Pair = [Tree, Tree];

export type Net = [Tree[], Pair[]];

const pairLabel = (x: Tree, y: Tree): string => {
  return y.label || x.label || "";
};

export const reduce = ([a, b]: Pair): Pair => {
  if (a.type === NodeType.Aux) {
    if (b.type === NodeType.Aux) {
      a.other.other = b.other;
      b.other.other = a.other;
      a.other.label = b.other.label = pairLabel(a, b);
    } else {
      return [a.other, b];
    }
  }
};
