import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export const openai = const run = async () => {
  /* Embed queries */
  const embeddings = new OpenAIEmbeddings();
  const res = await embeddings.embedQuery("Hello world");
  console.log(res);
  /* Embed documents */
  const documentRes = await embeddings.embedDocuments([
    "Hello world",
    "Bye bye",
  ]);
  console.log({ documentRes });
};
