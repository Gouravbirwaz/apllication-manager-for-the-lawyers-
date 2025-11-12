import os
import faiss
import numpy as np
import google.generativeai as genai
from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
load_dotenv()
# === CONFIG ===
TRAIN_DOC_DEV_PATH = r"C:\Users\Acer\Downloads\HOD_ASSIGNMENT\apllication-manager-for-the-lawyers-\backend\documents\train_docs"
VECTOR_DB_PATH = "faiss_index.bin"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# === SETUP GEMINI ===
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# === EMBEDDING MODEL ===
embedder = SentenceTransformer(EMBEDDING_MODEL)

# === 1. LOAD PDF DOCUMENTS ===
def load_pdf_documents_from_directory(directory):
    docs = []
    for file in os.listdir(directory):
        if file.endswith(".pdf"):
            path = os.path.join(directory, file)
            reader = PdfReader(path)
            for page_num, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    docs.append({
                        "text": text.strip(),
                        "metadata": {"source": file, "page": page_num + 1}
                    })
    return docs

# === 2. CHUNKING FUNCTION ===
def make_sentence_chunks(docs, sentences_per_chunk=3):
    from nltk import sent_tokenize
    import nltk
    nltk.download('punkt', quiet=True)

    chunks = []
    for doc in docs:
        sentences = sent_tokenize(doc["text"])
        for i in range(0, len(sentences), sentences_per_chunk):
            chunk_text = " ".join(sentences[i:i+sentences_per_chunk])
            chunks.append({
                "text": chunk_text,
                "metadata": doc["metadata"]
            })
    return chunks

# === 3. CREATE OR LOAD FAISS ===
def get_or_create_vector_db():
    if os.path.exists(VECTOR_DB_PATH):
        print("🔁 Using existing FAISS DB...")
        index = faiss.read_index(VECTOR_DB_PATH)
        with open("faiss_metadata.npy", "rb") as f:
            metadatas = np.load(f, allow_pickle=True)
    else:
        print("📘 Loading and preprocessing PDFs...")
        docs = load_pdf_documents_from_directory(TRAIN_DOC_DEV_PATH)
        chunks = make_sentence_chunks(docs)
        print(f"Loaded {len(docs)} documents and split into {len(chunks)} chunks.")

        texts = [c["text"] for c in chunks]
        metadatas = np.array([c["metadata"] for c in chunks], dtype=object)
        embeddings = embedder.encode(texts, convert_to_numpy=True)

        index = faiss.IndexFlatL2(embeddings.shape[1])
        index.add(embeddings)

        faiss.write_index(index, VECTOR_DB_PATH)
        with open("faiss_metadata.npy", "wb") as f:
            np.save(f, metadatas)

        print("💾 FAISS DB created and saved.")
    return index, metadatas

# === 4. RETRIEVE TOP MATCHING CHUNKS ===
def retrieve_similar_chunks(query, index, metadatas, k=3):
    query_vec = embedder.encode([query], convert_to_numpy=True)
    distances, indices = index.search(query_vec, k)
    results = []
    for i in indices[0]:
        metadata = metadatas[i].item() if isinstance(metadatas[i], np.ndarray) else metadatas[i]
        results.append(metadata)
    return indices[0], results

# === 5. BUILD CONTEXT AND ASK GEMINI ===
def ask_gemini(query, context_text):
    model = genai.GenerativeModel("gemini-2.5-flash")
    prompt = (
        "You are a legal assistant. Answer the user's question using only the context below if there is no context provide your answer. "
        "If unsure, priode answer from the google.\n\n"
        f"Context:\n{context_text}\n\n"
        f"Question: {query}"
    )
    response = model.generate_content(prompt)
    return response.text.strip()

# === 6. MAIN QUERY FUNCTION ===
def query_documents(question):
    index, metadatas = get_or_create_vector_db()
    indices, results = retrieve_similar_chunks(question, index, metadatas)

    context = ""
    print("\n📚 Source Contexts:")
    for idx, meta in zip(indices, results):
        print(f"- {meta['source']} (page {meta['page']})")
        context += f"\n[Source: {meta['source']}, Page: {meta['page']}]\n"

    answer = ask_gemini(question, context)
    print("\n🧠 Answer:\n", answer)
    return answer

if __name__ == "__main__":
    query_documents("What are the legal procedures for filing a case in India?")
