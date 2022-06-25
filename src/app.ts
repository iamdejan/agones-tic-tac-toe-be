import { Server } from "socket.io";
import handle from "./socket";

const io = new Server({
  "transports": ["websocket"]
});

io.on("connection", (socket) => {
  console.log(`socket ${socket.id} is connected`);
  handle(socket);

  socket.on("disconnected", () => {
    console.log(`socket ${socket.id} is disconnected`);
  });
});

io.listen(4000);
