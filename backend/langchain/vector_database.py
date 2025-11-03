from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from data_preprocessing import make_sentence_chunks,load_pdf_documents_from_directory
import os
TRAIN_DOC_DEV_PATH = r"C:\Users\Acer\Downloads\HOD_ASSIGNMENT\apllication-manager-for-the-lawyers-\backend\documents\train_docs"

def create_vector_db(documents, persist_path="faiss_index"):
    """
    Create and store a FAISS vector database locally using a free embedding model.
    """
    # Use a free local model from Hugging Face
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    embeddings = HuggingFaceEmbeddings(model_name=model_name)

    if not documents:
        raise ValueError("No documents provided for embedding!")

    print("🚀 Creating embeddings using HuggingFace model:", model_name)
    vector_db = FAISS.from_documents(documents, embeddings)

    # Save the FAISS index
    os.makedirs(persist_path, exist_ok=True)
    vector_db.save_local(persist_path)
    print(f"✅ Vector database saved locally at: {persist_path}")
    return vector_db


def load_vector_db(persist_path="faiss_index"):
    """
    Load a previously saved FAISS vector database.
    """
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    embeddings = HuggingFaceEmbeddings(model_name=model_name)

    if not os.path.exists(persist_path):
        raise FileNotFoundError(f"Vector DB not found at: {persist_path}")

    print("🔍 Loading vector database from:", persist_path)
    vector_db = FAISS.load_local(persist_path, embeddings, allow_dangerous_deserialization=True)
    print("✅ Vector database loaded successfully!")
    return vector_db


def query_vector_db(vector_store, query, k=3):
    """Performs similarity search on the vector store."""
    results = vector_store.similarity_search(query, k=k)
    print("\n🔎 Top Matches:")
    for i, res in enumerate(results, 1):
        print(f"{i}. {res.page_content[:300]}...\n")
    return results



if __name__ == "__main__":
    docs = load_pdf_documents_from_directory(TRAIN_DOC_DEV_PATH)
    chunks = make_sentence_chunks(docs, sentences_per_chunk=3)

    # Create the vector database
    vector_db = create_vector_db(chunks, persist_path="faiss_index")

    # Load and test a query
    loaded_db = load_vector_db("faiss_index")
    query_vector_db(loaded_db, "What are the legal procedures for client case assignment?")