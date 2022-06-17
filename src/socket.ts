import { Socket } from "socket.io";
import { Character } from "./character";
import { Event } from "./event";

const playerToCharMap = new Map<string, Character>();
const charToPlayerMap = new Map<Character, string>();

const board = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];

interface Point {
  row: number;
  col: number;
}

function broadcast(socket: Socket, event: string, payload: unknown) {
  socket.emit(event, payload);
  socket.broadcast.emit(event, payload);
}

function getCharacter(): Character {
  if (charToPlayerMap.has(Character.X)) {
    return Character.O;
  }
  return Character.X;
}

function onPlayerJoined(socket: Socket) {
  let character = getCharacter();
  playerToCharMap.set(socket.id, character);
  charToPlayerMap.set(character, socket.id);
  console.log(Event.ON_PLAYER_JOINED + " to game with character " + character);

  broadcast(socket, Event.PLAYER_JOINED, { socketId: socket.id, character });

  if (playerToCharMap.size === 2) {
    broadcast(socket, Event.GAME_STARTED, {});
    broadcast(socket, Event.PLAYER_MOVES, { player: Character.X });
  }
}

function isWinningVertically(player: Character): boolean {
  for (let c = 0; c < 3; c++) {
    let count = 0;
    for (let r = 0; r < 3; r++) {
      if (board[r][c] === player) {
        count++;
      }
    }
    if (count == 3) {
      return true;
    }
  }

  return false;
}

function isWinningHorizontally(player: Character): boolean {
  for (let r = 0; r < 3; r++) {
    let count = 0;
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === player) {
        count++;
      }
    }
    if (count === 3) {
      return true;
    }
  }

  return false;
}

function isWinningDiagonally(player: Character): boolean {
  let count = 0;
  for (let i = 0; i < 3; i++) {
    if (board[i][i] === player) {
      count++;
    }
  }
  if (count === 3) {
    return true;
  }

  count = 0;
  for (let i = 0, j = 2; i < 3; i++, j--) {
    if (board[i][j] === player) {
      count++;
    }
  }
  if (count === 3) {
    return true;
  }

  return false;
}

function isWinning(player: Character): boolean {
  if (isWinningVertically(player)) {
    return true;
  }

  if (isWinningHorizontally(player)) {
    return true;
  }

  if (isWinningDiagonally(player)) {
    return true;
  }

  return false;
}

function isDraw(): boolean {
  let emptySlotCount = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === "") {
        emptySlotCount++;
      }
    }
  }

  return emptySlotCount === 0;
}

function getNextPlayer(current: Character): Character {
  if (current === Character.X) {
    return Character.O;
  }
  return Character.X;
}

function onPlayerMoves(socket: Socket, point: Point) {
  const current: Character = playerToCharMap.get(socket.id)!;
  if (board[point.row][point.col] !== "") {
    broadcast(socket, Event.INVALID_MOVE, { player: current });
    return;
  }

  board[point.row][point.col] = current;

  if (isWinning(current)) {
    broadcast(socket, Event.PLAYER_WINS, { player: current });
    return;
  }

  if (isDraw()) {
    broadcast(socket, Event.DRAW, {});
    return;
  }

  let nextPlayer = getNextPlayer(current);
  broadcast(socket, Event.PLAYER_MOVES, { player: nextPlayer });
}

export default function handle(socket: Socket) {
  socket.on(Event.ON_PLAYER_JOINED, () => onPlayerJoined(socket));
  socket.on(Event.ON_PLAYER_MOVES, (point: Point) =>
    onPlayerMoves(socket, point)
  );
}
