const io = require("socket.io")(3000, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const { v4: uuidv4 } = require("uuid");

const lonelySockets = [];
const rooms = {};
const friendRooms = {};

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("create-room", (cb) => {
    try {
      const room = uuidv4();
      rooms[room] = [socket.id];
      cb(null, room);
    } catch (error) {
      cb({ error: "Room creation failed" });
    }
  });

  socket.on("join-room", (room, cb) => {
    try {
      if (!room || !rooms[room] || rooms[room].length === 2) {
        return cb({ error: "Invalid room or room is full" });
      }
      rooms[room].push(socket.id);
      const playerSocket = rooms[room][0];
      socket.to(playerSocket).emit("friend-join");
      cb(null);
    } catch (error) {
      cb({ error: "Failed to join room" });
    }
  });

  socket.on("random-room", (cb) => {
    try {
      if (lonelySockets.length === 0) {
        lonelySockets.push(socket.id);
        cb(null, true);
      } else {
        const room = uuidv4();
        const randomDude = lonelySockets.pop();
        socket.to(randomDude).emit("random-join");
        friendRooms[room] = [socket.id, randomDude];
        cb(null, false);
      }
    } catch (error) {
      cb({ error: "Failed to join random room" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    // Optionally, you could also remove the socket from any room here.
  });
});
