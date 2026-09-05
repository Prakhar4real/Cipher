# Architecture — Cipher

## 1. Tech Stack

- **Frontend:** React
- **Backend:** Node.js + Express
- **Database:** MongoDB (core app data — users, subjects, documents, chats, messages)
- **Vector Store:** MongoDB Atlas Vector Search (runs on the same free M0 cluster as the primary DB — no separate vector database needed, no extra software cost)
- **File Storage:** Supabase Storage — used strictly as an object-storage layer for raw PDF files. Supabase's other services (Postgres, Auth, Edge Functions, Realtime) are deliberately NOT used, to avoid overlap with MongoDB/Express responsibilities.
- **Text Extraction:** pdf-parse — operates on an in-memory Buffer; PDFs are never written to Render's local filesystem, since it's ephemeral (wiped on spin-down/restart/redeploy). Known limitation: does not handle scanned/image-based PDFs or complex multi-column layouts — acceptable since OCR is explicitly out of v1 scope.
- **Embeddings:** Gemini embedding-001
- **LLM:** Gemini 2.5 Flash
- **Deployment/Hosting:** Render (frontend + backend), free tier

### Deployment Design Notes

- **Cold starts:** Render's free tier spins down the backend after ~15 minutes of inactivity; the next request triggers a restart taking up to ~1 minute. This is not hidden from the user — the frontend shows an explicit "Connecting to backend... may take up to ~1 minute" state, with a health-check/retry mechanism rather than assuming the backend is immediately available.
- **No keep-alive pings:** Deliberately not using a cron job to ping the backend and prevent sleep — this would mask a real free-tier constraint rather than design around it, and demonstrates nothing about engineering ability.
- **Data ownership boundaries (no overlap):**
  - MongoDB Atlas → Users, Subjects, Documents (metadata), Chunks, Embeddings, Chat, Messages, Vector Search
  - Express → Authentication/authorization
  - Supabase Storage → raw PDF files only

## 2. User Flow

1. User lands on landing page → clicks "Explore Cipher"
2. User authenticates (login/signup)
3. User enters homepage → opens sidebar → "Create Subject+"
4. User creates a subject → opens it → a dedicated chat for that subject is displayed
5. User uploads a document to the subject
   - Document appears in the list with a "Processing..." badge and loader
   - Subject page remains usable; chat input is disabled only for that document until indexing completes
   - Message shown: *"Your document is being prepared for AI search. This usually takes less than a minute."*
   - On completion, badge changes to **Ready**, chat becomes available
6. User asks questions in chat and receives grounded, cited answers
7. On error (e.g. failed processing): *"Error processing, retry again"*

## 3. Pipelines

### (a) Ingestion Pipeline
Triggered automatically in the background when a document is uploaded.

```
Upload PDF
   → Store file (Cloudinary/local)
   → Create Document record (status: Processing)
   → Return response immediately (frontend shows "Processing...")
   → [Background]
   → Extract text
   → Clean text
   → Chunk text
   → Generate embeddings for each chunk
   → Store chunks + embeddings in vector store
   → Update Document status → Ready
```

### (b) Retrieval Pipeline
Triggered on every user question, after ingestion is complete.

```
User submits question
   → Embed question
   → Vector search against document's stored chunks
   → Retrieve top-matching chunks
   → Send question + chunks to LLM
   → LLM generates answer grounded in retrieved chunks
   → Return answer + citations (document/page) to frontend
```

## 4. Core Entities

**User**
- userId
- name
- email
- password (hashed)
- createdAt

**Subject**
- subjectId
- ownerUserId
- subjectName
- createdAt

**Document**
- documentId
- subjectId
- fileName
- storageUrl
- status (Processing / Ready / Failed)
- uploadedAt

**Chunk**
- chunkId
- documentId
- chunkText
- embedding
- pageNumber
- chunkIndex

**Chat**
- chatId
- subjectId
- createdAt
- updatedAt

**Message**
- messageId
- chatId
- sender (user / ai)
- message
- citations

## 5. API Endpoints

**User**
- `POST /api/register`
- `POST /api/login`
- `GET /api/user`

**Subject**
- `POST /api/subjects`
- `GET /api/subjects`
- `PUT /api/subjects/:subjectId`
- `DELETE /api/subjects/:subjectId`

**Document**
- `POST /api/subjects/:subjectId/documents`
- `GET /api/subjects/:subjectId/documents`
- `GET /api/documents/:documentId`
- `GET /api/documents/:documentId/status`
- `DELETE /api/documents/:documentId`

**Chat**
- `GET /api/subjects/:subjectId/chat`
- `DELETE /api/chat/:chatId`

**Message**
- `GET /api/chat/:chatId/messages`
- `POST /api/chat/:chatId/messages`

## 6. Folder Structure (proposed — not yet built)

```
/cipher
  /client        → React frontend
  /server
    /models      → Mongoose schemas (User, Subject, Document, Chunk, Chat, Message)
    /routes      → Express route definitions
    /controllers → Request handlers / business logic
    /services    → Ingestion pipeline, retrieval pipeline, embedding calls
    /middleware  → Auth middleware, error handling
    /config      → DB connection, env config
  PLANNING.md
  PRD.md
  Architecture.md
  Phases.md
  README.md
```

> Note: This structure is a starting proposal, not locked. 