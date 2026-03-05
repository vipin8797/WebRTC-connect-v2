// import callState from "./state.js";


// //Start My Video Function
// export const startMyVideo = async()=>{
   
//     try{
//     //  const stream = await navigator.mediaDevices.getUserMedia({
//     //     audio:true,
//     //     video:true,
//     //  });

//       const stream = await navigator.mediaDevices.getUserMedia({
//             video: {
//                 width: { min: 640, ideal: 1280, max: 1920 },
//                 height: { min: 480, ideal: 720, max: 1080 },
//                 frameRate: { ideal: 30, max: 60 },
//                 facingMode: "user"
//             },
//             audio: {
//                 echoCancellation: true,
//                 noiseSuppression: true,
//                 autoGainControl: true,
//                 sampleRate: 48000
//             }
//         });

//      if(!stream){
//         console.log("startMyVideo: did not gettting stream");
//         return;
//      }
//      callState.localStream = stream;
//       if(!callState.localStream){
//         console.warn("localStream in callstate is not set yet.");
//         return;
//       }
//        console.log("startMyVideo called");
//       console.log("callState stream: ",callState.localStream.getTracks());



//     }catch(err){
//         console.log("startMyVideo: ",err);
//     }


// }








// //Start Screen Shaare function
// export const startScreenShare = async ({ onLocalStream }) => {

//    try{

   
//   if (callState.isLocalScreenSharing) return;

//   const pc = callState.peerConnectionObj;
//   if (!pc) return;

//   const screenStream = await navigator.mediaDevices.getDisplayMedia({
//     video: true
//   });

//   const screenTrack = screenStream.getVideoTracks()[0];

//   const sender = pc.getSenders().find(
//     s => s.track && s.track.kind === "video"
//   );

//   if (!sender) {
//     console.error("No video sender found");
//     return;
//   }

  
//   callState.originalCameraStream = callState.localStream;

//   await sender.replaceTrack(screenTrack);

//   callState.isLocalScreenSharing = true;

//   onLocalStream(screenStream);

// //   //Emmitig startSchre share
// //  callState.socket.emit("screen-share-start", {
// //    to: callState.toUser
// // });

//   screenTrack.onended = () => {
//     stopScreenShare({ onLocalStream });
//   };

// }catch(err){
//   console.error(err);
// }
// };




// //Stop stopScreenShare
// export const stopScreenShare = async ({ onLocalStream }) => {

//   try{

  
//   if (!callState.isLocalScreenSharing) return;

//   const pc = callState.peerConnectionObj;
//   if (!pc) return;

//   const sender = pc.getSenders().find(
//     s => s.track && s.track.kind === "video"
//   );

//   const cameraTrack = callState.originalCameraStream.getVideoTracks()[0];

//   await sender.replaceTrack(cameraTrack);

//   callState.isLocalScreenSharing = false;

// //   //emmint stop screen share
// //   callState.socket.emit("screen-share-stop", {
// //    to: callState.toUser
// // });

//   onLocalStream(callState.originalCameraStream);

// }catch(err){
//   console.error(err);
// }
// };





// //Togggle Local Mic function
// export const toggleMic = async()=>{
//  console.log("toggle Mic called");
//   const localMicTrack = await callState.localStream.getAudioTracks()[0];

//    localMicTrack.enabled = !localMicTrack.enabled
// }

// //Toggle Local Video Function
// export const toggleScreen = async()=>{
//   console.log("toggle Video called");

//   const localVideoTrack = await callState.localStream.getVideoTracks()[0];
//   localVideoTrack.enabled = !localVideoTrack.enabled;
// }





























// =====================================================
// 🎥 MEDIA MANAGEMENT
// =====================================================
// Responsible for managing local media streams.
// Handles camera, microphone and screen sharing.
//
// ✅ Handles: getUserMedia, screen share, mic/video toggle
// ❌ No offer/answer logic here
// ❌ No socket events here
// =====================================================

import callState from "./state.js";


// ─── Start Local Video & Audio ────────────────────
// Requests camera and mic access from the browser
// Saves stream to callState.localStream
export const startMyVideo = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
                frameRate: { ideal: 30, max: 60 },
                facingMode: "user",
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 48000,
            },
        });

        if (!stream) {
            console.error("startMyVideo: stream not received");
            return;
        }

        callState.localStream = stream;
        console.log("Local stream started:", callState.localStream.getTracks());

    } catch (err) {
        console.error("startMyVideo error:", err);
    }
};


// ─── Start Screen Share ───────────────────────────
// Replaces camera track with screen track
// Saves original camera stream for restoration later
export const startScreenShare = async ({ onLocalStream }) => {
    try {
        if (callState.isLocalScreenSharing) return;

        const pc = callState.peerConnectionObj;
        if (!pc) return;

        // STEP 1: Get screen stream
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
        });

        const screenTrack = screenStream.getVideoTracks()[0];

        // STEP 2: Find existing video sender
        const sender = pc.getSenders().find(
            (s) => s.track && s.track.kind === "video"
        );

        if (!sender) {
            console.error("startScreenShare: no video sender found");
            return;
        }

        // STEP 3: Save camera stream and replace with screen track
        callState.originalCameraStream = callState.localStream;
        await sender.replaceTrack(screenTrack);
        callState.isLocalScreenSharing = true;
        onLocalStream(screenStream);

        // STEP 4: Auto stop when user ends screen share
        screenTrack.onended = () => {
            stopScreenShare({ onLocalStream });
        };

    } catch (err) {
        console.error("startScreenShare error:", err);
    }
};


// ─── Stop Screen Share ────────────────────────────
// Restores camera track after screen sharing ends
export const stopScreenShare = async ({ onLocalStream }) => {
    try {
        if (!callState.isLocalScreenSharing) return;

        const pc = callState.peerConnectionObj;
        if (!pc) return;

        // STEP 1: Find video sender
        const sender = pc.getSenders().find(
            (s) => s.track && s.track.kind === "video"
        );

        // STEP 2: Restore original camera track
        const cameraTrack = callState.originalCameraStream.getVideoTracks()[0];
        await sender.replaceTrack(cameraTrack);

        callState.isLocalScreenSharing = false;
        onLocalStream(callState.originalCameraStream);

    } catch (err) {
        console.error("stopScreenShare error:", err);
    }
};


// ─── Toggle Microphone ────────────────────────────
// Mutes or unmutes local audio track
export const toggleMic = () => {
    const audioTrack = callState.localStream.getAudioTracks()[0];
    if (!audioTrack) {
        console.error("toggleMic: audio track not found");
        return;
    }
    audioTrack.enabled = !audioTrack.enabled;
    console.log("Mic:", audioTrack.enabled ? "unmuted" : "muted");
};


// ─── Toggle Camera ────────────────────────────────
// Turns local video track on or off
export const toggleScreen = () => {
    const videoTrack = callState.localStream.getVideoTracks()[0];
    if (!videoTrack) {
        console.error("toggleScreen: video track not found");
        return;
    }
    videoTrack.enabled = !videoTrack.enabled;
    console.log("Camera:", videoTrack.enabled ? "on" : "off");
};