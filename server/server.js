const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const rooms = {};
const roomWords = {};
const roomRounds = {};
const roomTimers = {};
const roomIntervals = {};
const roomRoundTimeouts = {};

const words = [
  "apple",
  "car",
  "house",
  "tree",
  "cat",
  "dog",
  "sun",
  "flower",
  "book",
  "phone",
];

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
  origin: "https://sketch-guess-client.onrender.com",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Sketch Guess server is running!");
});

// Start a round
function startRound(roomCode, drawerIndex) {
  if (!rooms[roomCode] || rooms[roomCode].length < 2) {
    return;
  }

  const players = rooms[roomCode];

  const drawer = players[drawerIndex % players.length];

  const word =
    words[Math.floor(Math.random() * words.length)];

  roomWords[roomCode] = word;

  // Stop any old timer
  if (roomIntervals[roomCode]) {
    clearInterval(roomIntervals[roomCode]);
    delete roomIntervals[roomCode];
  }

  roomTimers[roomCode] = 60;

  io.to(roomCode).emit("timer-update", 60);

  roomIntervals[roomCode] = setInterval(() => {
    roomTimers[roomCode] -= 1;

    io.to(roomCode).emit(
      "timer-update",
      roomTimers[roomCode]
    );

    // Time is up
    if (roomTimers[roomCode] <= 0) {
      clearInterval(roomIntervals[roomCode]);
      delete roomIntervals[roomCode];
  
      // Tell everyone the round is over
      io.to(roomCode).emit("time-up", {
        word,
      });

      // Start next round after 2 seconds
      roomRoundTimeouts[roomCode] = setTimeout(() => {
        if (
          !rooms[roomCode] ||
          rooms[roomCode].length < 2
        ) {
          return;
        }

        roomRounds[roomCode] += 1;

        const nextDrawerIndex =
          (roomRounds[roomCode] - 1) %
          rooms[roomCode].length;

        startRound(
          roomCode,
          nextDrawerIndex
        );
      }, 2000);
    }
  }, 1000);

  io.to(roomCode).emit("game-started", {
    drawerId: drawer.id,
    drawerName: drawer.name,
    round: roomRounds[roomCode],
  });

  // Only the drawer receives the secret word
  io.to(drawer.id).emit(
    "word-assigned",
    word
  );
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Start game
  socket.on("start-game", (roomCode) => {
    if (
      !rooms[roomCode] ||
      rooms[roomCode].length < 2
    ) {
      return;
    }

    roomRounds[roomCode] = 1;

    const randomDrawerIndex =
      Math.floor(
        Math.random() * rooms[roomCode].length
      );

    startRound(
      roomCode,
      randomDrawerIndex
    );
  });

  // Submit a guess
  socket.on(
    "submit-guess",
    ({ roomCode, guess }) => {
      console.log(
        `Guess in room ${roomCode}: ${guess}`
      );

      const correctWord =
        roomWords[roomCode];

      if (!correctWord) {
        console.log(
          "No word found for this room."
        );
        return;
      }

      if (
        guess.toLowerCase() ===
        correctWord.toLowerCase()
      ) {
        console.log("Correct guess!");

        const player =
          rooms[roomCode].find(
            (player) =>
              player.id === socket.id
          );

        if (player) {
          player.score += 1;
        }

        io.to(roomCode).emit(
          "correct-guess",
          {
            playerName: player
              ? player.name
              : "Someone",
          }
        );

        io.to(roomCode).emit(
          "room-players",
          rooms[roomCode]
        );

        // Stop current timer
        if (roomIntervals[roomCode]) {
          clearInterval(
            roomIntervals[roomCode]
          );

          delete roomIntervals[roomCode];
        }

        // Start next round after 2 seconds
        roomRoundTimeouts[roomCode] =
          setTimeout(() => {
            if (
              !rooms[roomCode] ||
              rooms[roomCode].length < 2
            ) {
              return;
            }

            roomRounds[roomCode] += 1;

            const nextDrawerIndex =
              (roomRounds[roomCode] - 1) %
              rooms[roomCode].length;

            startRound(
              roomCode,
              nextDrawerIndex
            );
          }, 2000);
      }
    }
  );

  // Create room
  socket.on(
    "create-room",
    ({ roomCode, playerName }) => {
      socket.join(roomCode);

      rooms[roomCode] = [
        {
          id: socket.id,
          name: playerName,
          score: 0,
        },
      ];

      console.log(
        `${playerName} created room: ${roomCode}`
      );

      socket.emit(
        "room-created",
        roomCode
      );

      io.to(roomCode).emit(
        "room-players",
        rooms[roomCode]
      );
    }
  );

  // Join room
  socket.on(
    "join-room",
    ({ roomCode, playerName }) => {
      if (!rooms[roomCode]) {
        socket.emit(
          "room-error",
          "Room does not exist."
        );

        return;
      }

      socket.join(roomCode);

      rooms[roomCode].push({
        id: socket.id,
        name: playerName,
        score: 0,
      });

      console.log(
        `${playerName} joined room: ${roomCode}`
      );

      socket.emit(
        "room-joined",
        roomCode
      );

      io.to(roomCode).emit(
        "room-players",
        rooms[roomCode]
      );
    }
  );

  // Drawing start
  socket.on(
    "drawing-start",
    ({ roomCode, x, y }) => {
      socket.to(roomCode).emit(
        "drawing-start",
        {
          x,
          y,
        }
      );
    }
  );

  // Drawing
  socket.on(
    "drawing",
    ({ roomCode, x, y }) => {
      socket.to(roomCode).emit(
        "drawing",
        {
          x,
          y,
        }
      );
    }
  );

  // Clear canvas
  socket.on(
    "clear-canvas",
    (roomCode) => {
      socket.to(roomCode).emit(
        "clear-canvas"
      );
    }
  );

  // Disconnect
  socket.on("disconnect", () => {
    for (const roomCode in rooms) {
      const playerIndex =
        rooms[roomCode].findIndex(
          (player) =>
            player.id === socket.id
        );

      if (playerIndex !== -1) {
        rooms[roomCode].splice(
          playerIndex,
          1
        );

        io.to(roomCode).emit(
          "room-players",
          rooms[roomCode]
        );

        if (
          rooms[roomCode].length === 0
        ) {
          delete rooms[roomCode];

          if (roomIntervals[roomCode]) {
            clearInterval(
              roomIntervals[roomCode]
            );

            delete roomIntervals[roomCode];
          }

          if (
            roomRoundTimeouts[roomCode]
          ) {
            clearTimeout(
              roomRoundTimeouts[roomCode]
            );

            delete roomRoundTimeouts[
              roomCode
            ];
          }

          delete roomWords[roomCode];
          delete roomRounds[roomCode];
          delete roomTimers[roomCode];
        }

        break;
      }
    }

    console.log(
      "A user disconnected:",
      socket.id
    );
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});