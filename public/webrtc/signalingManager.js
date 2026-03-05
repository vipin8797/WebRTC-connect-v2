// import callState from "./state.js";



// export const registerSignaling = (socket)=>{
//   if(!socket){
//     console.error("registerSignaling: no socket recived");
//     return;
//   }



//  socket.on("busy",async({from})=>{
//     await callState.peerConnectionObj.setLocalDescription({ type: "rollback" });
//     console.log("reciver is busy");
//     console.log("remote is busy rolling back");
//    })





// //Recieving Offer from Caller  
//   socket.on("offer", async ({ from, offer }) => {

  
//    //Checking if we are on another call
//    if(callState.isInCall){
//     console.log("saying we are busy");
//      socket.emit("busy",({from:socket.id , to:from}))
//    }else{
    
   


//    console.log("got offer event triggered");

//    if (!offer) {
//       console.error("offer not found");
//       return;
//    }
//    console.log("from",from,"offer:",offer);

//    if (!callState.peerConnectionObj) {
//       console.error("peer not initialized");
//       return;
//    }

//    //updating callState.
//    callState.toUser = from;

//    if (callState.peerConnectionObj.signalingState !== "stable") {
//       console.warn("signaling state not stable");
//       return;
//    }


//    await callState.peerConnectionObj.setRemoteDescription(offer);
//    console.log("offer is set to remoteDesctipinot");

//   //ICE Queue Flush
//  for (const candidate of callState.candidateQueue) {
//    try {
//       await callState.peerConnectionObj.addIceCandidate(candidate);
//    } catch (err) {
//       console.error("Error adding queued ICE:", err);
//    }
// }
// callState.candidateQueue = [];


//    const answer = await callState.peerConnectionObj.createAnswer();
//    console.log("answer created:",answer);
//    await callState.peerConnectionObj.setLocalDescription(answer);
//    console.log("answer stroed in localDescription");
//    socket.emit("answer", {
//       to: callState.toUser,
//       answer: answer
//    });

//    console.log("answer sent");
//    callState.isInCall = true;
// }

// });


  









// //Getting answer after sending offer
// socket.on("answer", async ({ answer }) => {

//    if (!answer) {
//       console.error("answer not found");
//       return;
//    }
// if (!callState.peerConnectionObj){
//   console.error("peerObje in callState must to accept call ");
//   return;
// };
//    await callState.peerConnectionObj.setRemoteDescription(answer);

//    //Flushing ice 
//    for (const candidate of callState.candidateQueue) {
//       await callState.peerConnectionObj.addIceCandidate(candidate);
//    }
//    callState.candidateQueue = [];

//    //updatinng callState
//    callState.isInCall = true;
  
//    console.log("answer set to remoteDescription");
// });




// //ICE Exchange to establish ICE connections
// socket.on("icecandidate", async ({ candidate }) => {

//    if (!callState.peerConnectionObj){
//     console.error("peerObject is not found");
//     return;
//    };

//    if (!callState.peerConnectionObj.remoteDescription) {
//       console.warn("Remote description not set yet");
//       callState.candidateQueue.push(candidate);
//       console.log("pushing ice in queue");
//       return;
//    }

//    await callState.peerConnectionObj.addIceCandidate(candidate);

//    console.log("ICE candidate added");
// });









// socket.on('busy', async(msg)=>{
//   console.log(msg);
 
// });





// socket.on("screen-share-start", () => {
//    callState.isRemoteScreenSharing = true;
// });

// socket.on("screen-share-stop", () => {
//    callState.isRemoteScreenSharing = false;
// });











// }























































// =====================================================
// 📥 INCOMING SIGNALING EVENTS
// =====================================================
// Responsible for handling all incoming socket events.
// Registers all signaling listeners in one place.
//
// ✅ Handles: offer, answer, ICE, busy, screen share
// ❌ No DOM manipulation here
// ❌ No offer/answer creation here
// =====================================================

import callState from "./state.js";


// ─── Register All Signaling Events ───────────────
export const registerSignaling = (socket) => {
    if (!socket) {
        console.error("registerSignaling: socket not received");
        return;
    }


    // ─── Busy Signal ──────────────────────────────
    // Remote peer is already in a call — rollback our offer
    socket.on("busy", async ({ from }) => {
        console.warn("Remote peer is busy — rolling back offer");
        await callState.peerConnectionObj.setLocalDescription({ type: "rollback" });
    });


    // ─── Incoming Offer ───────────────────────────
    // Received from caller — create and send answer
    socket.on("offer", async ({ from, offer }) => {

        // If we are already in a call — reject with busy signal
        if (callState.isInCall) {
            console.warn("Already in a call — sending busy signal");
            socket.emit("busy", { from: socket.id, to: from });
            return;
        }

        if (!offer) {
            console.error("offer event: offer not received");
            return;
        }

        if (!callState.peerConnectionObj) {
            console.error("offer event: peer connection not initialized");
            return;
        }

        // STEP 1: Save caller's socket ID
        callState.toUser = from;

        // STEP 2: Check signaling state before proceeding
        if (callState.peerConnectionObj.signalingState !== "stable") {
            console.warn("offer event: signaling state not stable — ignoring");
            return;
        }

        // STEP 3: Set remote description
        await callState.peerConnectionObj.setRemoteDescription(offer);
        console.log("Remote description set from offer");

        // STEP 4: Flush any queued ICE candidates
        for (const candidate of callState.candidateQueue) {
            try {
                await callState.peerConnectionObj.addIceCandidate(candidate);
            } catch (err) {
                console.error("Error adding queued ICE candidate:", err);
            }
        }
        callState.candidateQueue = [];

        // STEP 5: Create and send answer
        const answer = await callState.peerConnectionObj.createAnswer();
        await callState.peerConnectionObj.setLocalDescription(answer);
        socket.emit("answer", { to: callState.toUser, answer });

        callState.isInCall = true;
        console.log("Answer sent to caller");
    });


    // ─── Incoming Answer ──────────────────────────
    // Received from callee after sending offer
    socket.on("answer", async ({ answer }) => {

        if (!answer) {
            console.error("answer event: answer not received");
            return;
        }

        if (!callState.peerConnectionObj) {
            console.error("answer event: peer connection not found");
            return;
        }

        // STEP 1: Set remote description from answer
        await callState.peerConnectionObj.setRemoteDescription(answer);

        // STEP 2: Flush queued ICE candidates
        for (const candidate of callState.candidateQueue) {
            try {
                await callState.peerConnectionObj.addIceCandidate(candidate);
            } catch (err) {
                console.error("Error adding queued ICE candidate:", err);
            }
        }
        callState.candidateQueue = [];

        callState.isInCall = true;
        console.log("Answer received — call established");
    });


    // ─── ICE Candidate Exchange ───────────────────
    // Add remote ICE candidates to establish connection path
    socket.on("icecandidate", async ({ candidate }) => {

        if (!callState.peerConnectionObj) {
            console.error("icecandidate event: peer connection not found");
            return;
        }

        // Queue candidate if remote description not set yet
        if (!callState.peerConnectionObj.remoteDescription) {
            console.warn("icecandidate: remote description not set — queuing candidate");
            callState.candidateQueue.push(candidate);
            return;
        }

        await callState.peerConnectionObj.addIceCandidate(candidate);
        console.log("ICE candidate added");
    });


    // ─── Screen Share State ───────────────────────
    // Track remote peer's screen sharing status
    socket.on("screen-share-start", () => {
        callState.isRemoteScreenSharing = true;
        console.log("Remote screen sharing started");
    });

    socket.on("screen-share-stop", () => {
        callState.isRemoteScreenSharing = false;
        console.log("Remote screen sharing stopped");
    });

};