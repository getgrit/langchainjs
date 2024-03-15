import { loadChain } from "langchain/chains/load";

export const load_from_hub = const run = async () => {
  const chain = await loadChain("lc://chains/hello-world/chain.json");
  const res = chain.call({ topic: "foo" });
  console.log(res);
};
