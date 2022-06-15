import { Socket } from "socket.io";
import { Character } from "./character";
import { Event } from "./event";

const players = new Map<String, String>(); // TODO: refactor to singleton in other files

function onPlayerJoined(socket: Socket) {
  let character: Character;
  if (players.has(Character.X)) {
    character = Character.O;
  } else {
    character = Character.X;
  }
  players.set(character, socket.id);
  console.log(Event.PLAYER_JOINED + " to game with character " + character);

  socket.emit(Event.PLAYER_JOINED, { socketId: socket.id, character });

  if (players.size === 2) {
    socket.emit(Event.GAME_STARTED);
  }
}

export default function handle(socket: Socket) {
  socket.on(Event.PLAYER_JOINED, () => onPlayerJoined(socket));
}
