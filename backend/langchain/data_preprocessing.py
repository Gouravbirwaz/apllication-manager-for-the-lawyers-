import os
# CHANGE: Use UnstructuredFileLoader instead of PyPDFLoader for better extraction
from langchain_community.document_loaders import UnstructuredFileLoader 
from nltk.tokenize import sent_tokenize
from langchain_core.documents import Document

# Keep the path variable unchanged as requested
TRAIN_DOC_DEV_PATH = r"C:\Users\Acer\Downloads\HOD_ASSIGNMENT\apllication-manager-for-the-lawyers-\backend\documents\train_docs"


def load_pdf_documents_from_directory(directory_path):
    """
    Loads all PDF files from a given directory into LangChain documents 
    using UnstructuredFileLoader for robust extraction.
    """
    all_documents = []

    for filename in os.listdir(directory_path):
        if filename.lower().endswith(".pdf"):
            pdf_path = os.path.join(directory_path, filename)
            
            # CHANGE: Instantiate the UnstructuredFileLoader
            # This loader handles various formats and attempts OCR on scanned PDFs.
            loader = UnstructuredFileLoader(pdf_path)
            
            try:
                docs = loader.load()
                print(f"{filename}: {len(docs)} document pages/elements loaded")
                all_documents.extend(docs)
            except Exception as e:
                print(f"Error loading {filename}: {e}")

    print(f"\nTotal {len(all_documents)} pages/elements loaded from {directory_path}")
    return all_documents


def make_sentence_chunks(documents, sentences_per_chunk=3):
    """
    Splits documents into logical sentence-based chunks instead of fixed-size character chunks.
    (Function remains unchanged as it was not the source of the issue)
    """
    all_chunks = []

    for doc in documents:
        # Check if page_content is not empty before tokenizing
        if doc.page_content.strip(): 
            sentences = sent_tokenize(doc.page_content)
            for i in range(0, len(sentences), sentences_per_chunk):
                chunk_text = " ".join(sentences[i:i + sentences_per_chunk])
                all_chunks.append(Document(page_content=chunk_text, metadata=doc.metadata))
        else:
            # Handle cases where UnstructuredFileLoader might return empty content for a page
            print(f"Skipping empty page content in document: {doc.metadata.get('source', 'Unknown source')}")


    print(f"{len(all_chunks)} sentence-based chunks created.")
    return all_chunks


if __name__ == "__main__":
    docs = load_pdf_documents_from_directory(TRAIN_DOC_DEV_PATH)    
    chunks = make_sentence_chunks(docs, sentences_per_chunk=3)