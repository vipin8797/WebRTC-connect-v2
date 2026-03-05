// =====================================================
// 🔗 PEER CONNECTION MANAGEMENT
// =====================================================
// Responsible for creating, managing and destroying
// the RTCPeerConnection instance.
//
// ✅ Handles: tracks, ICE, data channel, state changes
// ❌ No offer/answer logic here
// ❌ No socket.on events here
// =====================================================

import callState from "./state.js";
import { handleIncomingMessage } from "./chatManager.js";

// ─── ICE Server Config ────────────────────────────
const ICE_CONFIG = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun4.l.google.com:19302",
            ],
        },
        {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
        },
    ],
};


// =====================================================
// PeerConnection — Singleton Pattern
// =====================================================
// Only one peer connection exists at a time.
// Use getInstance() to get or create the connection.
// =====================================================

export const PeerConnection = (function () {
    let peerConnection = null;
    let storeConfig = null;


    // ─── Create Peer Connection ───────────────────
    const createPeerConnection = ({ socket, onRemoteStream, onLocalStream }) => {

        peerConnection = new RTCPeerConnection(ICE_CONFIG);

        // STEP 1: Add local tracks to peer connection
        if (callState.localStream) {
            callState.localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, callState.localStream);
            });
            if (onLocalStream) onLocalStream(callState.localStream);
            console.log("Local tracks added to peer connection");
        }

        // STEP 2: Handle incoming remote stream
        peerConnection.ontrack = function (event) {
            console.log("Remote track received");
            callState.remoteStream = event.streams[0];
            if (onRemoteStream && callState.remoteStream) {
                onRemoteStream(callState.remoteStream);
            }
        };

        // STEP 3: Handle incoming data channel (callee side)
        // Caller creates the channel — callee receives it here
        peerConnection.ondatachannel = function (event) {
            if (!event || !event.channel) {
                console.error("ondatachannel: channel not received");
                return;
            }
            console.log("Data channel received:", event.channel);
            callState.dataChannel = event.channel;
            callState.dataChannel.binaryType = "arraybuffer";
            callState.dataChannel.onmessage = handleIncomingMessage;
        };

        // STEP 4: Send ICE candidates to remote peer via socket
        peerConnection.onicecandidate = function (event) {
            if (!event.candidate) return;
            if (!callState.toUser) {
                console.error("onicecandidate: target socket ID not found");
                return;
            }
            socket.emit("icecandidate", {
                to: callState.toUser,
                from: socket.id,
                candidate: event.candidate,
            });
        };

        // STEP 5: Monitor connection state changes
        peerConnection.onconnectionstatechange = () => {
            const state = peerConnection.connectionState;
            console.log("Connection state:", state);

            if (state === "failed" || state === "disconnected" || state === "closed") {
                // Give 5 seconds to recover before reloading
                setTimeout(() => {
                    if (
                        peerConnection.connectionState === "failed" ||
                        peerConnection.connectionState === "disconnected" ||
                        peerConnection.connectionState === "closed"
                    ) {
                        console.warn("Peer connection lost — reloading");
                        window.location.reload();
                    }
                }, 5000);

                onRemoteStream(null);
            }
        };

        // STEP 6: Save peer connection to shared state
        callState.peerConnectionObj = peerConnection;

        return peerConnection;
    };


    // ─── Public API ───────────────────────────────
    return {

        // Get existing or create new peer connection
        getInstance: ({ socket, onRemoteStream, onLocalStream }) => {
            storeConfig = { socket, onRemoteStream, onLocalStream };
            if (!peerConnection) {
                peerConnection = createPeerConnection({ socket, onRemoteStream, onLocalStream });
            }
            return peerConnection;
        },

        // Destroy peer connection and clean up state
        destroy: () => {
            if (!peerConnection) return;

            peerConnection.close();
            peerConnection = null;

            // Stop all local tracks
            if (callState.localStream) {
                callState.localStream.getTracks().forEach((t) => t.stop());
            }

            // Reset shared state
            callState.toUser = null;
            callState.peerConnectionObj = null;
            callState.localStream = null;
            callState.remoteStream = null;
            callState.isInCall = false;

            console.log("Peer connection destroyed");
        },

        // Reinitialize peer connection with saved config
        // Used when renegotiation is needed
        reInitPeer: () => {
            if (!storeConfig) {
                console.error("reInitPeer: no config found to reinitialize");
                return;
            }

            if (peerConnection) {
                peerConnection.close();
                peerConnection = null;
            }

            console.log("Reinitializing peer connection");
            peerConnection = createPeerConnection(storeConfig);
            return peerConnection;
        },
    };
})();