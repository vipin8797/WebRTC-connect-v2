

// //Requiring Dependencies
// import express from "express";
// import path from "path";
// import {createServer} from "node:http";
// import {Server } from "socket.io";
// import {fileURLToPath} from "url";






// //Using Dependencies
// const app = express();
// const server = createServer(app);
// const io = new Server(server);
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);




// //Middlewares
// app.use(express.urlencoded({extended:true}));
// app.use(express.static(path.join(__dirname,"/public")));




// //Routes********************;
// app.get("/",(req,res)=>{
//    res.sendFile("index.html");
// })

// let allUsers = {};


// io.on("connection",(socket)=>{
//     console.log("connected:",socket.id);
//     console.log("allUsers:",allUsers);

// //new user joined
// socket.on("user-joined",(username)=>{
//   allUsers[socket.id] = {username:username};
//   console.log("joined:",socket.id,"username: ",username);
//   console.log("alloUsrs",allUsers);
//   io.emit("updated-users",(allUsers));
// });





// //Forwarding Offer
// socket.on("offer", ({ to, offer, from }) => {
//     console.log("offer forwarding");
//     socket.to(to).emit("offer", {
//         from,
//         offer
//     });
// });

// //Forwarding answer
// socket.on("answer", ({ to, answer }) => {
//     console.log("answer forwarding");
//    socket.to(to).emit("answer", { answer });
// });


// //ICE Forwarding
// socket.on("icecandidate", ({ to, from, candidate }) => {
//     console.log("ice forwarding starting");
//    socket.to(to).emit("icecandidate", {
//       from,
//       candidate
//    });
// });



// //Busy Forwarding
// // socket.on("busy", ({ to, from }) => {
// //     console.log("forwarding busy");

// //     socket.to(to).emit("busy", {
// //         from,
// //         message: "busy on another call"
// //     });
// // });


// socket.on('busy',({to,from})=>{
//     console.log("forwarding busy");
//     socket.to(to).emit("busy",({from:from}));
// })



// //Forwarding screen share start
//  socket.on("screen-share-start",({to})=>{
//     console.log("screen-share-start forwared");
//       socket.to(to).emit("screen-share-start");
//   });
// socket.on("screen-share-stop",({to})=>{
//      console.log("screen-share-stop forwared");
//       socket.to(to).emit("screen-share-stop");
//   });



// socket.on("disconnect",(reason)=>{
//     console.log("diconnected reson:",reason);
//     delete allUsers[socket.id];
//     console.log("diconnected:",socket.id);
//     io.emit("updated-users",(allUsers));
// })
// });








// //Server 
// server.listen(3000,()=>{
//     console.log(`listenig at ${3000}`);
// })









































// =====================================================
// 🖥️  SERVER — MAIN ENTRY POINT
// =====================================================
// Express + Socket.IO server.
// Serves static files and forwards WebRTC signals.
//
// ✅ Handles: user registration, signaling, disconnection
// ❌ No WebRTC logic here — only signal forwarding
// =====================================================


// ─── Dependencies ────────────────────────────────
import express          from "express";
import path             from "path";
import { createServer } from "node:http";
import { Server }       from "socket.io";
import { fileURLToPath } from "url";


// ─── App Setup ────────────────────────────────────
const app        = express();
const server     = createServer(app);
const io         = new Server(server);
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);


// ─── Middleware ───────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));


// ─── Routes ───────────────────────────────────────
app.get("/", (req, res) => {
    res.sendFile("index.html");
});


// ─── Online Users Store ───────────────────────────
// { socketId: { username } }
let allUsers = {};


// =====================================================
// SOCKET.IO — SIGNALING SERVER
// =====================================================
// Only forwards signals between peers.
// No peer connection logic here.
// =====================================================

io.on("connection", (socket) => {
    console.log("Connected:", socket.id);


    // ─── User Registration ────────────────────────
    // Called when a new user joins the app
    socket.on("user-joined", (username) => {
        allUsers[socket.id] = { username };
        console.log("User joined:", username, socket.id);
        io.emit("updated-users", allUsers);
    });


    // ─── WebRTC Signal Forwarding ─────────────────
    // Server only forwards — no processing here

    // Forward offer to target peer
    socket.on("offer", ({ to, offer, from }) => {
        console.log("Forwarding offer to:", to);
        socket.to(to).emit("offer", { from, offer });
    });

    // Forward answer to caller
    socket.on("answer", ({ to, answer }) => {
        console.log("Forwarding answer to:", to);
        socket.to(to).emit("answer", { answer });
    });

    // Forward ICE candidates
    socket.on("icecandidate", ({ to, from, candidate }) => {
        console.log("Forwarding ICE candidate to:", to);
        socket.to(to).emit("icecandidate", { from, candidate });
    });


    // ─── Call State Signals ───────────────────────

    // Forward busy signal — remote peer is in a call
    socket.on("busy", ({ to, from }) => {
        console.log("Forwarding busy signal to:", to);
        socket.to(to).emit("busy", { from });
    });

    // Forward screen share state
    socket.on("screen-share-start", ({ to }) => {
        console.log("Forwarding screen-share-start to:", to);
        socket.to(to).emit("screen-share-start");
    });

    socket.on("screen-share-stop", ({ to }) => {
        console.log("Forwarding screen-share-stop to:", to);
        socket.to(to).emit("screen-share-stop");
    });


    // ─── Disconnection ────────────────────────────
    // Remove user from store and notify everyone
    socket.on("disconnect", (reason) => {
        console.log("Disconnected:", socket.id, "Reason:", reason);
        delete allUsers[socket.id];
        io.emit("updated-users", allUsers);
    });

});


// ─── Start Server ─────────────────────────────────
server.listen(3000, () => {
    console.log("Server running on port 3000");
});