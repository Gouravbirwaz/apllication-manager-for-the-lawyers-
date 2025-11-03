import os
from langchain_community.document_loaders import PyPDFLoader
from nltk.tokenize import sent_tokenize
from langchain.schema import Document

TRAIN_DOC_DEV_PATH = r"C:\Users\Acer\Downloads\HOD_ASSIGNMENT\apllication-manager-for-the-lawyers-\backend\documents\train_docs"


def load_pdf_documents_from_directory(directory_path):
    """Loads all PDF files from a given directory into LangChain documents."""
    all_documents = []

    for filename in os.listdir(directory_path):
        if filename.lower().endswith(".pdf"):
            pdf_path = os.path.join(directory_path, filename)
            loader = PyPDFLoader(pdf_path)
            docs = loader.load()
            print(f"{filename}: {len(docs)} pages loaded")
            all_documents.extend(docs)

    print(f"\nTotal {len(all_documents)} pages loaded from {directory_path}")
    return all_documents


def make_sentence_chunks(documents, sentences_per_chunk=3):
    """
    Splits documents into logical sentence-based chunks instead of fixed-size character chunks.
    """
    all_chunks = []

    for doc in documents:
        sentences = sent_tokenize(doc.page_content)
        for i in range(0, len(sentences), sentences_per_chunk):
            chunk_text = " ".join(sentences[i:i + sentences_per_chunk])
            all_chunks.append(Document(page_content=chunk_text, metadata=doc.metadata))

    print(f"{len(all_chunks)} sentence-based chunks created.")
    return all_chunks


if __name__ == "__main__":
    docs = load_pdf_documents_from_directory(TRAIN_DOC_DEV_PATH)
    chunks = make_sentence_chunks(docs, sentences_per_chunk=3)
