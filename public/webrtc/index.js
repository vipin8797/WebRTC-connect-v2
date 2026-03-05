// import callState from "./state.js";
// import { PeerConnection } from "./peerManager.js";
// import { startMyVideo, startScreenShare, stopScreenShare,toggleMic, toggleScreen } from "./mediaManager.js";
// import { registerSignaling } from "./signalingManager.js";
// import { startCall,callDisconnect } from "./negotiationmanager.js";
// import { createChatChannel,onMessageReceived, onTypingReceived, onFileRecived } from "./chatManager.js";
// import { appendChatMessage } from "../app.js";

// let globalSocket = null;
// // let globalTargeSocketId = null;
// export const startWebRTC = async(socket,{onRemoteStream,onLocalStream})=>{
//     if(!socket){
//         console.error("socket not found");
//         return;
//     } 
//     globalSocket = socket;
   
//     await startMyVideo()


//    //creating peer obj
//     PeerConnection.getInstance({
//         socket:globalSocket,
//         onRemoteStream,
//         onLocalStream});
//     if(!callState.peerConnectionObj){
//         console.error("peer is nto found in callstate");
//         return;
//     }else{
//             console.log("peerObject created: ",callState.peerConnectionObj);
//     }

   
     
//     //Registering Signallings
//     registerSignaling(globalSocket);
   

//     console.log("startWebRTC called");
// }


// //Exposing Negotiations functon to app.js
//  //Setup Negotiations
//     export function calling(targetSocketId) {
//         callState.toUser = targetSocketId;
//     startCall(targetSocketId, globalSocket);
// }

// //CallEnd Function
//   export function callEnd(){
//     if(!globalSocket){
//         console.error("call is not connected yet");
//         return;
//     }
//     callDisconnect(globalSocket);
//   }

    
// //Screen Share
// export function toggleScreenShare({ onLocalStream }) {

//   if (!callState.isLocalScreenSharing) {
//     startScreenShare({ onLocalStream });
//   } else {
//     stopScreenShare({ onLocalStream });
//   }
// }

// //fuction to monitor screeh share
// export function isRemoteScreenSharing(){
//    return callState.isRemoteScreenSharing;
// }

// export function isLocalScreenSharing(){
//    return callState.isLocalScreenSharing;
// }


// //Function to toggle Mic and Vide of Local
// export function toggleAudio(){
//     toggleMic();
// }
// export function toggleVideo(){
//     toggleScreen();
// }


// //Function to append incoming messages
// export function setupChat(appendChatMessage){
//   onMessageReceived((text)=>{
//     appendChatMessage(text, 'received');
//   })
// };



// //Function to append isTyping indicator in chat
// export function setupTyping(onTyping) {
//     onTypingReceived(onTyping)
// }

// //Function to handle recived files 
// export function getFile(callback){
//   onFileRecived(callback);
// }




















// =====================================================
// 🚀 WEBRTC BOOTSTRAP — Feature Initializer
// =====================================================
// Single entry point between app.js (UI layer) and
// all internal WebRTC modules.
//
// ✅ Exposes: startWebRTC, calling, callEnd, toggles, chat
// ❌ No UI button logic here
// ❌ No direct socket.on events here
// =====================================================

import callState from "./state.js";
import { PeerConnection } from "./peerManager.js";
import { startMyVideo, startScreenShare, stopScreenShare, toggleMic, toggleScreen } from "./mediaManager.js";
import { registerSignaling } from "./signalingManager.js";
import { startCall, callDisconnect } from "./negotiationmanager.js";
import { onMessageReceived, onTypingReceived, onFileRecived } from "./chatManager.js";

let globalSocket = null;


// ─── Initialize WebRTC ────────────────────────────
// Sets up peer connection, media and signaling
// Called once on app load from app.js
export const startWebRTC = async (socket, { onRemoteStream, onLocalStream }) => {
    if (!socket) {
        console.error("startWebRTC: socket not found");
        return;
    }

    globalSocket = socket;

    // STEP 1: Start local camera and mic
    await startMyVideo();

    // STEP 2: Create peer connection
    PeerConnection.getInstance({ socket: globalSocket, onRemoteStream, onLocalStream });

    if (!callState.peerConnectionObj) {
        console.error("startWebRTC: peer connection not created");
        return;
    }

    // STEP 3: Register all signaling events
    registerSignaling(globalSocket);

    console.log("WebRTC initialized");
};


// ─── Call Controls ────────────────────────────────

// Initiate a call to target user
export function calling(targetSocketId) {
    callState.toUser = targetSocketId;
    startCall(targetSocketId, globalSocket);
}

// End current call
export function callEnd() {
    if (!globalSocket) {
        console.error("callEnd: no active call found");
        return;
    }
    callDisconnect(globalSocket);
}


// ─── Screen Share Controls ────────────────────────

// Toggle screen share on/off
export function toggleScreenShare({ onLocalStream }) {
    if (!callState.isLocalScreenSharing) {
        startScreenShare({ onLocalStream });
    } else {
        stopScreenShare({ onLocalStream });
    }
}

// Check if remote peer is screen sharing
export function isRemoteScreenSharing() {
    return callState.isRemoteScreenSharing;
}

// Check if local user is screen sharing
export function isLocalScreenSharing() {
    return callState.isLocalScreenSharing;
}


// ─── Media Controls ───────────────────────────────

// Toggle local microphone on/off
export function toggleAudio() {
    toggleMic();
}

// Toggle local camera on/off
export function toggleVideo() {
    toggleScreen();
}


// ─── Chat Setup ───────────────────────────────────
// Connects UI callbacks to data channel events
// Called from app.js on load — before any call starts

// Register callback for incoming text messages
export function setupChat(appendChatMessage) {
    onMessageReceived((data) => {
        appendChatMessage(data, "received");
    });
}

// Register callback for typing indicator
export function setupTyping(onTyping) {
    onTypingReceived(onTyping);
}

// Register callback for incoming files
export function getFile(callback) {
    onFileRecived(callback);
}