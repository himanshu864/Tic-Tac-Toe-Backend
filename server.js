const io = require("socket.io")(3000, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const { v4: uuidv4 } = require("uuid");

const lonelyRooms = new Set(); // set of active rooms full of waiting strangers
const socketsMap = new Map(); // map roomID to set of socketIDs
const roomMap = new Map(); // map socketID to roomID

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("create-room", (cb) => {
    try {
      const room = uuidv4();
      socket.join(room);
      socketsMap.set(room, new Set([socket.id]));
      roomMap.set(socket.id, room);
      cb(null, room);
    } catch (error) {
      cb({ error: "Room creation failed" });
    }
  });

  socket.on("join-room", (room, cb) => {
    try {
      if (!room || !socketsMap.has(room) || socketsMap.get(room).size === 2) {
        return cb({ error: "Invalid room or room is full" });
      }
      console.log(socketsMap.get(room));
      socket.join(room);
      socketsMap.get(room).add(socket.id);
      roomMap.set(socket.id, room);
      socket.broadcast.to(room).emit("opponent-join");
      cb(null);
    } catch (error) {
      cb({ error: "Failed to join room" });
    }
  });

  socket.on("random-room", (cb) => {
    try {
      if (lonelyRooms.size === 0) {
        const room = uuidv4();
        socket.join(room);
        socketsMap.set(room, new Set([socket.id]));
        roomMap.set(socket.id, room);
        lonelyRooms.add(room);
        cb(null, true);
      } else {
        const room = lonelyRooms.values().next().value;
        lonelyRooms.delete(room);
        socket.join(room);
        socketsMap.get(room).add(socket.id);
        roomMap.set(socket.id, room);
        socket.broadcast.to(room).emit("opponent-join");
        cb(null, false);
      }
    } catch (error) {
      cb({ error: "Failed to join random room" });
    }
  });

  socket.on("betrayal", () => {
    const room = roomMap.get(socket.id);
    roomMap.delete(socket.id);
    socket.leave(room);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    if (!roomMap.has(socket.id)) return;

    const room = roomMap.get(socket.id);
    roomMap.delete(socket.id);
    socket.leave(room);

    if (lonelyRooms.has(room)) lonelyRooms.delete(room);
    if (socketsMap.has(room)) {
      if (socketsMap.get(room).size === 2)
        socket.broadcast.to(room).emit("opponent-left");
      socketsMap.delete(room);
    }
  });
});
