// =====================================================
// 🧠 WEBRTC SHARED STATE
// =====================================================
// Single source of truth for all WebRTC related state.
// Only store data here — no functions, no logic.
// All files import this and read/write directly.
// =====================================================

const callState = {

    // ─── Peer Connection ──────────────────────────
    peerConnectionObj: null,        // RTCPeerConnection instance
    toUser: null,                   // Target user's socket ID

    // ─── Media Streams ────────────────────────────
    localStream: null,              // Local camera/mic stream
    remoteStream: null,             // Remote peer's stream
    originalCameraStream: null,     // Saved stream before screen share

    // ─── Screen Share Flags ───────────────────────
    isLocalScreenSharing: false,    // Is local user screen sharing?
    isRemoteScreenSharing: false,   // Is remote user screen sharing?

    // ─── Call State ───────────────────────────────
    isInCall: false,                // Is call currently active?
    isRemoteBusy: false,            // Is remote user busy?

    // ─── ICE Candidates ───────────────────────────
    candidateQueue: [],             // Queue for early ICE candidates

    // ─── Data Channel ─────────────────────────────
    dataChannel: null,              // RTCDataChannel for chat/file sharing

};

export default callState;