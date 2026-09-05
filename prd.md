# PRD — Cipher

## 1. Overview

Cipher is an AI-powered study platform where users upload their own study material (PDFs — notes, lecture slides, books) and ask questions about it. Answers are generated using Retrieval-Augmented Generation (RAG), grounded strictly in the user's uploaded content, with source citations (file/page) attached to every answer.

## 2. Purpose & Audience

This is a **portfolio/resume project**, built to demonstrate full-stack (MERN) engineering depth — including backend design, AI/RAG integration, and deployment — to recruiters and interviewers evaluating candidates for MERN/full-stack internship or entry-level roles.

It is explicitly **not** a product intended to acquire real users or compete with tools like NotebookLM or ChatGPT. No time will be spent on growth, marketing, or user acquisition.

## 3. Problem Statement

Generic AI chat tools answer from general knowledge or the open web, which means answers aren't grounded in a specific source the user can verify. Students studying from their own material want answers that are traceable back to their exact notes/textbook — not generic or hallucinated content.

## 4. Goals

- Build a working, deployed, end-to-end RAG application
- Demonstrate understanding of every layer of the stack (auth, backend, chunking/embedding pipeline, vector search, LLM integration, frontend)
- Produce answers grounded only in user-uploaded material, with accurate citations
- Avoid the mistake of a prior project (PULSE): no AI-generated code accepted without full understanding of what it does and why

## 5. v1 Scope (Locked)

| Feature | Included in v1 |
|---|---|
| User authentication (register/login) | ✅ |
| Subject creation (organize documents by subject) | ✅ |
| PDF upload | ✅ |
| Ingestion pipeline: extract → chunk → embed → store | ✅ |
| Retrieval pipeline: RAG chat with citations | ✅ |
| Chat history (save, reopen, delete) | ✅ |
| Deployment (frontend + backend + DB live) | ✅ |
| Basic tests + error handling | ✅ |
| README explaining architecture decisions | ✅ |

## 6. Explicitly Out of Scope (v1)

Flashcards, quiz generation, OCR, voice input, study groups, spaced repetition, analytics dashboards, markdown editor. These were considered and deliberately deferred to avoid scope creep.

## 7. Core User Value

A user can:
1. Create an account and organize study material by subject
2. Upload PDFs to a subject
3. Ask questions and receive answers grounded only in their uploaded material
4. See exactly which document/page each answer's claim came from
5. Revisit past conversations per subject

## 8. Success Criteria

- App is fully deployed and usable end-to-end by someone other than the author
- Every AI answer includes a correct, verifiable citation
- Codebase and README can withstand technical questioning in an interview setting