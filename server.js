const io = require("socket.io")(3000, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("User connected!", socket.id);

  // Listen and Emit custom events
  socket.on("foo", (msg) => {
    io.emit("bar", `${msg} from ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected!", socket.id);
  });
});
