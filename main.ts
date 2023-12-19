export function add(a: number, b: number): number {
  return a + b;
}

export const poop = () => {
  console.log("poop");
};

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log("Add 2 + 3 =", add(2, 3));
  console.log("bruh moment");
  poop();
}
