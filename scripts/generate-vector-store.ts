// scripts/generate-vector-store.ts

const { FaissStore } = require("@langchain/community/vectorstores/faiss");
const { HuggingFaceTransformersEmbeddings } = require("@langchain/community/embeddings/huggingface_transformers");
const { staticKnowledge } = require("../src/app/lib/knowledge"); 
require("dotenv/config"); 

const docs = staticKnowledge.map((entry: { text: string; id: string; }) => ({
  pageContent: entry.text,
  metadata: { id: entry.id },
}));

const embeddings = new HuggingFaceTransformersEmbeddings({
  model: "Xenova/all-MiniLM-L6-v2"
});

const run = async () => {
  try {
    console.log("Creating vector store... this may take a moment.");
    const vectorStore = await FaissStore.fromDocuments(docs, embeddings);

    const directory = "vector_store";
    await vectorStore.save(directory);
    console.log(`✅ Vector store saved to ${directory}`);
  } catch (e) {
    console.error("❌ An error occurred:", e);
  }
};

run();