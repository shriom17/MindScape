from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter


def setup_rag():
    loader = TextLoader("gita_data/gita.txt", encoding="utf-8")
    documents = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return FAISS.from_documents(chunks, embeddings)


vectorstore = setup_rag()


def get_context(query, k=3):
    relevant_docs = vectorstore.similarity_search(query, k=k)
    return "\n".join([doc.page_content for doc in relevant_docs])
