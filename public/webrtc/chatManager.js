
// import callState from "./state.js";

// let onMessageCallback = null;
// let onTypingCallback = null;
// let onFileCallback = null;
// let pendingFileInfo = null;






// //Function to handle incomming message for calleee
// export function handleIncomingMessage(event){
//     if(!event || !event.data)return;
//     // console.log("event: ",event);
//     // console.log("event.data: ",event.data);



// // ArrayBuffer aaya — pendingFileInfo use karo
// if(event.data instanceof ArrayBuffer) {
//     const blob = new Blob([event.data], { type: pendingFileInfo.fileType })
//     const url = URL.createObjectURL(blob)
//     if(onFileCallback) onFileCallback({ url, name: pendingFileInfo.name })
//     pendingFileInfo = null
//     return
// }




// const data = JSON.parse(event.data);
// // file-info store karo
// if(data.type === "file-info") {
//     pendingFileInfo = data  // variable banao upar
//     return
// }






//  console.log("message recived: ",JSON.parse(event.data));

// //Checkng if data is message or isTyping 
  
//      if(data.type == "typing"){
//            if(onTypingCallback){
//             onTypingCallback(data.isTyping);
//            }
//      }else{
//          if(onMessageCallback){
//         onMessageCallback(JSON.parse(event.data));
//     }

//      }    
//     console.log("message recived: ",JSON.parse(event.data));
//     // // const data = event;
//     // // console.log("data:",data);
//     // // console.log("parsedData: ",JSON.parse(data));
//     // if(onMessageCallback){
//     //     onMessageCallback(JSON.parse(event.data));
//     // }

// }






// //Function to create Data channel only for caller
//  export const createChatChannel = ()=>{
//     console.log("createChatChannel is called");
//     const channel = callState.peerConnectionObj.createDataChannel("chat");
//     console.log("chatDatChannel created: ",channel);
//     callState.dataChannel =  channel;
//     callState.dataChannel.binaryType = "arraybuffer"  //to setup arrayBuffer



// //   //Listeing for onmessage event
// //   callState.dataChannel.onmessage = (event)=>{
// //        if(!event || !event.data){
// //         console.error("did not revier event");
// //         return;
// //        }
// //        console.log("recived message: ",event.data);
// //        if(onMessageCallback){
// //         onMessageCallback(event.data);
// //        }
// //   }

// //listeing for caller message on calle side
// callState.dataChannel.onmessage = handleIncomingMessage  
// }



// //Function to send Message
// export const sendMessage = (data)=>{
//     // const data = {
//     //     text:text,
//     //     time:new Date().toLocaleTimeString(),
//     // }
    
//     // const parsedData = JSON.stringify(data);
//     // console.log("sendData:",data);
//     // console.log("parsed:",parsedData);

//     if (!callState.dataChannel) {
//     console.error("DataChannel exist nahi karta");
//     return;
//     }
//     else if (callState.dataChannel.readyState === "open") {
//     console.log("DataChannel is ready");
//    }
//    else {
//     console.log("DataChannel exist but not in open readyState");
//      }


//   //sending message
//   callState.dataChannel.send(JSON.stringify(data));
//  console.log("message sent:",JSON.stringify(data));
//     console.log("sendMessage funcction is called");
// }




// //Function to recive messages
// // export const onMessageReceived = (callback)=>{
// //     console.log("onMessageReceived function called");
// //     callState.dataChannel.onmessage = (event)=>{
// //       onMessageCallback = callback;
// //     }
// // }

// export const onMessageReceived = (callback) => {
//     onMessageCallback = callback  // bas itna!
// }






// //Function to send IsTyping event
// export const sendTyping = (isTyping)=>{

//   if(callState.dataChannel.readyState !== "open"){
//     console.error("data channel is not ready");
//     return;
//   }

//   callState.dataChannel.send(JSON.stringify({
//     type:"typing",
//     isTyping,
//   }))
//   console.log("isTyping fired");

// }




// export const onTypingReceived = (callback) => {
//     onTypingCallback = callback
// }





// //Functon to sendFile
// export const sendFile = (file) => {
//     console.log("sendFile function called");
//     // 1. readyState check karo — same as sendMessage
  
//         if(callState.dataChannel.readyState !== "open"){
//             console.error("data channel is not in open state");
//             return;
//         }
//     // 2. FileReader banao
//       const reader  = new FileReader();
//         console.log("reader: ",reader);

//    // 4. reader.readAsArrayBuffer(file) se scan shuru karo
//        reader.readAsArrayBuffer(file);
    
//     // 4. reader.onload mein:
//     //    - dataChannel.send(reader.result) karo

//     // pehle file info bhejo
// callState.dataChannel.send(JSON.stringify({
//     type: "file-info",
//     name: file.name,
//     fileType: file.type
// }))

// // phir actual file
// reader.onload = () => {
//     callState.dataChannel.send(reader.result);
//     console.log("readerArrayBuffer: ",reader.result);
// }

// }




// export const onFileRecived = (callback)=>{
// onFileCallback = callback;
// }




























// =====================================================
// 💬 CHAT MANAGER
// =====================================================
// Responsible for all peer-to-peer communication
// via WebRTC Data Channel.
//
// ✅ Handles: text messages, typing indicator, file sharing
// ❌ No socket events here
// ❌ No UI manipulation here
// =====================================================

import callState from "./state.js";


// ─── Callbacks ────────────────────────────────────
// Stored here and called when events are received
let onMessageCallback = null;
let onTypingCallback = null;
let onFileCallback = null;

// Stores file metadata before receiving ArrayBuffer
let pendingFileInfo = null;


// ─── Handle Incoming Data ─────────────────────────
// Single entry point for all incoming data channel messages
// Handles: text messages, typing indicator, file info, file data
export function handleIncomingMessage(event) {
    if (!event || !event.data) return;

    // STEP 1: Check if incoming data is a file (ArrayBuffer)
    if (event.data instanceof ArrayBuffer) {
        if (!pendingFileInfo) {
            console.error("handleIncomingMessage: file info not received before file data");
            return;
        }
        const blob = new Blob([event.data], { type: pendingFileInfo.fileType });
        const url = URL.createObjectURL(blob);
        if (onFileCallback) onFileCallback({ url, name: pendingFileInfo.name });
        pendingFileInfo = null;
        return;
    }

    // STEP 2: Parse JSON data
    const data = JSON.parse(event.data);

    // STEP 3: Handle file metadata
    if (data.type === "file-info") {
        pendingFileInfo = data;
        return;
    }

    // STEP 4: Handle typing indicator
    if (data.type === "typing") {
        if (onTypingCallback) onTypingCallback(data.isTyping);
        return;
    }

    // STEP 5: Handle text message
    if (onMessageCallback) onMessageCallback(data);
}


// ─── Create Data Channel ──────────────────────────
// Called by caller only — before offer creation
// Callee receives channel via ondatachannel in peerManager
export const createChatChannel = () => {
    const channel = callState.peerConnectionObj.createDataChannel("chat");
    callState.dataChannel = channel;
    callState.dataChannel.binaryType = "arraybuffer";
    callState.dataChannel.onmessage = handleIncomingMessage;
    console.log("Data channel created:", channel);
};


// ─── Send Text Message ────────────────────────────
// Sends message object as JSON string via data channel
export const sendMessage = (data) => {
    if (!callState.dataChannel) {
        console.error("sendMessage: data channel not found");
        return;
    }

    if (callState.dataChannel.readyState !== "open") {
        console.error("sendMessage: data channel not open");
        return;
    }

    callState.dataChannel.send(JSON.stringify(data));
    console.log("Message sent:", data);
};


// ─── Send Typing Indicator ────────────────────────
// Notifies remote peer when local user is typing
export const sendTyping = (isTyping) => {
    if (!callState.dataChannel || callState.dataChannel.readyState !== "open") {
        return;
    }

    callState.dataChannel.send(JSON.stringify({
        type: "typing",
        isTyping,
    }));
};


// ─── Send File ────────────────────────────────────
// Sends file metadata first, then raw ArrayBuffer
// Receiver uses metadata to reconstruct the file
export const sendFile = (file) => {
    if (!callState.dataChannel || callState.dataChannel.readyState !== "open") {
        console.error("sendFile: data channel not open");
        return;
    }

    // STEP 1: Send file metadata first
    callState.dataChannel.send(JSON.stringify({
        type: "file-info",
        name: file.name,
        fileType: file.type,
    }));

    // STEP 2: Read and send raw file data
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
        callState.dataChannel.send(reader.result);
        console.log("File sent:", file.name);
    };
};


// ─── Register Callbacks ───────────────────────────
// Called from index.js to connect UI layer with data channel

// Register callback for incoming text messages
export const onMessageReceived = (callback) => {
    onMessageCallback = callback;
};

// Register callback for typing indicator
export const onTypingReceived = (callback) => {
    onTypingCallback = callback;
};

// Register callback for incoming files
export const onFileRecived = (callback) => {
    onFileCallback = callback;
};