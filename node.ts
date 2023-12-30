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
    return `${this.kind}(${this.main.id}, ${this.left.id}, ${this.right.id})`;
  }
}

export interface INet {
  nodes: Agent[];
  rewrites: number;
}

export class INet implements INet {
  private constructor(nodes: Agent[], rewrites: number) {
    this.nodes = nodes;
    this.rewrites = rewrites;
  }

  static default(): INet {
    // Creating a root node where the left connect to lect and prin connect to right bruh
    return new INet(
      [new Agent(Port.right(0), Port.left(0), Port.prin(0), AgentKind.Era)],
      0
    );
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

    console.log(a, b);
    console.log(a_node.kind, b_node.kind);
    console.log("bruh", [a_node.kind, b_node.kind].join(","));

    if (a_node.kind === b_node.kind) {
      this.annihilate(a, b);
    } else {
      this.commute(a, b);
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

  public commute(a_id: AgentId, b_id: AgentId): void {
    const a_node = this.nodes[a_id];
    const b_node = this.nodes[b_id];

    const a_new_id = this.alloc(a_node.kind);
    const b_new_id = this.alloc(b_node.kind);

    const a_left = this.nodes[a_id].left;
    this.link(Port.left(b_new_id), a_left);

    const a_right = this.nodes[a_id].right;
    this.link(Port.right(b_id), a_right);

    const b_left = this.nodes[b_id].left;
    this.link(Port.left(a_new_id), b_left);

    const b_right = this.nodes[b_id].right;
    this.link(Port.right(a_id), b_right);

    this.link(Port.prin(a_new_id), Port.left(b_new_id));
    this.link(Port.right(a_new_id), Port.right(b_id));
    this.link(Port.left(a_id), Port.right(b_new_id));
    this.link(Port.right(a_id), Port.right(b_id));
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
