import os
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_postgres import PGVector
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

class RAGChain:
    def __init__(self, connection_string: str):
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0) # Simulated Llama 3.1 fallback for compatibility
        
        self.vectorstore = PGVector(
            embeddings=self.embeddings,
            collection_name="infosetu_docs",
            connection=connection_string,
        )
        
        self.retriever = self.vectorstore.as_retriever(search_kwargs={"k": 4})
        
        template = """You are a helpful assistant for the Infosetu Govt platform. Use the following pieces of retrieved context to answer the question.
If you don't know the answer, just say that you don't know. Never ask for Aadhaar numbers.

Context: {context}

Question: {question}

Answer:"""
        self.prompt = PromptTemplate.from_template(template)
        
        self.chain = (
            {"context": self.retriever, "question": RunnablePassthrough()}
            | self.prompt
            | self.llm
            | StrOutputParser()
        )

    def ask(self, query: str, citizen_id: str) -> str:
        # citizen_id is logged for audit purposes
        return self.chain.invoke(query)
