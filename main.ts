import { AgentKind, INet, Port, Slot } from "./INet.ts";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const net = INet.default();

  // Defining Zero
  const z1 = net.alloc(AgentKind.Con);
  const z2 = net.alloc(AgentKind.Era);
  const z3 = net.alloc(AgentKind.Con);

  net.link(Port.left(z1), Port.prin(z2));
  net.link(Port.right(z1), Port.prin(z3));
  net.link(Port.left(z3), Port.right(z3));

  // Defining Succ
  const s1 = net.alloc(AgentKind.Con);
  const s2 = net.alloc(AgentKind.Con);
  const s3 = net.alloc(AgentKind.Con);
  const sd = net.alloc(AgentKind.Dup);
  const sa1 = net.alloc(AgentKind.Con);
  const sa2 = net.alloc(AgentKind.Con);
  const sa3 = net.alloc(AgentKind.Con);

  net.link(Port.left(s1), Port.prin(sa1));
  net.link(Port.right(s1), Port.prin(s2));
  net.link(Port.left(s2), Port.prin(sd));
  net.link(Port.right(s2), Port.prin(s3));
  net.link(Port.left(sa1), Port.left(sd));
  net.link(Port.right(sa1), Port.prin(sa2));
  net.link(Port.right(sd), Port.prin(sa3));
  net.link(Port.left(s3), Port.left(sa2));
  net.link(Port.right(s3), Port.right(sa3));
  net.link(Port.right(sa2), Port.left(sa3));

  const app = net.alloc(AgentKind.Con);
  net.link(Port.prin(app), Port.prin(s1));
  net.link(Port.left(app), Port.prin(z1));
  net.link(Port.right(app), Port.prin(0));

  net.reduce();
}
