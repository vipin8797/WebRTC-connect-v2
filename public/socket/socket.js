// =====================================================
// 🔌 SOCKET LAYER — Single Instance Only
// =====================================================
// Responsible for creating and exporting socket instance.
// No WebRTC logic or socket.on events here.
// =====================================================

import callState from "../webrtc/state.js";

// ─── Socket Instance ──────────────────────────────
export const socket = io({
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});


// ─── Initialize Socket ────────────────────────────
// Registers user on server and handles incoming events
export function initSocket(username, { updateOnlineUsers }) {

    if (!username) {
        console.error("initSocket: username not received");
        return;
    }

    if (!socket) {
        console.error("initSocket: socket instance not found");
        return;
    }

    // STEP 1: On connect — register user
    // (also handles server restart scenario)
    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        socket.emit("user-joined", username);
    });

    // STEP 2: Register user on first load
    socket.emit("user-joined", username);

    // STEP 3: Update online users list
    socket.on("updated-users", (users) => {
        console.log("Online users:", users);
        if (updateOnlineUsers) {
            updateOnlineUsers(users, username);
        }
    });

    // STEP 4: Handle disconnect — cleanup state
    socket.on("disconnect", (reason) => {
        console.warn("Socket disconnected:", reason);

        if (callState.peerConnectionObj) {
            callState.peerConnectionObj.close();
            callState.peerConnectionObj = null;
        }

        if (callState.localStream) {
            callState.localStream.getTracks().forEach(t => t.stop());
            callState.localStream = null;
        }

        callState.toUser = null;
        callState.remoteStream = null;

        console.log("Cleanup complete");
    });

    console.log("Socket initialized:", socket.id);
}