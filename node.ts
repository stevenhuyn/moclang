export type Node = App | Lam | Dup | Era;

export interface App {
  type: "app";
  id: number;
  prin: Node;
  arg: Node;
  ret: Node;
}

export interface Lam {
  type: "lam";
  id: number;
  prin: Node;
  left: Node;
  right: Node;
}

export interface Dup {
  type: "dup";
  id: number;
  prin: Node;
  left: Node;
  right: Node;
}

export interface Era {
  type: "era";
  id: number;
  prin: Node;
}

type Tree = Node;
type ActivePair = [Tree, Tree];
type Net = [Tree[], ActivePair[]];

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
