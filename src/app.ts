import { Server } from "socket.io";
import handle from "./socket";

function setAsHealthy() {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({});

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch(`http://localhost:${process.env.AGONES_SDK_HTTP_PORT}/health`, requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
}

function setAsReady(): void {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({});

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch(
    `http://localhost:${process.env.AGONES_SDK_HTTP_PORT}/ready`,
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
}

const io = new Server({
  transports: ["websocket"],
});

setAsHealthy();
setAsReady();

io.on("connection", (socket) => {
  console.log(`socket ${socket.id} is connected`);
  handle(socket);

  socket.on("disconnected", () => {
    console.log(`socket ${socket.id} is disconnected`);
  });
});

io.listen(4000);
