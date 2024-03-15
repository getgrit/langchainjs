import { SingleStoreVectorStore } from "langchain/vectorstores/singlestore";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export const singlestore_with_metadata_filter = const run = async () => {
  const vectorStore = await SingleStoreVectorStore.fromTexts(
    ["Good afternoon", "Bye bye", "Boa tarde!", "Até logo!"],
    [
      { id: 1, language: "English" },
      { id: 2, language: "English" },
      { id: 3, language: "Portugese" },
      { id: 4, language: "Portugese" },
    ],
    new OpenAIEmbeddings(),
    {
      connectionOptions: {
        host: process.env.SINGLESTORE_HOST,
        port: Number(process.env.SINGLESTORE_PORT),
        user: process.env.SINGLESTORE_USERNAME,
        password: process.env.SINGLESTORE_PASSWORD,
        database: process.env.SINGLESTORE_DATABASE,
      },
      distanceMetric: "EUCLIDEAN_DISTANCE",
    }
  );

  const resultOne = await vectorStore.similaritySearch("greetings", 1, {
    language: "Portugese",
  });
  console.log(resultOne);
  await vectorStore.end();
};
