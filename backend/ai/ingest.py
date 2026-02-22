import os
import argparse
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_postgres import PGVector

def ingest_pdf(file_path: str, connection_string: str):
    print(f"Loading {file_path}...")
    loader = PyMuPDFLoader(file_path)
    docs = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        add_start_index=True
    )
    splits = text_splitter.split_documents(docs)
    print(f"Split into {len(splits)} chunks.")
    
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    
    print("Storing in pgvector...")
    PGVector.from_documents(
        documents=splits,
        embedding=embeddings,
        collection_name="infosetu_docs",
        connection=connection_string,
        pre_delete_collection=False
    )
    print("Ingestion complete.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True, help="Path to PDF file")
    args = parser.parse_args()
    
    db_url = os.getenv("DB_URL", "postgresql://infosetu:infosetu_secret@localhost:5432/infosetu_db")
    ingest_pdf(args.pdf, db_url)
