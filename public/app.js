// // ============================================================
// //  app.js — MASTER CONTROLLER
// //  Sirf UI logic hai yahan.
// //  WebRTC / Socket logic NAHI hai.
// //  Bas niche "🔌 CONNECT" wali jagah pe apna logic lagao.
// // ============================================================


// // ============================================================
// // 1️⃣  APNE MODULES YAHAN IMPORT KARO
// // ============================================================
// // Example:
// // import { getSocket }            from "./socket/socket.js";
// // import { initWebRTC }           from "./webrtc/index.js";
// // import { setupNegotiation }     from "./webrtc/negotiationManager.js";
// // import { setupSignaling }       from "./webrtc/signalingManager.js";
// // import { startLocalMedia }      from "./webrtc/mediaManager.js";
// // import { state }                from "./webrtc/state.js";
// // import { initChat }             from "./chat/index.js";
// // import { sendMessage }          from "./chat/chatManager.js";
// console.log("app.js loaded");
// import { initSocket } from "./socket/socket.js";
// import { startWebRTC } from "./webrtc/index.js";
// import { socket } from "./socket/socket.js";
// import { calling ,callEnd,toggleScreenShare ,
//      isRemoteScreenSharing, isLocalScreenSharing,
//     toggleAudio, toggleVideo, setupChat, setupTyping , getFile } from "./webrtc/index.js";
// import { sendMessage,sendTyping, sendFile } from "./webrtc/chatManager.js"; 

// // ============================================================
// // 2️⃣  DOM ELEMENTS  (HTML se connected — mat chhedo)
// // ============================================================
// const loginScreen       = document.getElementById('login-screen');
// const mainApp           = document.getElementById('main-app');
// const usernameInput     = document.getElementById('username-input');
// const joinBtn           = document.getElementById('join-btn');
// const navStatus         = document.getElementById('nav-status');

// const onlineBtn         = document.getElementById('online-btn');
// const onlineMenu        = document.getElementById('online-menu');
// const onlineCountText   = document.getElementById('online-count-text');

// const btnMic            = document.getElementById('btn-mic');
// const btnVideo          = document.getElementById('btn-video');
// const btnChat           = document.getElementById('btn-chat');
// const btnEnd            = document.getElementById('btn-end');
// const btnScreen         = document.getElementById('btn-screen');

// const chatPanel         = document.getElementById('chat-panel');
// const closeChatBtn      = document.getElementById('close-chat');
// const chatInputField    = document.getElementById('chat-input-field');
// const btnSend           = document.getElementById('btn-send');
// const chatMessages      = document.getElementById('chat-messages');
// const fileInput         = document.getElementById("fileInput");

// const videoPlaceholder      = document.getElementById('video-placeholder');
// const localVideoContainer   = document.getElementById('local-video-container');
// const localLabel            = document.getElementById('local-label');

// // 🎥 Video elements — inpe srcObject lagao
// export const remoteVideo = document.getElementById('remote-video-element');
// export const localVideo  = document.getElementById('local-video-element');


// // ============================================================
// // 3️⃣  LOGIN
// // ============================================================
// async function handleLogin() {
//     const username = usernameInput.value.trim();

//     if (username.length < 3) {
//         usernameInput.style.borderColor = 'var(--danger)';
//         alert("Please write altleast 3 characters.");
//         usernameInput.focus();
//         return;
//     }

//     usernameInput.style.borderColor = 'var(--border-color)';

//     try {

//         // 🔌 CONNECT: Apna startup logic yahan likho
//         // -----------------------------------------------
//         // await startLocalMedia();   // camera/mic lena
//         // initSocket(username);      // socket connect karna
//         // initWebRTC();              // peer banana
//         // initChat();                // chat setup
//         // -----------------------------------------------

//        if(!username){
//         console.error("did not get username from form");
//         return;
//        }
//        //socket initialization
//        initSocket(username,{updateOnlineUsers});
//        startWebRTC(socket,{
//         onRemoteStream:setRemoteStream,
//         onLocalStream:setLocalStream
//        });

         

//       //Handling Disconnection
   


//         // UI switch to Main Screen after login
//         navStatus.innerHTML = `You: <span>${username}</span>`;
//         loginScreen.classList.remove('active');
//         setTimeout(() => mainApp.classList.add('active'), 300);

//     } catch (err) {
//         console.error("handleLogin:", err);
//         // alert("Camera/Mic permission nahi mili. Please allow karo.");
//     }
// }


// // ============================================================
// // 4️⃣  ONLINE USERS LIST
// // ============================================================

// // Ye function call karo jab server users bheje
// // e.g., socket.on("users-list", (users) => updateOnlineUsers(users, myUsername))

// export function updateOnlineUsers(allUsers, myUsername) {
//     const others = Object.entries(allUsers)
//         .filter(([, user]) => user.username !== myUsername);

//     onlineCountText.textContent = `Online (${others.length})`;
//     onlineMenu.innerHTML = '';

//     if (others.length === 0) {
//         onlineMenu.innerHTML = `
//             <div style="color:var(--text-muted);padding:12px;text-align:center;font-size:14px;">
//                 Koi online nahi hai
//             </div>`;
//         return;
//     }

//     others.forEach(([socketId, user]) => {
//         const item = document.createElement('div');
//         item.className = 'user-item';
//         item.innerHTML = `
//             <div class="user-info">
//                 <div class="avatar">${user.username.charAt(0).toUpperCase()}</div>
//                 <span>${user.username}</span>
//             </div>
//             <button class="call-btn" data-socket-id="${socketId}" data-username="${user.username}">
//                 Call
//             </button>`;

//         item.querySelector('.call-btn').addEventListener('click', (e) => {
//             e.stopPropagation();
//             const targetSocketId = e.currentTarget.dataset.socketId;
//             const targetUsername  = e.currentTarget.dataset.username;

//             // 🔌 CONNECT: Call shuru karne ka logic yahan
//             // -----------------------------------------------
//             // startOutgoingCall({ socketId: targetSocketId, username: targetUsername });
//             // -----------------------------------------------
              
                
//             console.log("Calling:", targetUsername, targetSocketId);
//             calling(targetSocketId);
//             onlineMenu.classList.remove('open');
//         });

//         onlineMenu.appendChild(item);
//     });
// }


// // ============================================================
// // 5️⃣  CALL CONTROLS
// // ============================================================

// // Mic
// btnMic.addEventListener('click', () => {
//     btnMic.classList.toggle('off');
//     const isMuted = btnMic.classList.contains('off');
//      toggleAudio();
//     // 🔌 CONNECT: Audio track band/chalu karo
//     // -----------------------------------------------
//     // state.localStream?.getAudioTracks().forEach(t => t.enabled = !isMuted);
//     // -----------------------------------------------
// });

// // Video
// btnVideo.addEventListener('click', () => {
//     btnVideo.classList.toggle('off');
//     const isVideoOff = btnVideo.classList.contains('off');
//     localVideoContainer.classList.toggle('video-off', isVideoOff);
//     localLabel.style.display = isVideoOff ? 'none' : 'block';

//     toggleVideo();
//     // 🔌 CONNECT: Video track band/chalu karo
//     // -----------------------------------------------
//     // state.localStream?.getVideoTracks().forEach(t => t.enabled = !isVideoOff);
//     // -----------------------------------------------
// });


// // Screen Share
// btnScreen.addEventListener('click', async () => {

//     try {

//         await toggleScreenShare({
//             onLocalStream: setLocalStream
//         });

       
     

//     } catch (err) {
//         console.error("Screen share failed or cancelled:", err);
//     }
// });




// // End Call
// btnEnd.addEventListener('click', () => {

//     // 🔌 CONNECT: Call khatam karne ka logic
//     // -----------------------------------------------
//     // callEnd();
//     // -----------------------------------------------
//      callEnd();
//     setUI_CallEnded();
// });


// // ============================================================
// // 6️⃣  CHAT
// // ============================================================

// // function handleSendMessage() {
// //     const text = chatInputField.value.trim();
// //     if (!text) return;

// //     appendChatMessage(text, 'sent');
// //     chatInputField.value = '';

// //     // 🔌 CONNECT: Message server ko bhejo
// //     // -----------------------------------------------
// //     sendMessage(text);
// //     // -----------------------------------------------
// // }



// function handleSendMessage() {
//     const text = chatInputField.value.trim();
//     if (!text) return;

//     const data = { text, time: new Date().toLocaleTimeString() }

//     appendChatMessage(data, 'sent');
//     chatInputField.value = '';
//     sendMessage(data);

//     // typing band karo 
//     clearTimeout(typingTimer)
//     sendTyping(false)
// }




// // export function appendChatMessage(data, type) {
// //     const div = document.createElement('div');
// //     if (type === 'system') {
// //         div.style.cssText = 'align-self:center;font-size:12px;color:var(--text-muted);';
// //         div.textContent = data.text;
// //     } else {
// //         div.className = `msg ${type}`;
// //         div.innerHTML = `
// //     <span class="msg-text">${data.text}</span>
// //     <span class="msg-time">${data.time}</span>
// // `
// //     }
// //     chatMessages.appendChild(div);
// //     chatMessages.scrollTop = chatMessages.scrollHeight;
// // }



// export function appendChatMessage(data, type) {
//     const div = document.createElement('div');
//     if(type === 'system') {
//         div.style.cssText = 'align-self:center;font-size:12px;color:var(--text-muted);'
//         div.textContent = data.text
//     } else {
//         div.className = `msg ${type}`
        
//         // file hai ya text?
//         if(data.fileUrl) {
//             div.innerHTML = `
//                 <a href="${data.fileUrl}" download="file" style="color:inherit">
//                     📎 File — Download karo
//                 </a>
//                 <span class="msg-time">${data.time}</span>
//             `
//         } else {
//             div.innerHTML = `
//                 <span class="msg-text">${data.text}</span>
//                 <span class="msg-time">${data.time}</span>
//             `
//         }
//     }
//     chatMessages.appendChild(div)
//     chatMessages.scrollTop = chatMessages.scrollHeight
// }

// //Calling function to append incomming messaages
// setupChat(appendChatMessage);


// let typingTimer = null

// chatInputField.addEventListener('input', () => {
//     sendTyping(true)

//     clearTimeout(typingTimer)
//     typingTimer = setTimeout(() => {
//         sendTyping(false)
//     }, 1000)
// })

// //show typing if setupTyping is hitting.
// setupTyping((isTyping) => {
//     console.log("isTyping: ",isTyping);
//     if(isTyping) {
//         typingIndicator.style.display = 'flex'
//     } else {
//         typingIndicator.style.display = 'none'
//     }
// })


// //Function to sendFile function
// // fileInput.addEventListener('change', () => {
// //     const file = fileInput.files[0]
// //     if(!file) return
    
// //     sendFile(file)
    
// //     // showing sent File
// //     appendChatMessage({
// //         text: file.name,
// //         time: new Date().toLocaleTimeString(),
// //         fileUrl: URL.createObjectURL(file)
// //     }, 'sent')
// // })

// //Function to revie file 
// getFile((arrayBuffer) => {
//     // 1. ArrayBuffer → Blob banao
//     const blob = new Blob([arrayBuffer])

//     // 2. Blob ka URL banao — browser memory mein
//     const url = URL.createObjectURL(blob)

//     // 3. UI mein dikhao — download link
//     appendChatMessage({
//         text: 'File received',
//         time: new Date().toLocaleTimeString(),
//         fileUrl: url
//     }, 'received')
// })


// function toggleChat() {
//     chatPanel.classList.toggle('open');
//     btnChat.classList.toggle('active');
// }


// // ============================================================
// // 7️⃣  UI STATE HELPERS — baaki files se inhe call karo
// // ============================================================

// // Call karo jab local stream ready ho
// export function setLocalStream(stream) {
//     // console.log("setLocaslstrema is called");
//     localVideo.srcObject = stream;
// }

// // Call karo jab remote stream aaye (ontrack event mein)
// export function setRemoteStream(stream) {
//     const isRemoetShraing = isRemoteScreenSharing();
//     console.log("remoteScreen shring:",isRemoetShraing);

//     remoteVideo.srcObject = stream;
//     videoPlaceholder.style.display = 'none';
//     // console.log("remoteStream added in setRemoteStream function",stream);
//     // console.log("remoteTracks",stream.getTracks());
// }

// // Call karo jab WebRTC connect ho jaaye
// export function setUI_CallConnected(peerUsername) {
//     navStatus.innerHTML = `Connected to <span style="color:var(--success)">${peerUsername}</span>`;
//     videoPlaceholder.style.display = 'none';
// }

// // Call karo jab call khatam ho
// export function setUI_CallEnded() {
//     navStatus.innerHTML = '';
//     videoPlaceholder.style.display = 'flex';
//     remoteVideo.srcObject = null;
//     btnMic.classList.remove('off');
//     btnVideo.classList.remove('off');
//     localVideoContainer.classList.remove('video-off');
//     localLabel.style.display = 'block';
// }


// // ============================================================
// // 8️⃣  REMAINING EVENT LISTENERS
// // ============================================================

// // Login
// joinBtn.addEventListener('click', handleLogin);
// usernameInput.addEventListener('keypress', (e) => {
//     usernameInput.style.borderColor = 'var(--border-color)';
//     if (e.key === 'Enter') handleLogin();
// });

// // Dropdown
// onlineBtn.addEventListener('click', (e) => {
//     e.stopPropagation();
//     onlineMenu.classList.toggle('open');
// });
// document.addEventListener('click', (e) => {
//     if (!onlineMenu.contains(e.target)) onlineMenu.classList.remove('open');
// });

// // Chat
// btnChat.addEventListener('click', toggleChat);
// closeChatBtn.addEventListener('click', toggleChat);
// btnSend.addEventListener('click', handleSendMessage);
// chatInputField.addEventListener('keypress', (e) => {
//     if (e.key === 'Enter') handleSendMessage();
// });

// // Page close/reload
// window.addEventListener('beforeunload', () => {

//     // 🔌 CONNECT: Cleanup on page close
//     // -----------------------------------------------
//     // callEnd();
//     // state.socket?.disconnect();
//     // -----------------------------------------------

// });









































































// =====================================================
// 🧩 APP.JS — MASTER CONTROLLER
// =====================================================
// Only UI logic lives here.
// No WebRTC / Socket logic here.
// Use "🔌 CONNECT" sections to plug in your logic.
// =====================================================


// =====================================================
// 1️⃣  IMPORTS
// =====================================================
console.log("app.js loaded");

import { initSocket, socket }                         from "./socket/socket.js";
import { startWebRTC, calling, callEnd,
         toggleScreenShare, isRemoteScreenSharing,
         isLocalScreenSharing, toggleAudio,
         toggleVideo, setupChat,
         setupTyping, getFile }                       from "./webrtc/index.js";
import { sendMessage, sendTyping, sendFile }          from "./webrtc/chatManager.js";


// =====================================================
// 2️⃣  DOM ELEMENTS
// =====================================================

// ─── Screens ──────────────────────────────────────
const loginScreen           = document.getElementById('login-screen');
const mainApp               = document.getElementById('main-app');

// ─── Login ────────────────────────────────────────
const usernameInput         = document.getElementById('username-input');
const joinBtn               = document.getElementById('join-btn');
const navStatus             = document.getElementById('nav-status');

// ─── Online Users ─────────────────────────────────
const onlineBtn             = document.getElementById('online-btn');
const onlineMenu            = document.getElementById('online-menu');
const onlineCountText       = document.getElementById('online-count-text');

// ─── Call Controls ────────────────────────────────
const btnMic                = document.getElementById('btn-mic');
const btnVideo              = document.getElementById('btn-video');
const btnChat               = document.getElementById('btn-chat');
const btnEnd                = document.getElementById('btn-end');
const btnScreen             = document.getElementById('btn-screen');

// ─── Chat ─────────────────────────────────────────
const chatPanel             = document.getElementById('chat-panel');
const closeChatBtn          = document.getElementById('close-chat');
const chatInputField        = document.getElementById('chat-input-field');
const btnSend               = document.getElementById('btn-send');
const chatMessages          = document.getElementById('chat-messages');
const typingIndicator       = document.getElementById('typingIndicator');
const fileInput             = document.getElementById('fileInput');

// ─── Video ────────────────────────────────────────
const videoPlaceholder      = document.getElementById('video-placeholder');
const localVideoContainer   = document.getElementById('local-video-container');
const localLabel            = document.getElementById('local-label');

export const remoteVideo    = document.getElementById('remote-video-element');
export const localVideo     = document.getElementById('local-video-element');


// =====================================================
// 3️⃣  LOGIN
// =====================================================
async function handleLogin() {
    const username = usernameInput.value.trim();

    if (username.length < 3) {
        usernameInput.style.borderColor = 'var(--danger)';
        alert("Please write at least 3 characters.");
        usernameInput.focus();
        return;
    }

    usernameInput.style.borderColor = 'var(--border-color)';

    try {
        // 🔌 CONNECT: App startup — socket + WebRTC initialize
        // -----------------------------------------------
        initSocket(username, { updateOnlineUsers });
        startWebRTC(socket, {
            onRemoteStream: setRemoteStream,
            onLocalStream: setLocalStream,
        });
        // -----------------------------------------------

        // Switch to main app screen
        navStatus.innerHTML = `You: <span>${username}</span>`;
        loginScreen.classList.remove('active');
        setTimeout(() => mainApp.classList.add('active'), 300);

    } catch (err) {
        console.error("handleLogin error:", err);
    }
}


// =====================================================
// 4️⃣  ONLINE USERS
// =====================================================

// Called when server sends updated users list
export function updateOnlineUsers(allUsers, myUsername) {
    const others = Object.entries(allUsers)
        .filter(([, user]) => user.username !== myUsername);

    onlineCountText.textContent = `Online (${others.length})`;
    onlineMenu.innerHTML = '';

    if (others.length === 0) {
        onlineMenu.innerHTML = `
            <div style="color:var(--text-muted);padding:12px;text-align:center;font-size:14px;">
                No one is online
            </div>`;
        return;
    }

    others.forEach(([socketId, user]) => {
        const item = document.createElement('div');
        item.className = 'user-item';
        item.innerHTML = `
            <div class="user-info">
                <div class="avatar">${user.username.charAt(0).toUpperCase()}</div>
                <span>${user.username}</span>
            </div>
            <button class="call-btn" data-socket-id="${socketId}" data-username="${user.username}">
                Call
            </button>`;

        item.querySelector('.call-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const targetSocketId = e.currentTarget.dataset.socketId;
            const targetUsername  = e.currentTarget.dataset.username;

            // 🔌 CONNECT: Initiate call to selected user
            // -----------------------------------------------
            calling(targetSocketId);
            // -----------------------------------------------

            console.log("Calling:", targetUsername, targetSocketId);
            onlineMenu.classList.remove('open');
        });

        onlineMenu.appendChild(item);
    });
}


// =====================================================
// 5️⃣  CALL CONTROLS
// =====================================================

// Mic toggle
btnMic.addEventListener('click', () => {
    btnMic.classList.toggle('off');

    // 🔌 CONNECT: Toggle microphone
    // -----------------------------------------------
    toggleAudio();
    // -----------------------------------------------
});

// Video toggle
btnVideo.addEventListener('click', () => {
    btnVideo.classList.toggle('off');
    const isVideoOff = btnVideo.classList.contains('off');
    localVideoContainer.classList.toggle('video-off', isVideoOff);
    localLabel.style.display = isVideoOff ? 'none' : 'block';

    // 🔌 CONNECT: Toggle camera
    // -----------------------------------------------
    toggleVideo();
    // -----------------------------------------------
});

// Screen share toggle
btnScreen.addEventListener('click', async () => {
    try {
        // 🔌 CONNECT: Toggle screen share
        // -----------------------------------------------
        await toggleScreenShare({ onLocalStream: setLocalStream });
        // -----------------------------------------------
    } catch (err) {
        console.error("Screen share error:", err);
    }
});

// End call
btnEnd.addEventListener('click', () => {
    // 🔌 CONNECT: End current call
    // -----------------------------------------------
    callEnd();
    // -----------------------------------------------
    setUI_CallEnded();
});


// =====================================================
// 6️⃣  CHAT
// =====================================================

// Send text message
function handleSendMessage() {
    const text = chatInputField.value.trim();
    if (!text) return;

    const data = {
        text,
        time: new Date().toLocaleTimeString(),
    };

    appendChatMessage(data, 'sent');
    chatInputField.value = '';

    // 🔌 CONNECT: Send message via data channel
    // -----------------------------------------------
    sendMessage(data);
    // -----------------------------------------------

    // Stop typing indicator on send
    clearTimeout(typingTimer);
    sendTyping(false);
}

// Append message to chat UI
export function appendChatMessage(data, type) {
    const div = document.createElement('div');

    if (type === 'system') {
        div.style.cssText = 'align-self:center;font-size:12px;color:var(--text-muted);';
        div.textContent = data.text;
    } else {
        div.className = `msg ${type}`;

        // File message or text message?
        if (data.fileUrl) {
            div.innerHTML = `
                <a href="${data.fileUrl}" download="${data.fileName || 'file'}" style="color:inherit">
                    📎 ${data.fileName || 'File'} — Download
                </a>
                <span class="msg-time">${data.time}</span>
            `;
        } else {
            div.innerHTML = `
                <span class="msg-text">${data.text}</span>
                <span class="msg-time">${data.time}</span>
            `;
        }
    }

    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Register incoming message callback
setupChat(appendChatMessage);

// Typing indicator — debounced
let typingTimer = null;

chatInputField.addEventListener('input', () => {
    // 🔌 CONNECT: Notify remote peer that user is typing
    // -----------------------------------------------
    sendTyping(true);
    // -----------------------------------------------

    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        sendTyping(false);
    }, 1000);
});

// Show/hide typing indicator
setupTyping((isTyping) => {
    typingIndicator.style.display = isTyping ? 'flex' : 'none';
});

// Handle incoming file
getFile(({ url, name }) => {
    // 🔌 CONNECT: Show received file in chat
    // -----------------------------------------------
    appendChatMessage({
        fileUrl: url,
        fileName: name,
        time: new Date().toLocaleTimeString(),
    }, 'received');
    // -----------------------------------------------
});

// Handle file selection for sending
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    // 🔌 CONNECT: Send file via data channel
    // -----------------------------------------------
    sendFile(file);
    // -----------------------------------------------

    // Show sent file in chat
    appendChatMessage({
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        time: new Date().toLocaleTimeString(),
    }, 'sent');

    // Reset file input
    fileInput.value = '';
});

// Toggle chat panel
function toggleChat() {
    chatPanel.classList.toggle('open');
    btnChat.classList.toggle('active');
}


// =====================================================
// 7️⃣  UI STATE HELPERS
// =====================================================

// Called when local stream is ready
export function setLocalStream(stream) {
    localVideo.srcObject = stream;
}

// Called when remote stream arrives
export function setRemoteStream(stream) {
    console.log("Remote screen sharing:", isRemoteScreenSharing());
    remoteVideo.srcObject = stream;
    videoPlaceholder.style.display = 'none';
}

// Called when call is connected
export function setUI_CallConnected(peerUsername) {
    navStatus.innerHTML = `Connected to <span style="color:var(--success)">${peerUsername}</span>`;
    videoPlaceholder.style.display = 'none';
}

// Called when call ends
export function setUI_CallEnded() {
    navStatus.innerHTML = '';
    videoPlaceholder.style.display = 'flex';
    remoteVideo.srcObject = null;
    btnMic.classList.remove('off');
    btnVideo.classList.remove('off');
    localVideoContainer.classList.remove('video-off');
    localLabel.style.display = 'block';
}


// =====================================================
// 8️⃣  EVENT LISTENERS
// =====================================================

// Login
joinBtn.addEventListener('click', handleLogin);
usernameInput.addEventListener('keypress', (e) => {
    usernameInput.style.borderColor = 'var(--border-color)';
    if (e.key === 'Enter') handleLogin();
});

// Online users dropdown
onlineBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onlineMenu.classList.toggle('open');
});
document.addEventListener('click', (e) => {
    if (!onlineMenu.contains(e.target)) onlineMenu.classList.remove('open');
});

// Chat
btnChat.addEventListener('click', toggleChat);
closeChatBtn.addEventListener('click', toggleChat);
btnSend.addEventListener('click', handleSendMessage);
chatInputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});

// Cleanup on page close
window.addEventListener('beforeunload', () => {
    // 🔌 CONNECT: Cleanup on page close
    // -----------------------------------------------
    // callEnd();
    // socket?.disconnect();
    // -----------------------------------------------
});