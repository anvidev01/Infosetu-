// scripts/generate-vector-store.ts

// We are using 'require' instead of 'import' to fix module errors
const { OpenAIEmbeddings } = require("@langchain/openai");
const { FaissStore } = require("@langchain/community/vectorstores/faiss");
// This is the key: we require the .ts file, and ts-node handles it.
const { staticKnowledge } = require("../src/app/lib/knowledge"); 
require("dotenv/config"); // Make sure .env.local is loaded

// 1. Prepare your documents
const docs = staticKnowledge.map((entry: { text: string; id: string; }) => ({
  pageContent: entry.text,
  metadata: { id: entry.id },
}));

// 2. Check for API key and initialize the embedding model
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable. Check your .env.local file.");
}
const embeddings = new OpenAIEmbeddings();

// 3. This is the main function that runs
const run = async () => {
  try {
    // Create the vector store from our documents
    console.log("Creating vector store... this may take a moment.");
    const vectorStore = await FaissStore.fromDocuments(docs, embeddings);

    // 4. Save the vector store to disk
    const directory = "vector_store";
    await vectorStore.save(directory);
    console.log(`✅ Vector store saved to ${directory}`);
    console.log("You can now proceed to Step 4!");
  } catch (e) {
    console.error("❌ An error occurred:", e);
  }
};

run();