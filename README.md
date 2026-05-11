# Live Status Tracker — Architecture Diagram

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph CLIENT["Client — Next.js :3000"]
        UI["index.js — React UI"]
        LS["localStorage\n(lst_jobs, lst_client_id)"]
        SIO_C["socket.io-client"]
        UI <-->|read / write| LS
        UI --> SIO_C
    end

    subgraph SERVER["Server — Express + Socket.io :3001"]
        IDX["index.js — HTTP + WS Server"]
        
        subgraph ROUTES["Routes"]
            R_UP["POST /upload"]
            R_ST["GET /status/:jobId"]
            R_CA["POST /cancel/:jobId"]
        end

        subgraph CTRL["Controllers"]
            C_UP["uploadController.js"]
            C_JB["jobsController.js"]
        end

        STORE["jobsStore.js\n(in-memory Map)"]
        SIM["simulateJob.js\n(async background worker)"]
        SOCK["socket.js\n(Socket.io manager)"]

        R_UP --> C_UP
        R_ST --> C_JB
        R_CA --> C_JB

        C_UP -->|createJob| STORE
        C_UP -->|fire-and-forget| SIM
        C_JB -->|getJob / cancelJob| STORE

        SIM -->|getJob / update| STORE
        SIM -->|emit job:update| SOCK
        C_JB -->|emit job:update| SOCK
        SOCK --> IDX
    end

    UI -- "POST /upload\n(multipart + x-client-id)" --> R_UP
    UI -- "GET /status/:jobId" --> R_ST
    UI -- "POST /cancel/:jobId" --> R_CA
    SIO_C <-- "WebSocket\njob:update / catchup" --> SOCK

    style CLIENT fill:#0d1117,stroke:#58a6ff,color:#c9d1d9
    style SERVER fill:#0d1117,stroke:#3fb950,color:#c9d1d9
    style ROUTES fill:#161b22,stroke:#58a6ff,color:#c9d1d9
    style CTRL fill:#161b22,stroke:#58a6ff,color:#c9d1d9
```

---

## 2. Request Lifecycle — Sequence Diagram

```mermaid
sequenceDiagram
    participant U as Browser / React UI
    participant S as Express Server
    participant M as Multer Middleware
    participant JS as jobsStore
    participant SJ as simulateJob
    participant WS as Socket.io

    U->>S: POST /upload (FormData + x-client-id)
    S->>M: Parse multipart body
    M-->>S: req.file ready
    S->>JS: createJob(jobId, {filename, clientId})
    S-->>U: 202 { jobId }

    Note over S,SJ: Fire-and-forget (no await)
    S->>SJ: simulateJob(jobId, io)

    loop For each step [Uploading → Scanning → Extracting Data]
        SJ->>JS: getJob(jobId) — check cancelled
        SJ->>SJ: await delay (2–6 s random)
        SJ->>JS: update status + progress
        SJ->>WS: emit("job:update", {jobId, status, progress})
        WS->>U: job:update event
        U->>U: Update progress bar + badge
    end

    SJ->>JS: mark Completed / Failed (10% chance)
    SJ->>WS: emit("job:update", {status: Completed/Failed, progress: 100})
    WS->>U: job:update event (final)
```

---

## 3. Project Directory Structure

```
LiveStatusTracker/
├── client/                        # Next.js frontend  (:3000)
│   ├── pages/
│   │   ├── _app.js                # Global CSS import
│   │   ├── _document.js           # Custom HTML document (Google Fonts)
│   │   └── index.js               # Main UI — upload form, job cards, socket
│   ├── styles/
│   │   └── globals.css            # Full design system — dark theme, animations
│   └── package.json               # next, react, socket.io-client
│
├── server/                        # Express backend  (:3001)
│   ├── controllers/
│   │   ├── uploadController.js    # Multer parsing, job creation, simulation trigger
│   │   └── jobsController.js      # GET status, POST cancel
│   ├── routes/
│   │   ├── upload.js              # POST /upload
│   │   └── jobs.js                # GET /status/:jobId  ·  POST /cancel/:jobId
│   ├── jobs/
│   │   └── simulateJob.js         # Async background worker (steps + random failure)
│   ├── jobsStore.js               # In-memory job store (create / get / cancel)
│   ├── socket.js                  # Socket.io init, catchup handler, room mgmt
│   ├── index.js                   # Server entrypoint — Express + Socket.io setup
│   └── package.json               # express, socket.io, multer, uuid, cors
│
├── .gitignore
└── README.md
```

---

## 4. Job Simulation — State Machine

```mermaid
stateDiagram-v2
    [*] --> Uploading : POST /upload accepted

    Uploading --> Scanning : 2–3 s delay
    Scanning --> ExtractingData : 3–5 s delay
    ExtractingData --> Completed : 4–6 s delay

    Uploading --> Failed : 10% chance at any step
    Scanning --> Failed : 10% chance at any step
    ExtractingData --> Failed : 10% chance at any step

    Uploading --> Cancelled : POST /cancel/:jobId
    Scanning --> Cancelled : POST /cancel/:jobId
    ExtractingData --> Cancelled : POST /cancel/:jobId

    Completed --> [*]
    Failed --> [*]
    Cancelled --> [*]
```

---

## 5. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14, React 18 | Pages router, SSR-capable SPA |
| **Styling** | Vanilla CSS (dark theme) | Glassmorphism, micro-animations, responsive |
| **Real-time** | Socket.io (client + server) | Bi-directional WebSocket for live progress |
| **Backend** | Express 4 | REST API, CORS, error handling |
| **File Handling** | Multer (memory storage) | Multipart upload parsing (file not persisted) |
| **State** | In-memory JS object | Job metadata store (non-persistent) |
| **IDs** | uuid v4 | Unique job identifiers |
| **Persistence** | localStorage (client-side) | Job IDs + filenames survive page refresh |

---

## 6. Communication Channels

| Channel | Protocol | Direction | Events / Endpoints |
|---|---|---|---|
| File Upload | HTTP POST | Client → Server | `POST /upload` (multipart/form-data) |
| Job Status Poll | HTTP GET | Client → Server | `GET /status/:jobId` |
| Job Cancel | HTTP POST | Client → Server | `POST /cancel/:jobId` |
| Live Updates | WebSocket | Server → Client | `job:update` (jobId, status, progress) |
| Catchup Sync | WebSocket | Client → Server | `catchup` (jobId) — request current state |
| Connection State | WebSocket | Bi-directional | `connect` / `disconnect` |

---

## 7. Key Design Decisions

- **Room-based emission**: Each client gets a unique `clientId` (persisted in localStorage). The server joins the socket to a room named after this ID, ensuring updates are scoped per-client.
- **Fire-and-forget simulation**: `simulateJob()` runs asynchronously after the HTTP 202 response, so the upload endpoint returns instantly.
- **Catchup on reconnect**: When a WebSocket reconnects, the client re-emits `catchup` for every non-terminal job, so progress is never lost.
- **Optimistic cancel**: The UI marks a job as cancelled immediately, then confirms with the server. If the server call fails, the UI reverts to `failed`.
- **10% random failure**: The simulation randomly fails at any step to demonstrate the error UI path.
