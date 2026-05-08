from pathlib import Path

try:
    from langchain_community.document_loaders import TextLoader
    from langchain_community.embeddings import HuggingFaceEmbeddings
    from langchain_community.vectorstores import FAISS
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    import faiss
except ImportError:  # Optional dependency set for enhanced retrieval.
    TextLoader = None
    HuggingFaceEmbeddings = None
    FAISS = None
    RecursiveCharacterTextSplitter = None
    faiss = None


def setup_rag():
    if not all([TextLoader, HuggingFaceEmbeddings, FAISS, RecursiveCharacterTextSplitter, faiss]):
        return None

    loader = TextLoader("gita_data/gita.txt", encoding="utf-8")
    documents = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return FAISS.from_documents(chunks, embeddings)


vectorstore = setup_rag()


def _fallback_context(query, k=3):
    source = Path("gita_data/gita.txt")
    if not source.exists():
        return ""

    text = source.read_text(encoding="utf-8")
    paragraphs = [chunk.strip() for chunk in text.split("\n\n") if chunk.strip()]
    if not paragraphs:
        return ""

    lowered_query = (query or "").lower()
    scored = []
    for paragraph in paragraphs:
        score = sum(1 for word in lowered_query.split() if word and word in paragraph.lower())
        scored.append((score, paragraph))

    scored.sort(key=lambda item: item[0], reverse=True)
    top_matches = [paragraph for score, paragraph in scored[:k] if paragraph]
    if top_matches:
        return "\n".join(top_matches)

    return "\n".join(paragraphs[:k])


def get_context(query, k=3):
    if vectorstore is not None:
        relevant_docs = vectorstore.similarity_search(query, k=k)
        return "\n".join([doc.page_content for doc in relevant_docs])

    return _fallback_context(query, k=k)
