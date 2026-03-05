# 🎥 WebRTC Connect v2

A peer-to-peer video calling web application built from scratch using **WebRTC**, **Socket.IO**, and **Vanilla JavaScript** — with a clean, modular architecture.

Live Demo → [web-rtc-connect-v2.onrender.com](https://webrtc-connect-v2.onrender.com/)

---

## ✨ Features

- 📹 **1-to-1 Video Calling** — HD video and audio via WebRTC
- 🖥️ **Screen Sharing** — Share your screen mid-call
- 💬 **Peer-to-Peer Chat** — Text chat via WebRTC DataChannel (no server needed)
- ⌨️ **Typing Indicator** — Real-time typing status
- 📎 **File Sharing** — Send files directly via DataChannel
- 🔇 **Mic / Camera Toggle** — Mute and unmute on the fly
- 👥 **Online Users List** — See who's available to call
- 📱 **Responsive UI** — Works on desktop and mobile

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| WebRTC | Peer-to-peer video, audio, and data |
| Socket.IO | Signaling server (offer, answer, ICE) |
| Node.js + Express | Server and static file serving |
| Vanilla JavaScript (ES Modules) | Frontend — no framework |

---

## 🏗️ Architecture Overview

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

**Key Rule:**
> `app.js` never directly imports from WebRTC internal files.
> It only talks to `webrtc/index.js` — which acts as a bridge.
> This keeps UI and WebRTC logic completely separate.

---

## 📁 Folder Structure

```
WebRTC-connect-v2/
│
├── app.js                          # 🖥️ Signaling Server
├── package.json                    
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

## 📄 File-by-File Breakdown

---

### `app.js` (Root) — 🖥️ Signaling Server

**What it does:**
- Express server — serves all files from `/public`
- Socket.IO server — manages all connected users
- Acts as a **relay** for WebRTC signaling messages
- Does NOT process any WebRTC logic — only forwards

**Signaling events it handles:**

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

**Why no WebRTC logic here?**
> Once peers exchange offer/answer/ICE via socket, all communication (video, audio, chat, files) happens **directly between browsers** — server is not involved anymore.

---

### `public/index.html` — 🎨 UI Layout

**What it does:**
- Defines two screens: **Login Screen** and **Main App Screen**
- CSS variables for consistent theming (colors, shadows, radius)
- Glass morphism UI style
- All DOM elements that `app.js` controls

**Key sections:**
- Login card — username input
- Top navigation — connection status, online users dropdown
- Video area — remote video (large), local video (picture-in-picture)
- Control bar — mic, video, screen share, chat, end call buttons
- Chat panel — messages, typing indicator, file upload
- Responsive styles for mobile

---

### `public/app.js` — 🧩 Master Controller (UI Layer)

**What it does:**
- The only file that touches the DOM
- Connects user actions (button clicks) to WebRTC functions
- Renders online users list
- Handles chat UI — send, receive, file, typing indicator
- Calls `webrtc/index.js` functions — never internal WebRTC files directly

**Sections inside:**

| Section | Responsibility |
|---|---|
| Imports | Socket, WebRTC bridge, chat functions |
| DOM Elements | All `getElementById` calls |
| `handleLogin()` | Initializes socket + WebRTC on login |
| `updateOnlineUsers()` | Renders online users, attaches call buttons |
| Call Controls | Mic, video, screen share, end call button listeners |
| Chat | Send message, receive message, typing, file send/receive |
| UI Helpers | `setLocalStream`, `setRemoteStream`, `setUI_CallEnded` |
| Event Listeners | All button/keyboard/click events registered here |

**Architecture rule followed:**
```
✅ app.js → webrtc/index.js    (allowed)
❌ app.js → webrtc/peerManager (not allowed — breaks separation)
```

---

### `public/socket/socket.js` — 🔌 Socket Layer

**What it does:**
- Creates a **single Socket.IO instance** for the entire app
- Exports it so other files can import and use it
- Handles user registration on connect (also on server restart)
- Listens for online users updates
- On disconnect — cleans up peer connection and streams

**Why single instance?**
> If socket was created in multiple files, there would be multiple connections to the server — causing duplicate events and bugs.

**What it does NOT do:**
- No WebRTC logic
- No `socket.on` for signaling events (those are in `signalingManager.js`)

---

### `public/webrtc/state.js` — 🧠 Shared State

**What it does:**
- Single object that stores all WebRTC-related state
- All WebRTC files import this and read/write directly
- No functions, no logic — pure data store

**Properties stored:**

| Property | Type | Description |
|---|---|---|
| `peerConnectionObj` | RTCPeerConnection | The active peer connection |
| `toUser` | String | Target user's socket ID |
| `localStream` | MediaStream | Camera + mic stream |
| `remoteStream` | MediaStream | Remote peer's stream |
| `originalCameraStream` | MediaStream | Saved before screen share |
| `isLocalScreenSharing` | Boolean | Is local user sharing screen? |
| `isRemoteScreenSharing` | Boolean | Is remote user sharing screen? |
| `isInCall` | Boolean | Is call currently active? |
| `isRemoteBusy` | Boolean | Is remote peer busy? |
| `candidateQueue` | Array | ICE candidates queued before remote desc is set |
| `dataChannel` | RTCDataChannel | Channel for chat and file sharing |

**Why a shared state file?**
> Without this, every file would need to pass data around as parameters — creating messy dependencies. Single state = single source of truth.

---

### `public/webrtc/peerManager.js` — 🔗 Peer Connection Management

**What it does:**
- Creates and manages the `RTCPeerConnection` instance
- Uses **Singleton pattern** — only one peer connection exists at a time
- Adds local media tracks to the connection
- Receives remote stream via `ontrack`
- Receives DataChannel from caller via `ondatachannel`
- Sends ICE candidates to remote peer via socket
- Monitors connection state — auto-reloads if connection drops

**Singleton pattern explained:**
```
First call → create new RTCPeerConnection
Second call → return existing one (don't create again)
```

**Methods exposed:**

| Method | Description |
|---|---|
| `getInstance()` | Get or create peer connection |
| `destroy()` | Close connection, stop tracks, clean state |
| `reInitPeer()` | Close and recreate with same config |

**ICE Server Config:**
- 5 Google STUN servers for NAT traversal
- 1 TURN server (openrelay) for fallback when direct connection fails

**What it does NOT do:**
- No offer/answer creation
- No `socket.on` event registration

---

### `public/webrtc/mediaManager.js` — 🎥 Media Management

**What it does:**
- Requests camera and mic access from browser
- Saves stream to `state.localStream`
- Manages screen sharing — replaces camera track with screen track
- Restores camera when screen share stops
- Toggles mic (enable/disable audio track)
- Toggles camera (enable/disable video track)

**`startMyVideo()` settings:**
```
Video: 640p min → 720p ideal → 1080p max
       30fps ideal, 60fps max
Audio: Echo cancellation ON
       Noise suppression ON
       Auto gain control ON
       Sample rate: 48000 Hz
```

**Screen share flow:**
```
1. getDisplayMedia() — get screen stream
2. Find existing video sender in peer connection
3. Save camera stream to originalCameraStream
4. replaceTrack() — swap camera with screen
5. screenTrack.onended → auto restore camera
```

**What it does NOT do:**
- No offer/answer logic
- No socket events

---

### `public/webrtc/negotiationManager.js` — 📤 Outgoing Negotiation

**What it does:**
- `startCall()` — initiated by the **caller** only
- `callDisconnect()` — ends the call

**`startCall()` step by step:**
```
Step 1 → Check signalingState === "stable"
Step 2 → Save target socket ID to state.toUser
Step 3 → createChatChannel() — BEFORE offer (important!)
Step 4 → createOffer()
Step 5 → setLocalDescription(offer)
Step 6 → socket.emit("offer", { to, from, offer })
```

**Why DataChannel BEFORE offer?**
> DataChannel info must be included in the offer SDP so the callee receives the `ondatachannel` event. If created after, callee won't know about it.

**What it does NOT do:**
- No `socket.on` events
- No answer creation (that's in `signalingManager.js`)

---

### `public/webrtc/signalingManager.js` — 📥 Incoming Signaling Events

**What it does:**
- Registers ALL incoming `socket.on` events in one place
- Handles the callee side of offer/answer flow

**Events handled:**

| Event | Step-by-step |
|---|---|
| `offer` | 1. Check if busy → send busy signal if yes. 2. Save caller's ID. 3. setRemoteDescription. 4. Flush ICE queue. 5. createAnswer. 6. setLocalDescription. 7. emit answer |
| `answer` | 1. setRemoteDescription. 2. Flush ICE queue. 3. Set isInCall = true |
| `icecandidate` | If remoteDescription set → addIceCandidate. Else → push to candidateQueue |
| `busy` | rollback localDescription |
| `screen-share-start` | Set isRemoteScreenSharing = true |
| `screen-share-stop` | Set isRemoteScreenSharing = false |

**ICE Queue — why it exists:**
> Sometimes ICE candidates arrive before `setRemoteDescription` is called. Adding them before remote description causes an error. So they are queued and flushed after remote description is set.

**What it does NOT do:**
- No DOM manipulation
- No offer creation

---

### `public/webrtc/chatManager.js` — 💬 Chat Manager (DataChannel)

**What it does:**
- Creates DataChannel for the caller
- Handles ALL incoming data — text, typing, file info, file data
- Sends text messages, typing events, and files
- Stores callbacks for message, typing, and file events

**DataChannel message types:**

| Type | Format | Description |
|---|---|---|
| Text message | `{ text, time }` | Regular chat message |
| Typing | `{ type: "typing", isTyping }` | Typing indicator |
| File info | `{ type: "file-info", name, fileType }` | Sent before file |
| File data | `ArrayBuffer` | Raw binary file data |

**Incoming message flow:**
```
handleIncomingMessage(event)
    ↓
Is ArrayBuffer? → file received → build Blob → create URL → onFileCallback
    ↓
Parse JSON
    ↓
type === "file-info"? → save to pendingFileInfo
type === "typing"?    → onTypingCallback(isTyping)
else                  → onMessageCallback(data)
```

**File sending flow:**
```
sendFile(file)
    ↓
1. Send file-info JSON first (name, type)
2. FileReader.readAsArrayBuffer(file)
3. reader.onload → dataChannel.send(reader.result)
```

**Callback pattern used:**
```javascript
// Callbacks stored here
let onMessageCallback = null
let onTypingCallback = null
let onFileCallback = null

// app.js registers callbacks via index.js
onMessageReceived(callback) → stores callback
onTypingReceived(callback)  → stores callback
onFileRecived(callback)     → stores callback
```

---

### `public/webrtc/index.js` — 🚀 WebRTC Bootstrap (Bridge Layer)

**What it does:**
- Single entry point between `app.js` and all WebRTC modules
- `app.js` only imports from here — never from individual files
- Initializes WebRTC on startup
- Exposes simple functions for UI to call

**`startWebRTC()` initialization order:**
```
Step 1 → startMyVideo()         — get camera + mic
Step 2 → PeerConnection.getInstance() — create peer
Step 3 → registerSignaling()    — register socket events
```

**Functions exposed to app.js:**

| Function | Internal call | Description |
|---|---|---|
| `startWebRTC()` | Multiple | Initialize everything |
| `calling(socketId)` | `startCall()` | Initiate a call |
| `callEnd()` | `callDisconnect()` | End call |
| `toggleScreenShare()` | `startScreenShare / stopScreenShare` | Toggle screen |
| `toggleAudio()` | `toggleMic()` | Toggle mic |
| `toggleVideo()` | `toggleScreen()` | Toggle camera |
| `setupChat(cb)` | `onMessageReceived()` | Register message callback |
| `setupTyping(cb)` | `onTypingReceived()` | Register typing callback |
| `getFile(cb)` | `onFileRecived()` | Register file callback |

**Why this bridge exists:**
> Without index.js, app.js would need to import from 6 different WebRTC files — and WebRTC files might need to import from app.js (circular dependency risk). The bridge eliminates this problem.

---

## 🔄 Call Flow — Step by Step

```
1. Both users open the app and enter username
       ↓
2. Socket connects → "user-joined" emitted → online list updated
       ↓
3. Caller clicks "Call" button on a user
       ↓
4. calling(socketId) → startCall()
       ↓
5. createChatChannel() → DataChannel created
       ↓
6. createOffer() → setLocalDescription() → socket.emit("offer")
       ↓
7. Server forwards offer to callee
       ↓
8. Callee receives "offer" event
       ↓
9. setRemoteDescription(offer) → createAnswer() → setLocalDescription() → emit "answer"
       ↓
10. Caller receives "answer" → setRemoteDescription()
       ↓
11. ICE candidates exchanged via socket → direct P2P path established
       ↓
12. ontrack fires → remote video starts playing
       ↓
13. ondatachannel fires on callee → DataChannel ready
       ↓
14. Chat, typing, file sharing all work via DataChannel
```

---

## 🚀 Local Setup

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

> **Note:** Open in two different browser tabs or devices to test calling.

---

## 🌐 Deployment

This app requires a **persistent server** for Socket.IO — it cannot be deployed on serverless platforms like Vercel.

**Recommended platforms:**
- [Render](https://render.com) — Free tier available


---

## 📚 Concepts Used

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

## 🗺️ Roadmap

- [ ] Mobile responsiveness improvements
- [ ] Group calling (Mesh topology)
- [ ] SFU integration (Livekit) for scalable group calls
- [ ] Message history
- [ ] Call notifications

---

## 👤 Author

**Vipin** — Built as a learning project to deeply understand WebRTC internals and clean frontend architecture.
