# WebRTC Connect v2

A peer-to-peer video calling web application built from scratch using **WebRTC**, **Socket.IO**, and **Vanilla JavaScript** — with a clean, modular architecture.

**Live Demo** → [web-rtc-connect-v2.onrender.com](https://webrtc-connect-v2.onrender.com/)

---

## Features

- 1-to-1 Video Calling — HD video and audio via WebRTC
- Screen Sharing — Share your screen mid-call
- Peer-to-Peer Chat — Text chat via WebRTC DataChannel (no server needed)
- Typing Indicator — Real-time typing status
- File Sharing — Send files directly via DataChannel
- Mic / Camera Toggle — Mute and unmute on the fly
- Online Users List — See who's available to call
- Responsive UI — Works on desktop and mobile

---

## Tech Stack

| Technology | Usage |
|---|---|
| WebRTC | Peer-to-peer video, audio, and data |
| Socket.IO | Signaling server (offer, answer, ICE) |
| Node.js + Express | Server and static file serving |
| Vanilla JavaScript (ES Modules) | Frontend — no framework |
| Docker | Containerized development environment |

---

## Architecture Overview

This project follows a **Layered Architecture** with strict separation of concerns.

```
app.js (UI Layer)
    ↓
webrtc/index.js (Bridge Layer)
    ↓
webrtc/* (WebRTC Internal Layer)
    ↓
socket/socket.js (Socket Layer)
```

> `app.js` never directly imports from WebRTC internal files.
> It only talks to `webrtc/index.js` — which acts as a bridge.
> This keeps UI and WebRTC logic completely separate.

---

## Folder Structure

```
WebRTC-connect-v2/
│
├── app.js                          # Signaling Server
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .gitignore
│
└── public/                         # Browser files
    ├── index.html                  # UI
    ├── app.js                      # Master Controller
    ├── socket/
    │   └── socket.js               # Socket Instance
    └── webrtc/
        ├── state.js                # Shared State
        ├── peerManager.js          # Peer Connection
        ├── mediaManager.js         # Camera / Mic / Screen
        ├── negotiationManager.js   # Offer Creation
        ├── signalingManager.js     # Incoming Events
        ├── chatManager.js          # DataChannel Chat
        └── index.js                # WebRTC Bootstrap
```

---

## Local Setup

### Without Docker

```bash
# 1. Clone the repo
git clone https://github.com/vipin8797/WebRTC-connect-v2.git
cd WebRTC-connect-v2

# 2. Install dependencies
npm install

# 3. Start server
node app.js

# 4. Open in browser
http://localhost:3000
```

### With Docker

> Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) to be installed and running.

```bash
# 1. Clone the repo
git clone https://github.com/vipin8797/WebRTC-connect-v2.git
cd WebRTC-connect-v2

# 2. Build image and start container
docker compose up --build

# 3. Open in browser
http://localhost:3000
```

**Subsequent runs** (image already built):
```bash
docker compose up
```

**Useful Docker commands:**
```bash
# Run in background
docker compose up -d

# View logs (when running in background)
docker compose logs -f

# Stop container
docker compose down

# Rebuild image (after package.json or Dockerfile changes)
docker compose up --build
```

> Source code is mounted as a volume — changes reflect instantly via nodemon without rebuilding the image.

> Open in two different browser tabs or devices to test calling.

---

## Call Flow

```
1. Both users open the app and enter username
       ↓
2. Socket connects → "user-joined" emitted → online list updated
       ↓
3. Caller clicks "Call" on a user
       ↓
4. createChatChannel() → DataChannel created
       ↓
5. createOffer() → setLocalDescription() → socket.emit("offer")
       ↓
6. Server forwards offer to callee
       ↓
7. Callee: setRemoteDescription() → createAnswer() → emit "answer"
       ↓
8. Caller: setRemoteDescription(answer)
       ↓
9. ICE candidates exchanged → direct P2P path established
       ↓
10. ontrack fires → remote video starts playing
        ↓
11. DataChannel ready → Chat, typing, file sharing all work
```

---

## File Breakdown

### `app.js` (Root) — Signaling Server

- Express server — serves all files from `/public`
- Socket.IO server — manages all connected users
- Acts as a relay for WebRTC signaling messages
- Does NOT process any WebRTC logic — only forwards

| Event | What it does |
|---|---|
| `user-joined` | Registers user with their socket ID |
| `offer` | Forwards offer from caller to callee |
| `answer` | Forwards answer from callee to caller |
| `icecandidate` | Forwards ICE candidates between peers |
| `busy` | Forwards busy signal when peer is in a call |
| `screen-share-start` | Notifies remote peer that screen share started |
| `screen-share-stop` | Notifies remote peer that screen share stopped |
| `disconnect` | Removes user from list, notifies everyone |

---

### `public/app.js` — Master Controller (UI Layer)

- The only file that touches the DOM
- Connects user actions to WebRTC functions
- Calls `webrtc/index.js` only — never internal WebRTC files directly

```
✅ app.js → webrtc/index.js      (allowed)
❌ app.js → webrtc/peerManager   (not allowed — breaks separation)
```

---

### `public/socket/socket.js` — Socket Layer

- Creates a **single Socket.IO instance** for the entire app
- Handles user registration on connect and server restart
- On disconnect — cleans up peer connection and streams

> Single instance ensures no duplicate connections or events.

---

### `public/webrtc/state.js` — Shared State

Single object storing all WebRTC-related state — no logic, pure data store.

| Property | Type | Description |
|---|---|---|
| `peerConnectionObj` | RTCPeerConnection | Active peer connection |
| `toUser` | String | Target user's socket ID |
| `localStream` | MediaStream | Camera + mic stream |
| `remoteStream` | MediaStream | Remote peer's stream |
| `originalCameraStream` | MediaStream | Saved before screen share |
| `isLocalScreenSharing` | Boolean | Is local user sharing screen? |
| `isRemoteScreenSharing` | Boolean | Is remote user sharing screen? |
| `isInCall` | Boolean | Is call currently active? |
| `candidateQueue` | Array | ICE candidates queued before remote desc is set |
| `dataChannel` | RTCDataChannel | Channel for chat and file sharing |

---

### `public/webrtc/peerManager.js` — Peer Connection

- Creates and manages `RTCPeerConnection` — Singleton pattern
- Adds local media tracks, receives remote stream via `ontrack`
- Sends ICE candidates to remote peer via socket
- ICE config: 5 Google STUN servers + 1 TURN server (openrelay)

---

### `public/webrtc/mediaManager.js` — Media Management

- Requests camera and mic access
- Manages screen sharing — replaces camera track with screen track
- Toggles mic and camera (enable/disable tracks)

---

### `public/webrtc/negotiationManager.js` — Outgoing Negotiation

- `startCall()` — initiated by the caller only
- Creates DataChannel **before** offer so callee receives `ondatachannel`

---

### `public/webrtc/signalingManager.js` — Incoming Signaling

All incoming `socket.on` events registered in one place.

| Event | Handling |
|---|---|
| `offer` | Check busy → setRemoteDescription → createAnswer → emit answer |
| `answer` | setRemoteDescription → flush ICE queue |
| `icecandidate` | addIceCandidate or queue if remote desc not set yet |
| `busy` | Rollback localDescription |

---

### `public/webrtc/chatManager.js` — Chat (DataChannel)

| Message Type | Format | Description |
|---|---|---|
| Text | `{ text, time }` | Regular chat message |
| Typing | `{ type: "typing", isTyping }` | Typing indicator |
| File info | `{ type: "file-info", name, fileType }` | Sent before file binary |
| File data | `ArrayBuffer` | Raw binary file |

---

### `public/webrtc/index.js` — Bridge Layer

Single entry point between `app.js` and all WebRTC modules.

| Function | Description |
|---|---|
| `startWebRTC()` | Initialize camera, peer connection, signaling |
| `calling(socketId)` | Initiate a call |
| `callEnd()` | End call |
| `toggleScreenShare()` | Toggle screen sharing |
| `toggleAudio()` | Toggle mic |
| `toggleVideo()` | Toggle camera |
| `setupChat(cb)` | Register message callback |
| `setupTyping(cb)` | Register typing callback |
| `getFile(cb)` | Register file callback |

---

## Concepts Used

| Concept | Where |
|---|---|
| RTCPeerConnection | peerManager.js |
| Offer / Answer (SDP) | negotiationManager.js, signalingManager.js |
| ICE Candidates | signalingManager.js, peerManager.js |
| STUN / TURN Servers | peerManager.js |
| RTCDataChannel | chatManager.js |
| MediaStream / getUserMedia | mediaManager.js |
| getDisplayMedia (Screen Share) | mediaManager.js |
| replaceTrack | mediaManager.js |
| ArrayBuffer / Blob / FileReader | chatManager.js |
| Singleton Pattern | peerManager.js |
| Callback Injection Pattern | index.js ↔ app.js |
| Separation of Concerns | Entire architecture |

---

## Deployment

This app requires a **persistent server** for Socket.IO — serverless platforms like Vercel are not supported.

Recommended: [Render](https://render.com) — Free tier available.

---

## Roadmap

- [ ] Mobile responsiveness improvements
- [ ] Group calling (Mesh topology)
- [ ] SFU integration (Livekit) for scalable group calls
- [ ] Message history
- [ ] Call notifications

---

## Author

**Vipin** — Built as a learning project to deeply understand WebRTC internals and clean frontend architecture.
