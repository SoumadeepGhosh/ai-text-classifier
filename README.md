# AI-Assisted Text Classification API

A production-grade RESTful API built with **Node.js**, **Express.js**, **TypeScript**, and the **Google Gemini API** (`@google/genai`).

The service classifies arbitrary customer input text into exactly one of four target categories with a calibrated confidence score:
- **Complaint**
- **Query**
- **Feedback**
- **Other**

---

## Table of Contents

- [Overview](#overview)
- [Technologies Used](#technologies-used)
- [Architecture & Design](#architecture--design)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [NPM Scripts](#npm-scripts)
- [API Documentation](#api-documentation)
  - [POST /api/classify](#post-apiclassify)
  - [GET /health](#get-health)
- [Input Validation & Error Handling](#input-validation--error-handling)
- [License](#license)

---

## Overview

Modern support, feedback, and CRM workflows require automatic triage of user messages. This API provides a low-latency, deterministic classification pipeline by pairing Google's Gemini models with rigorous prompt engineering and strict TypeScript schema enforcement.

### Key Features
- **Strict Classification**: Enforces the four required categories (`Complaint`, `Query`, `Feedback`, `Other`).
- **Deterministic JSON Output**: Uses system prompting and Gemini's `application/json` response mode to guarantee clean JSON parsing without markdown fences or extraneous text.
- **Reusable Singleton Client**: Creates one single instance of `@google/genai` across the application lifecycle to prevent memory leaks and redundant socket allocations.
- **Robust Centralized Error Handling**: Safely handles invalid input, malformed JSON, Gemini API failures, timeouts, and unexpected runtime errors without crashing the server.
- **Enterprise Middleware Suite**: Pre-configured with Helmet for secure HTTP headers, CORS for cross-origin resource sharing, and Morgan for structured request logging.
- **Zero `any` TypeScript**: Fully typed in TypeScript strict mode with no unused variables and clean separation of concerns.

---

## Technologies Used

| Technology | Purpose |
|---|---|
| **Node.js** (v18+) | Server runtime environment |
| **Express.js** | HTTP REST API framework |
| **TypeScript** | Type-safe development with strict compiler checks |
| **@google/genai** | Official Google Gen AI SDK for Gemini models |
| **Helmet** | HTTP security header hardening |
| **CORS** | Cross-Origin Resource Sharing configuration |
| **Morgan** | HTTP request logging middleware |
| **dotenv** | Environment configuration management |
| **tsx** | Fast TypeScript execution during development |

---

## Architecture & Design

The application follows a clean 3-tier layered architecture:

```
[ HTTP Request ]
       │
       ▼
[ Security & Logging Middleware (Helmet, CORS, Morgan, Body Parser) ]
       │
       ▼
[ Routing Layer (routes/classify.route.ts) ]
       │
       ▼
[ Controller Layer (controllers/classify.controller.ts) ]
  ├── 1. Validates schema & input constraints (validators/classify.validator.ts)
  ├── 2. Delegates business logic to Service Layer
  └── 3. Formats and sends HTTP response
       │
       ▼
[ Service Layer (services/classify.service.ts) ]
  ├── 1. Injects reusable Gemini client (config/gemini.ts)
  ├── 2. Builds classification prompt (prompts/classification.prompt.ts)
  ├── 3. Calls Gemini API with timeout control (AbortSignal)
  └── 4. Parses & verifies JSON response (utils/parse-json.ts)
       │
       ▼
[ Centralized Error Middleware (middleware/error.middleware.ts) ]
  └── Intercepts all validation, timeout, API, and syntax errors
```

---

## Project Structure

```
ai-text-classifier/
│
├── src/
│   ├── app.ts                         # Express application setup, security & middleware
│   ├── server.ts                      # Server bootstrap & process lifecycle handlers
│   │
│   ├── config/
│   │     env.ts                       # Environment variable access and validation
│   │     gemini.ts                    # Reusable singleton Gemini client
│   │
│   ├── routes/
│   │     classify.route.ts            # Route definitions for /api/classify
│   │
│   ├── controllers/
│   │     classify.controller.ts       # Controller: validation, service invocation, response
│   │
│   ├── services/
│   │     classify.service.ts          # Core classification logic and Gemini API integration
│   │
│   ├── prompts/
│   │     classification.prompt.ts     # Reusable system instructions & category definitions
│   │
│   ├── middleware/
│   │     error.middleware.ts          # Centralized error handler (validation, API, 500)
│   │     not-found.middleware.ts      # 404 handler for unknown routes
│   │
│   ├── validators/
│   │     classify.validator.ts        # Request payload validator (empty, missing, length)
│   │
│   ├── types/
│   │     classify.types.ts            # Domain and API TypeScript definitions
│   │
│   ├── utils/
│   │     parse-json.ts                # Robust JSON extraction and schema validation
│
├── package.json                       # Scripts and project dependencies
├── tsconfig.json                      # Strict TypeScript compiler options
├── .env.example                       # Environment template with placeholders
├── .gitignore                         # Git ignored directories and secrets
└── README.md                          # Project documentation
```

---

## Environment Variables

Create a `.env` file in the project root based on `.env.example`:

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | **Yes** | *None* | Google Gemini API key obtained from [Google AI Studio](https://aistudio.google.com/) |
| `PORT` | No | `3000` | Port for the HTTP server to listen on |
| `NODE_ENV` | No | `development` | Runtime mode (`development` or `production`) |
| `GEMINI_MODEL` | No | `gemini-3.8-flash` | Gemini model identifier |
| `TIMEOUT_MS` | No | `15000` | Max request duration in milliseconds before timing out |
| `MAX_INPUT_LENGTH` | No | `5000` | Maximum character length permitted for input text |

---

## Installation

1. Clone or navigate to the repository directory:
   ```bash
   cd ai-text-classifier
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set your `GEMINI_API_KEY`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

---

## Running Locally

### Development Mode (with hot reloading via `tsx`)
```bash
npm run dev
```

### Production Build & Execution
```bash
# 1. Compile TypeScript to JavaScript in /dist
npm run build

# 2. Start the compiled production server
npm start
```

### Type Checking
```bash
npm run type-check
```

---

## NPM Scripts

- `npm run dev`: Starts the application in development mode with file watching.
- `npm run build`: Compiles all TypeScript source files into the `./dist` folder.
- `npm start`: Runs the compiled application (`dist/server.js`) using Node.js.
- `npm run type-check`: Performs a strict TypeScript compiler check without emitting files.

---

## API Documentation

### POST `/api/classify`

Classifies the provided text input into one of: `Complaint`, `Query`, `Feedback`, `Other`.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "text": "I have not received my refund."
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "category": "Complaint",
  "confidence": 0.97
}
```

---

### Request Examples & Expected Categories

#### 1. Complaint
```bash
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "My package was supposed to arrive two days ago and tracking is stuck."}'
```
**Response:**
```json
{
  "success": true,
  "category": "Complaint",
  "confidence": 0.98
}
```

#### 2. Query
```bash
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "What is your return policy for international orders?"}'
```
**Response:**
```json
{
  "success": true,
  "category": "Query",
  "confidence": 0.99
}
```

#### 3. Feedback
```bash
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "The new dark mode design looks fantastic, great job team!"}'
```
**Response:**
```json
{
  "success": true,
  "category": "Feedback",
  "confidence": 0.96
}
```

#### 4. Other
```bash
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "Good morning!"}'
```
**Response:**
```json
{
  "success": true,
  "category": "Other",
  "confidence": 0.95
}
```

---

### GET `/health`

Liveness and health check endpoint for monitoring tools and container orchestrators.

#### Success Response (200 OK)
```json
{
  "status": "UP",
  "timestamp": "2026-10-27T09:30:00.000Z",
  "uptime": 42.12
}
```

---

## Input Validation & Error Handling

All validation and runtime errors return standardized HTTP JSON responses with `success: false`.

### Validation Scenarios (HTTP 400 Bad Request)

| Failure Case | Example Payload | Error Response |
|---|---|---|
| **Missing `text` field** | `{}` | `{"success": false, "error": {"message": "Missing required field: 'text'.", "code": "VALIDATION_ERROR"}}` |
| **Empty string** | `{"text": "   "}` | `{"success": false, "error": {"message": "The 'text' field cannot be empty.", "code": "VALIDATION_ERROR"}}` |
| **Invalid JSON syntax** | `{text:}` | `{"success": false, "error": {"message": "Invalid JSON payload received in request body.", "code": "INVALID_JSON_BODY"}}` |
| **Excessive text length** | `{"text": ">5000 chars"}` | `{"success": false, "error": {"message": "Input text length (...) exceeds the maximum allowed length of 5000 characters.", "code": "VALIDATION_ERROR"}}` |
| **Non-string type** | `{"text": 12345}` | `{"success": false, "error": {"message": "The 'text' field must be a string.", "code": "VALIDATION_ERROR"}}` |

### Upstream & Service Error Handling

- **AI Timeout (504 Gateway Timeout)**: If Gemini takes longer than `TIMEOUT_MS` (default 15s), the request is aborted and a 504 status is returned.
- **Invalid Model Output (502 Bad Gateway)**: If the AI output fails JSON parsing or schema verification, a 502 status is returned.
- **Gemini Service Errors (502 / 401 / 429)**: Gemini authentication errors, quota limits, and API issues are handled cleanly without crashing the process.
- **Route Not Found (404 Not Found)**: Unknown routes return a structured 404 JSON response.

---

## License

ISC

