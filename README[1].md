# Jujutsu Brawl Online

This package includes the game files plus a Node WebSocket server for online multiplayer.

## Run locally

1. Install Node.js.
2. Open this folder in a terminal.
3. Run:

```bash
npm install
npm start
```

4. Open:

```text
http://localhost:8080
```

## Online multiplayer

Use the Online Battle section on the main menu.

- Player 1 presses **Host Battle**.
- Player 2 enters the same battle code and presses **Join Battle**.
- Both players pick a character.
- Both players press Ready.

## Make a public link

Upload this folder to a Node host like Render, Railway, Replit, Fly.io, or Glitch.

The server already supports:
- static game hosting
- `/ws` WebSocket rooms
- host/join roles
- room-code based online play

## Files included

- `index.html`
- `styles.css`
- `game.js`
- `server.js`
- `package.json`
- uploaded music/sound assets in `assets/`
