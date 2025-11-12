from flask import Flask, request, jsonify,Blueprint
from flask_cors import CORS
from langchain.llm_pipe_line import query_documents


rag_route=Blueprint("rag_route",__name__)

@rag_route.route("/query", methods=["POST"])
def query_rag():
    """Handle legal question queries using the RAG system."""
    try:
        data = request.get_json()
        if not data or "question" not in data:
            return jsonify({"error": "Missing 'question' in request body"}), 400

        question = data["question"].strip()
        if not question:
            return jsonify({"error": "Question cannot be empty"}), 400

        print(f"\n📩 Received query: {question}")

        # Get RAG-generated answer
        answer = query_documents(question)

        return jsonify({
            "question": question,
            "answer": answer
        })

    except Exception as e:
        print(f"❌ Error while processing query: {e}")
        return jsonify({"error": str(e)}), 500
