type Agent = "app" | "lam" | "dup" | "era" | "var";
type PortType = "left" | "right" | "prin";
type Port = [Cell, PortType];
interface Cell {
  type: Agent;
  id: number;
  prin: Port;
  left: Port;
  right: Port;
}

const VOID: Cell = {
  type: "var",
  id: 0,
  prin: null!,
  left: null!,
  right: null!,
};

type Tree = Cell;
type Active = [Tree, Tree];

class Net {
  private nodeCount: number = 0;

  constructor(public trees: Tree[], public active: Active[]) {}

  public reduce() {
    // switch ([a.type, b.type]) {
    //   case ["app", "app"]:
    //     this.annihilate(a, b);
  }

  public annihilate(i: number, j: number) {
    // Assumes principle ports are connected

    const a = this.trees[i];
    const b = this.trees[j];

    this.link(a.left[0], b.left[0], a.left[1], b.left[1]);
    this.link(a.right[0], b.right[0], a.right[1], b.right[1]);

    if (a.left[1] === "prin" && b.left[1] === "prin") {
      this.active.push([a.left[0], b.left[0]]);
    }

    if (a.right[1] === "prin" && b.right[1] === "prin") {
      this.active.push([a.right[0], b.right[0]]);
    }

    // Remove the annihilated nodes
    this.removePair(i, j);
  }

  public duplication(i: number, j: number) {
    // Assumes principle ports are connected

    const a = this.trees[i];
    const b = this.trees[j];

    // tl = top left, br = bottom right, etc.
    const tl = this.spawn(b.type);
    const tr = this.spawn(b.type);
    const bl = this.spawn(a.type);
    const br = this.spawn(a.type);

    this.link(tl, br, "right", "right");
    this.link(tr, bl, "left", "left");
    this.link(tl, bl, "left", "right");
    this.link(tr, br, "right", "left");

    this.link(tl, a.right[0], "prin", a.right[1]);
    this.link(tr, a.left[0], "prin", a.left[1]);
    this.link(bl, b.left[0], "prin", b.left[1]);
    this.link(br, b.right[0], "prin", b.right[1]);

    // Add new active pairs
    if (a.right[1] === "prin") {
      this.active.push([tl, a.right[0]]);
    }

    if (a.left[1] === "prin") {
      this.active.push([tr, a.left[0]]);
    }

    if (b.left[1] === "prin") {
      this.active.push([bl, b.left[0]]);
    }

    if (b.right[1] === "prin") {
      this.active.push([br, b.right[0]]);
    }

    // Remove the duplicated nodes
    this.removePair(i, j);
  }

  public spawn(type: Agent): Cell {
    const node: Cell = {
      type: type,
      id: this.nodeCount,
      prin: null!,
      left: null!,
      right: null!,
    };
    this.nodeCount += 1;
    this.trees.push(node);

    return node;
  }

  public removePair(i: number, j: number) {
    if (i < j) {
      this.trees.splice(j, 1);
      this.trees.splice(i, 1);
    } else {
      this.trees.splice(i, 1);
      this.trees.splice(j, 1);
    }
  }

  public link(a: Tree, b: Tree, portA: PortType, portB: PortType) {
    a[portA] = [b, portB];
    b[portB] = [a, portA];
  }
}
