import { Socket } from "socket.io";
import { Character } from "./character";
import { Event } from "./event";

const playerToCharMap = new Map<string, string>();
const charToPlayerMap = new Map<string, string>();

const board = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];

interface Point {
  row: number;
  col: number;
}

function onPlayerJoined(socket: Socket) {
  let character: Character;
  if (charToPlayerMap.has(Character.X)) {
    character = Character.O;
  } else {
    character = Character.X;
  }
  playerToCharMap.set(socket.id, character);
  charToPlayerMap.set(character, socket.id);
  console.log(Event.ON_PLAYER_JOINED + " to game with character " + character);

  socket.emit(Event.PLAYER_JOINED, { socketId: socket.id, character });

  if (playerToCharMap.size === 2) {
    socket.emit(Event.GAME_STARTED);
    socket.emit(Event.PLAYER_MOVES, {player: Character.X});
  }
}

// TODO: refactor
function isWinning(player: string): boolean {
  for(let c = 0; c < 3; c++) {
    let count = 0;
    for(let r = 0; r < 3; r++) {
      if(board[r][c] === player) {
        count++;
      }
    }
    if(count == 3) {
      return true;
    }
  }

  for(let r = 0; r < 3; r++) {
    let count = 0;
    for(let c = 0; c < 3; c++) {
      if(board[r][c] === player) {
        count++;
      }
    }
    if(count === 3) {
      return true;
    }
  }

  let count = 0;
  for(let i = 0; i < 3; i++) {
    if(board[i][i] === player) {
      count++;
    }
  }
  if(count === 3) {
    return true;
  }

  count = 0;
  for(let i = 0, j = 2; i < 3; i++, j--) {
    if(board[i][j] === player) {
      count++;
    }
  }
  if(count === 3) {
    return true;
  }

  return false;
}

function onPlayerMoves(socket: Socket, point: Point) {
  const player: string = playerToCharMap.get(socket.id)!;
  if (board[point.row][point.col] !== "") {
    socket.emit(Event.INVALID_MOVE, { player });
    return;
  }

  board[point.row][point.col] !== player;

  if(isWinning(player)) {
    socket.emit(Event.PLAYER_WINS, {player});
    return;
  }

  // draw
  let emptySlotCount = 0;
  for(let r = 0; r < 3; r++) {
    for(let c = 0; c < 3; c++) {
      if(board[r][c] === "") {
        emptySlotCount++;
      }
    }
  }
  if(emptySlotCount === 0) {
    socket.emit(Event.DRAW);
  }

  let nextPlayer: string;
  if(player == Character.X) {
    nextPlayer = Character.O;
  } else {
    nextPlayer = Character.X;
  }

  socket.emit(Event.PLAYER_MOVES, {player: nextPlayer});
}

export default function handle(socket: Socket) {
  socket.on(Event.ON_PLAYER_JOINED, () => onPlayerJoined(socket));
  socket.on(Event.ON_PLAYER_MOVES, (point: Point) => onPlayerMoves(socket, point));
}
