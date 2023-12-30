import { AgentKind, INet, Port, Slot } from "./node.ts";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const net = INet.default();

  let id_1 = net.alloc(AgentKind.Con);
  let id_2 = net.alloc(AgentKind.Con);

  let dbl_1 = net.alloc(AgentKind.Con);
  let dbl_2 = net.alloc(AgentKind.Dup);
  let dbl_3 = net.alloc(AgentKind.Con);

  // ID function + root
  net.link(Port.left(id_1), Port.prin(id_2));
  net.link(Port.right(id_1), Port.prin(0));
  net.link(Port.left(id_2), Port.right(id_2));

  // Double function
  net.link(Port.left(dbl_1), Port.prin(dbl_2));
  net.link(Port.right(dbl_1), Port.right(dbl_3));
  net.link(Port.left(dbl_2), Port.left(dbl_3));
  net.link(Port.right(dbl_2), Port.prin(dbl_3));

  // Linking
  net.link(Port.prin(id_1), Port.prin(dbl_1));

  console.log("Created");
  net.display();

  net.reduce();
  console.log("Reduced");
  net.display();
}
