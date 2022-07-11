import { Socket } from "socket.io";
import { Character } from "./character";
import { Event } from "./event";

const playerToCharMap = new Map<string, Character>();
const charToPlayerMap = new Map<Character, string>();

export const board = [
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

function broadcastPlayerTurn(socket: Socket, character: Character) {
  const player = charToPlayerMap.get(character);
  broadcast(socket, Event.PLAYER_TURN, { player, character });
}

function startGame(socket: Socket) {
  const player = charToPlayerMap.get(Character.X);
  broadcast(socket, Event.GAME_STARTED, { player, character: Character.X });
}

function getCharacter(): Character {
  if (charToPlayerMap.has(Character.X)) {
    return Character.O;
  }
  return Character.X;
}

function onPlayerJoined(socket: Socket) {
  const character = getCharacter();
  playerToCharMap.set(socket.id, character);
  charToPlayerMap.set(character, socket.id);

  broadcast(socket, Event.PLAYER_JOINED, { socketId: socket.id, character });

  if (playerToCharMap.size === 2) {
    startGame(socket);
  }
}

function isWinningVertically(character: Character): boolean {
  for (let c = 0; c < 3; c++) {
    let count = 0;
    for (let r = 0; r < 3; r++) {
      if (board[r][c] === character) {
        count++;
      }
    }
    if (count === 3) {
      return true;
    }
  }

  return false;
}

function isWinningHorizontally(character: Character): boolean {
  for (let r = 0; r < 3; r++) {
    let count = 0;
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === character) {
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

export function isWinning(current: Character): boolean {
  if (isWinningVertically(current)) {
    return true;
  }

  if (isWinningHorizontally(current)) {
    return true;
  }

  if (isWinningDiagonally(current)) {
    return true;
  }

  return false;
}

export function isDraw(): boolean {
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

export function getNextCharacter(current: Character): Character {
  if (current === Character.X) {
    return Character.O;
  }
  return Character.X;
}

function onPlayerMoves(socket: Socket, point: Point) {
  const current: Character = playerToCharMap.get(socket.id)!;
  if (board[point.row][point.col] !== "") {
    broadcast(socket, Event.INVALID_MOVE, {
      player: socket.id,
      character: current,
    });
    return;
  }

  board[point.row][point.col] = current;
  broadcast(socket, Event.MOVE_COMPLETED, {
    row: point.row,
    col: point.col,
    character: current,
  });

  if (isWinning(current)) {
    broadcast(socket, Event.PLAYER_WINS, {
      player: socket.id,
      character: current,
    });
    return;
  }

  if (isDraw()) {
    broadcast(socket, Event.DRAW, {});
    return;
  }

  const nextCharacter = getNextCharacter(current);
  broadcastPlayerTurn(socket, nextCharacter);
}

export default function handle(socket: Socket) {
  socket.on(Event.ON_PLAYER_JOINED, () => onPlayerJoined(socket));
  socket.on(Event.ON_PLAYER_MOVED, ({ row, col }: Point) =>
    onPlayerMoves(socket, { row, col })
  );
}
