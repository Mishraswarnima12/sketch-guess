# Sketch Guess

Sketch Guess is a real-time multiplayer drawing and guessing game inspired by skribbl.io.

Players can create or join a room, take turns drawing a randomly selected word, and try to guess what another player is drawing.

## Live Demo

**Live Application:** https://sketch-guess-client.onrender.com

**Backend:** https://sketch-guess-server-av8r.onrender.com

**GitHub Repository:** https://github.com/Mishraswarnima12/sketch-guess

## Features

* Create a game room
* Join an existing room using a room code
* Real-time player list
* Multiplayer drawing using HTML5 Canvas
* Real-time drawing synchronization using Socket.IO
* Clear canvas for all players
* Random drawer selection
* Secret word visible only to the drawer
* Guessing system
* Correct guess notifications
* Score tracking
* 60-second round timer
* Automatic next round
* Drawer rotation
* Answer reveal when time runs out
* Responsive and simple game interface

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Socket.IO Client
* HTML5 Canvas
* CSS

### Backend

* Node.js
* Express.js
* Socket.IO

### Deployment

* Frontend: Render Static Site
* Backend: Render Web Service
* Source Control: GitHub

## Architecture Overview

The application follows a client-server architecture.

### Frontend

The React frontend handles:

* Room creation and joining
* Player interface
* Game lobby
* Canvas drawing
* Guess input
* Scoreboard
* Timer and round information

Drawing actions are captured from the HTML5 Canvas and sent to the backend through Socket.IO.

### Backend

The Node.js and Express server manages:

* Rooms and players
* Drawer selection
* Random word selection
* Game rounds
* Scores
* Timer management
* Guess validation
* Real-time game events

Socket.IO is used to communicate between the server and all connected players.

### Real-Time Drawing Flow

```text
Drawer
  |
  | Drawing events
  v
React + Canvas
  |
  | Socket.IO
  v
Node.js + Socket.IO Server
  |
  | Broadcast drawing events
  v
Other Players
  |
  v
Canvas updated in real time
```

### Game Flow

```text
Create Room
     |
     v
Join Room
     |
     v
Lobby
     |
     v
Start Game
     |
     v
Select Drawer + Word
     |
     v
60 Second Round
     |
     +------> Correct Guess
     |            |
     |            v
     |        Score Update
     |
     +------> Time Up
                  |
                  v
             Reveal Answer
                  |
                  v
             Next Round
```

## How Socket.IO Is Used

Socket.IO provides real-time communication between the frontend and backend.

Important events used by the application include:

* `create-room`
* `join-room`
* `room-players`
* `start-game`
* `game-started`
* `word-assigned`
* `drawing-start`
* `drawing`
* `clear-canvas`
* `submit-guess`
* `correct-guess`
* `timer-update`
* `time-up`

This allows all players in a room to receive game updates without continuously refreshing the page.

## Scoring

When a player submits a guess, the server compares the submitted text with the current secret word.

If the guess is correct:

1. The player's score is increased.
2. A correct-guess event is broadcast to the room.
3. The current round timer is stopped.
4. The next round starts automatically.

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/Mishraswarnima12/sketch-guess.git
cd sketch-guess
```

### 2. Start the backend

```bash
cd server
npm install
node server.js
```

The backend runs locally on:

```text
http://localhost:3000
```

### 3. Start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend runs locally on:

```text
http://localhost:5173
```

### 4. Play the game

Open the frontend in two browser tabs.

Create a room in one tab and join the same room from the second tab.

Start the game and take turns drawing and guessing.

## Project Structure

```text
sketch-guess/
│
├── client/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
│
├── server/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Deployment

The application is deployed publicly using Render.

The frontend is deployed as a Render Static Site and the backend is deployed as a Render Web Service.

The backend uses the environment-provided port so that it can run correctly on the deployment platform.

The production application has been tested for:

* Room creation
* Room joining
* Multiplayer connection
* Real-time drawing
* Guess submission
* Correct guess handling
* Score updates
* Timer synchronization
* Automatic round transitions
* Drawer rotation
* Time-up answer reveal

## Future Improvements

Possible future improvements include:

* Multiple drawing colors
* Brush size controls
* Eraser
* Undo
* Word categories
* Multiple word choices for the drawer
* Hints
* In-game chat
* Configurable room settings
* Final winner screen
* Private invite links
* Better mobile support
