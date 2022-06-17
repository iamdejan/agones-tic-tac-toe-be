import { Server } from "socket.io";
import handle from "./socket";

const io = new Server({
  "transports": ["websocket"]
});

io.on("connection", (socket) => {
  handle(socket);
});

io.listen(3000);
