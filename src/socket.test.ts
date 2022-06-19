import { beforeEach, describe, expect, it } from 'vitest';
import { Character } from './character';
import { board, getNextCharacter, isDraw, isWinning } from './socket';

beforeEach(() => {
  for(let r = 0; r < 3; r++) {
    for(let c = 0; c < 3; c++) {
      board[r][c] = "";
    }
  }
});

describe("game ends", () => {
  it("winning vertically", () => {
    board[0][0] = Character.X;
    board[1][0] = Character.X;
    board[2][0] = Character.X;
    expect(isWinning(Character.X)).toBeTruthy();
  });

  it("winning horizontally", () => {
    board[0][0] = Character.O;
    board[0][1] = Character.O;
    board[0][2] = Character.O;
    expect(isWinning(Character.O)).toBeTruthy();
  });

  it("winning diagonally from top-left to bottom-right", () => {
    board[0][0] = Character.X;
    board[1][1] = Character.X;
    board[2][2] = Character.X;
    expect(isWinning(Character.X)).toBeTruthy();
  });

  it("winning diagonally from top-right to bottom-left", () => {
    board[0][2] = Character.O;
    board[1][1] = Character.O;
    board[2][0] = Character.O;
    expect(isWinning(Character.O)).toBeTruthy();
  });

  it("game is draw", () => {
    const referenceBoard = [
      [Character.O, Character.X, Character.O],
      [Character.X, Character.X, Character.O],
      [Character.X, Character.O, Character.X]
    ];
    for(let r = 0; r < 3; r++) {
      for(let c = 0; c < 3; c++) {
        board[r][c] = referenceBoard[r][c];
      }
    }
    expect(isDraw()).toBeTruthy();
  });

  it("game continues", () => {
    board[0][0] = Character.X;
    expect(isDraw()).toBeFalsy();
  });
});

describe("on game play", () => {
  it("next player is correct", () => {
    expect(getNextCharacter(Character.X)).toBe(Character.O);
    expect(getNextCharacter(Character.O)).toBe(Character.X);
  });
});
