// import callState from "./state.js";
// import { PeerConnection } from "./peerManager.js";
// import { createChatChannel } from "./chatManager.js";

// //Function to call 
// export const startCall = async(socketId,socket)=>{
  
//     //Checking if rciver is busy or not




//    if(!socketId){
//     console.error("startCall: not target socket id is found");
//     return;
//    }
//     console.log("startCall functino is cllled in negotiationManager",socketId);



// //Checkinng signaling state befor offer createPeerConnection
//   if(callState.peerConnectionObj.signalingState !== "stable"){
//     console.warn("signalingState is not stable ");
//     return;
//   }    

//   //updating callState.
//    callState.toUser =  socketId;

//   //Creating Chat Data Channle befor offer creation
//   createChatChannel();
//   console.log("chat data chanell is created");
//   //Creating offer
//   const offer = await callState.peerConnectionObj.createOffer();
//   if(!offer){
//     console.warn("offer not created");
//     return;
//   }
//   await callState.peerConnectionObj.setLocalDescription(offer);


//   //Emitting offoer
//   socket.emit("offer",{
//     to:socketId,
//     offer:callState.peerConnectionObj.localDescription,
//     from:socket.id,
//   });
//   console.log("offer sent,",offer);
//   console.log(callState.peerConnectionObj);

// }





// //CallEnd functione
// export const callDisconnect = (socket)=>{
//     if(!callState.isInCall){
//         console.warn("already disconnected");
//         return;
//     }
//     // //Distroying peer
//     // PeerConnection.destroy();;
//     //    console.log("disconnected"); 
//     // PeerConnection.reInitPeer(); 
    
    
//     window.location.href="/";
//     // window.location.href = "/home.html";
//     // window.location.relode()

// }


// console.log("negotion loaded.");
































// =====================================================
// 📤 OUTGOING NEGOTIATION
// =====================================================
// Responsible for initiating and managing WebRTC calls.
// Creates offers and handles call disconnection.
//
// ✅ Handles: offer creation, call disconnect
// ❌ No socket.on events here
// ❌ No answer creation here (that's in signalingManager)
// =====================================================

import callState from "./state.js";
import { createChatChannel } from "./chatManager.js";


// ─── Start Call ───────────────────────────────────
// Initiates a call to a target user
// Creates data channel before offer — required for negotiation
export const startCall = async (socketId, socket) => {

    if (!socketId) {
        console.error("startCall: target socket ID not found");
        return;
    }

    if (!socket) {
        console.error("startCall: socket not found");
        return;
    }

    // STEP 1: Check signaling state before creating offer
    if (callState.peerConnectionObj.signalingState !== "stable") {
        console.warn("startCall: signaling state not stable — aborting");
        return;
    }

    // STEP 2: Save target user
    callState.toUser = socketId;

    // STEP 3: Create data channel before offer
    // Must be created before offer so callee receives ondatachannel event
    createChatChannel();
    console.log("Data channel created");

    // STEP 4: Create and set local offer
    const offer = await callState.peerConnectionObj.createOffer();
    if (!offer) {
        console.error("startCall: offer creation failed");
        return;
    }
    await callState.peerConnectionObj.setLocalDescription(offer);

    // STEP 5: Send offer to remote peer via socket
    socket.emit("offer", {
        to: socketId,
        from: socket.id,
        offer: callState.peerConnectionObj.localDescription,
    });

    console.log("Offer sent to:", socketId);
};


// ─── Disconnect Call ──────────────────────────────
// Ends the current call and redirects to home
export const callDisconnect = (socket) => {

    if (!callState.isInCall) {
        console.warn("callDisconnect: no active call found");
        return;
    }

    console.log("Call disconnected — redirecting to home");
    window.location.href = "/";
};

console.log("Negotiation manager loaded");