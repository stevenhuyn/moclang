export enum AgentKind {
  Era,
  Con,
  Dup,
}

export enum Slot {
  Prin = "main",
  Left = "left",
  Right = "right",
}

export type AgentId = number;

export interface Port {
  id: AgentId;
  slot: Slot;
}

export class Port implements Port {
  private constructor(id: AgentId, kind: Slot) {
    this.id = id;
    this.slot = kind;
  }

  static prin(id: AgentId): Port {
    return new Port(id, Slot.Prin);
  }

  static left(id: AgentId): Port {
    return new Port(id, Slot.Left);
  }

  static right(id: AgentId): Port {
    return new Port(id, Slot.Right);
  }
}

export const ROOT: Port = { id: 0, slot: Slot.Prin };

export interface Agent {
  main: Port;
  left: Port;
  right: Port;
  kind: AgentKind;
  alive: boolean;
}

export class Agent implements Agent {
  constructor(main: Port, left: Port, right: Port, kind: AgentKind) {
    this.main = main;
    this.left = left;
    this.right = right;
    this.kind = kind;
    this.alive = true;
  }

  static with_id(id: AgentId, kind: AgentKind): Agent {
    return new Agent(Port.prin(id), Port.left(id), Port.right(id), kind);
  }

  public port(slot: Slot): Port {
    switch (slot) {
      case Slot.Prin:
        return this.main;
      case Slot.Left:
        return this.left;
      case Slot.Right:
        return this.right;
    }
  }

  public toString(): string {
    return `${this.kind}(${this.main.id}-${this.main.slot}, ${this.left.id}-${this.left.slot}, ${this.right.id}-${this.right.slot})`;
  }
}

export interface INet {
  nodes: Agent[];
  pairs: [AgentId, AgentId][];
  rewrites: number;
}

export class INet implements INet {
  private constructor(nodes: Agent[], rewrites: number) {
    this.nodes = nodes;
    this.rewrites = rewrites;
  }

  static default(): INet {
    // Creating a root node where the left connect to lect and prin connect to right bruh
    return new INet([
      new Agent(Port.right(0), Port.left(0), Port.prin(0), AgentKind.Era),
    ], 0);
  }

  public link(a: Port, b: Port): void {
    this.nodes[a.id][a.slot] = b;
    this.nodes[b.id][b.slot] = a;
  }

  public enter(port: Port): Port {
    return this.nodes[port.id][port.slot];
  }

  public rewrite(a: AgentId, b: AgentId): void {
    this.rewrites += 1;
    const a_node = this.nodes[a];
    const b_node = this.nodes[b];

    // TODO: be careful with erase nodes I think.
    if (a_node.kind === b_node.kind) {
      console.log("Annihilating", a, b);
      this.annihilate(a, b);
    } else {
      console.log("Commuting", a, b);
      this.commute(a, b);
    }
  }

  public test;

  // TODO: I should not search the whole tree for pairs everytime
  public reduce(): void {
    for (let i = 0; i < 10; i++) {
      for (let aid = 0; aid < this.nodes.length; aid++) {
        let a = this.nodes[aid];
        if (a.alive) {
          const b = a.main;
          if (b.slot === Slot.Prin && aid !== 0 && b.id !== 0) {
            this.rewrite(aid, b.id);
            this.display();
            break;
          }
        }
      }
    }
  }

  public annihilate(a: AgentId, b: AgentId): void {
    const a_left = this.nodes[a].left;
    const b_left = this.nodes[b].left;
    this.link(a_left, b_left);

    const a_right = this.nodes[a].right;
    const b_right = this.nodes[b].right;
    this.link(a_right, b_right);

    this.kill(a);
    this.kill(b);
  }

  public kill(id: AgentId): void {
    this.nodes[id].alive = false;
  }

  public commute(a: AgentId, b: AgentId): void {
    const an = this.alloc(this.nodes[a].kind);
    const bn = this.alloc(this.nodes[b].kind);

    const a_left = this.nodes[a].left;
    this.link(Port.prin(b), a_left);

    const a_right = this.nodes[a].right;
    this.link(Port.prin(bn), a_right);

    const b_left = this.nodes[b].left;
    this.link(Port.prin(an), b_left);

    const b_right = this.nodes[b].right;
    this.link(Port.prin(a), b_right);

    this.link(Port.left(a), Port.right(b));
    this.link(Port.right(a), Port.right(bn));
    this.link(Port.left(an), Port.left(b));
    this.link(Port.right(an), Port.left(bn));
  }

  public alloc(kind: AgentKind): AgentId {
    const id = this.nodes.length;
    this.nodes.push(Agent.with_id(id, kind));
    return id;
  }

  public display(): void {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (node.alive) {
        console.log(i, node.toString());
      }
    }
  }
}
