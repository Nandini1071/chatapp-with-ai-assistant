# 🚀 Chatapp with AI Assistant

## Project Description

**Chatapp with AI Assistant** is a modern, real-time collaborative workspace that bridges AI-powered code generation with interactive project management. Teams can chat in a shared project space, invoke an AI assistant to generate code and file structures, instantly preview the results in an integrated editor, and download ready-to-run projects as ZIP archives—all with built-in collaborator management.

Built on a modern stack (React + Vite, Express, WebSockets, MongoDB), this application showcases how conversational AI can be integrated into developer workflows to accelerate project scaffolding and team collaboration.

---

## ✨ Core Features

- **Real-time Collaboration** — Multiple users can join a project and chat simultaneously via WebSocket connections. Messages appear instantly across all participants. See who's typing and active in real-time.

- **AI-Powered Code Generation** — Trigger the AI assistant by tagging messages with `@ai`. The assistant generates a complete project file tree (frontend, backend, config files, dependencies), which the server broadcasts to all connected clients instantly.

- **Integrated Code Editor** — Browse and edit generated files in a sleek, dark-themed editor with tabs for open files, syntax awareness, and monospace formatting. Perfect for reviewing and tweaking AI output before download.

- **One-Click Project Download** — Once the AI generates files, a "Download ZIP" button appears in the header. Click to instantly download a fully packaged project ready to run or deploy locally.

- **Collaborator Management** — Add team members to a project with a dedicated modal. Manage project access, permissions, and see who's actively working on what in real-time.

- **File Tree Visualization** — Hierarchical display of generated files in a modern sidebar with file icons. Click any file to open it in the editor; see file sizes and modification hints.

- **Smart Message Routing** — Messages tagged with `@ai` are intelligently routed to the AI service. Regular messages stay as chat; AI responses include structured file tree data.

- **Dynamic UI** — Download ZIP button appears only after AI generates files. Error messages display inline. Loading states show progress during ZIP generation.

---

## 📂 Project Structure & Code Summary

### Backend Structure

**Controllers:**
- `ai.controller.js` — Handles AI generation and ZIP streaming. Normalizes AI responses, flattens nested file trees into a flat mapping (`path -> { content }`), and streams zip archives.
- `project.controller.js` — Manages project CRUD operations, adding collaborators, and project retrieval.
- `user.controller.js` — User authentication and profile endpoints.

**Services:**
- `ai.service.js` — Wraps Google Generative AI API; returns raw AI output.
- `project.service.js` — Business logic for managing projects and collaborations.
- `user.service.js` — User queries and mutations.
- `zip.service.js` — Uses `archiver` to create ZIP streams from flat fileTree objects.

**Routes:**
- `/ai` — `POST /ai/generate` (normalize AI output), `POST /ai/zip` (download ZIP).
- `/projects` — CRUD, add collaborators, get project details.
- `/users` — Authentication, user list.

**Middleware:**
- `auth.middleware.js` — Verifies JWT, injects `req.user`.

### Frontend Structure

**Main Screen (Project.jsx):**
- State: `fileTree` (flat map), `currentFile`, `openFiles`, `aiHasFiles` (toggles Download ZIP), `messages`, `users`, `selectedUserId`.
- Socket Handler: Listens for `project-message`, extracts nested fileTree, flattens it, merges into state.
- Download ZIP: Posts flat fileTree to `/ai/zip`, downloads blob as `.zip`.
- Add Collaborator: Modal with user selection (Set-based), calls `PUT /projects/add-user`.
- UI: Header (gradient indigo, project name + buttons), left chat (messages + input), right editor (file sidebar + dark editor tabs).

**Config:**
- `axios.js` — Axios instance with JWT interceptor (`Authorization: Bearer <token>`).
- `socket.js` — Socket client initialized with project room.

**Context:**
- `UserContext.jsx` — Stores logged-in user globally.

---

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file:
```
MONGO_URI=mongodb://localhost:27017/chatapp
PORT=3000
JWT_SECRET=your-secret-key
GOOGLE_API_KEY=your-google-generative-ai-key
```

Start the server:
```bash
node server.js
# or with nodemon for auto-reload
npx nodemon server.js
```

### Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file:
```
VITE_API_URL=http://localhost:3000
```

Launch dev server:
```bash
npm run dev
# Visit http://localhost:5173
```

---

## 💡 User Flow

1. **User Signs In** → Login page → Redirected to Projects.
2. **Select/Create Project** → Navigates to Project workspace.
3. **Chat & Request AI** → Type message, prefix with `@ai` to trigger generation.
4. **AI Generates Files** → Server broadcasts `project-message` with `fileTree`.
5. **Frontend Displays Files** → File tree populates; Download ZIP appears.
6. **Edit & Download** → Click file to edit; download ZIP to package project.
7. **Add Collaborators** → Click "Add" → Select users → Submit.

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/ai/generate` | ✅ | `{ prompt }` | `{ fileTree, buildCommand?, startCommand? }` |
| POST | `/ai/zip` | ❌ | `{ fileTree }` | ZIP file |
| PUT | `/projects/add-user` | ✅ | `{ projectId, users: [] }` | `{ project }` |
| GET | `/projects/get-project/:projectId` | ✅ | — | `{ project }` |
| POST | `/projects/create` | ✅ | `{ name }` | `{ project }` |
| GET | `/users/all` | ✅ | — | `{ users: [] }` |

---

## 🎨 UI Highlights

- **Header**: Indigo gradient with project title; Download ZIP appears only after AI generates files.
- **File Tree**: White sidebar card with icons and hover states.
- **Editor**: Dark theme (slate-900) with monospace font.
- **Chat**: Left/right message positioning; AI responses as Markdown.
- **Modal**: Clean user selection interface for adding collaborators.

---

## 📝 Developer Notes

- **JWT**: Stored in `localStorage.token`; auto-injected by axios.
- **Socket Rooms**: Each project isolated by projectId.
- **File Flattening**: Backend + frontend support nested input; canonical form is flat mapping.
- **Error Handling**: Server returns JSON errors; displayed in header red box.
- **Real-time**: Socket broadcasts ensure instant sync across all clients.

---

## 🔮 Upcoming Features (Roadmap)

### Phase 1: Enhanced Editing (Q1 2026)
- **Syntax Highlighting** — Integrate CodeMirror or Monaco Editor with language detection based on file extension.
- **Multi-file Batch Edit** — Edit multiple files and save all changes at once.
- **File Templates** — Pre-built templates for common project types (React, Node, Django, etc.).
- **Live Preview** — Preview generated HTML/React projects in an embedded browser window.

### Phase 2: Project Management (Q2 2026)
- **Clone/Fork Projects** — Duplicate an existing project to a new one, optionally with AI refinements.
- **Version History & Snapshots** — Track changes to the project; restore to previous snapshots.
- **Diff View** — See exactly what changed between AI generations or user edits.
- **Undo/Redo** — Full undo/redo stack for all file modifications.

### Phase 3: Deployment & Integration (Q3 2026)
- **One-Click Deploy** — Deploy directly to Vercel, Netlify, or AWS with environment variable setup.
- **GitHub Integration** — Auto-commit generated code to a GitHub repo; sync changes back.
- **Docker Support** — Generate Dockerfile and docker-compose.yml; run projects in containers.
- **Environment Management** — UI for managing .env files and secrets per deployment.

### Phase 4: Advanced AI Features (Q4 2026)
- **Custom Prompts Library** — Save, organize, and reuse common AI generation prompts.
- **AI Chat History** — View and replay previous AI generation requests; iterate on past projects.
- **Multi-LLM Support** — Switch between different AI providers (OpenAI, Claude, Hugging Face).
- **Batch Generation** — Generate multiple variations of a project with different configurations.

### Phase 5: Team & Enterprise (2027)
- **Project Permissions** — Role-based access (Owner, Editor, Viewer) for collaborators.
- **Audit Logs** — Track who made changes and when; compliance-friendly.
- **Team Workspaces** — Organize projects into teams; shared libraries and templates.
- **API Keys & Webhooks** — Programmatic access to generate and manage projects.

### Beyond
- **Mobile App** — Native iOS/Android app for viewing and editing on the go.
- **Offline Mode** — Work offline; sync when reconnected.
- **AI Code Review** — AI reviews generated code for best practices and security.
- **Plugin Ecosystem** — Third-party extensions for custom code generators and integrations.

---

**Built with ❤️ using React, Express, WebSockets, and MongoDB.**

- `GET /projects/get-project/:projectId` — Get project details.

Socket events (socket.io)
- Client emits: `project-message` with payload `{ message, sender }` to send chat messages.
- Server broadcasts: `project-message` where `message` may be a string or an object. When AI runs the server emits `project-message` with `message` set to the AI `result` (which may include `fileTree`).

Frontend data shapes
- Flattened `fileTree` (the canonical shape used by the ZIP endpoint and UI):

```json
{
  "package.json": { "content": "{...}" },
  "src/index.js": { "content": "console.log('hello')" }
}
```

Development notes & debugging
- The frontend uses an axios instance that reads `localStorage.token` and sets `Authorization: Bearer <token>` automatically. If `PUT /projects/add-user` returns 401, ensure `localStorage.token` holds a valid JWT.
- If header buttons appear unclickable, check that the header has a higher z-index than the conversation area. The UI code sets header z-index and pointer-events to ensure clicks register.
- To replicate AI behavior in development, emit a `project-message` socket event from the server that contains a `fileTree` or call `POST /ai/generate` (if implemented) and inspect the returned `fileTree`.

Useful curl examples

Download zip (client normally posts the fileTree):

```bash
curl -X POST http://localhost:3000/ai/zip \
  -H "Content-Type: application/json" \
  -d '{"fileTree": {"README.md": {"content": "# Hello"}}}' --output project.zip
```

Add collaborators (requires JWT in Authorization header):

```bash
curl -X PUT http://localhost:3000/projects/add-user \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"projectId":"<projectId>", "users":["<userId1>","<userId2>"]}'
```


