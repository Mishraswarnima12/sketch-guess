import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("https://sketch-guess-server-av8r.onrender.com");

function App() {
  const [roomCode, setRoomCode] = useState("");
const [joinCode, setJoinCode] = useState("");
const [playerName, setPlayerName] = useState("");
const [players, setPlayers] = useState<
  { id: string; name: string; score: number }[]
>([]);
const [gameStarted, setGameStarted] = useState(false);
const [drawerName, setDrawerName] = useState("");
const [drawerId, setDrawerId] = useState("");
const [word, setWord] = useState("");
const [guess, setGuess] = useState("");
const [correctGuesser, setCorrectGuesser] = useState("");
const [round, setRound] = useState(0);
const [timeLeft, setTimeLeft] = useState(60);

 
const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const handleRoomCreated = (code: string) => {
      setRoomCode(code);
    };
  const handleGameStarted = ({
  drawerId,
  drawerName,
  round,
}: {
  drawerId: string;
  drawerName: string;
  round: number;
}) => {
  setGameStarted(true);
  setRound(round);
  setDrawerId(drawerId);
  setDrawerName(drawerName);
  
};
const handleWordAssigned = (newWord: string) => {
  setWord(newWord);
};
const handleTimerUpdate = (time: number) => {
  setTimeLeft(time);
};
const handleCorrectGuess = ({
  playerName,
}: {
  playerName: string;
}) => {
  console.log("Correct guess received:", playerName);
  setCorrectGuesser(playerName);
};
const handleTimeUp = ({
  word,
}: {
  word: string;
}) => {
 

  setCorrectGuesser("");
  setWord(word);
};
    const handleRoomJoined = (code: string) => {
      setRoomCode(code);
    };
    const handleRoomError = (message: string) => {
  alert(message);
};
const handleDrawing = ({
  x,
  y,
}: {
  x: number;
  y: number;
}) => {
  const canvas = canvasRef.current;

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.lineWidth = 4;
  context.lineCap = "round";

  context.lineTo(x, y);
  context.stroke();
};
const handleDrawingStart = ({
  x,
  y,
}: {
  x: number;
  y: number;
}) => {
  const canvas = canvasRef.current;

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.beginPath();
  context.moveTo(x, y);
};
const handleClearCanvas = () => {
  const canvas = canvasRef.current;

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
};
    socket.on("room-created", handleRoomCreated);
    socket.on("game-started", handleGameStarted);
    socket.on("word-assigned", handleWordAssigned);
    socket.on("timer-update", handleTimerUpdate);
    socket.on("correct-guess", handleCorrectGuess);
    socket.on("time-up", handleTimeUp);
    socket.on("room-joined", handleRoomJoined);
    socket.on("room-players", setPlayers);
    socket.on("room-error", handleRoomError);
    socket.on("drawing", handleDrawing);
    socket.on("drawing-start", handleDrawingStart);
    socket.on("clear-canvas", handleClearCanvas);


    return () => {
      socket.off("room-created", handleRoomCreated);
      socket.off("room-joined", handleRoomJoined);
      socket.off("room-players", setPlayers);
      socket.off("room-error", handleRoomError);
      socket.off("drawing", handleDrawing);
      socket.off("drawing-start", handleDrawingStart);
      socket.off("clear-canvas", handleClearCanvas);
      socket.off("game-started", handleGameStarted);
      socket.off("word-assigned", handleWordAssigned);
      socket.off("timer-update", handleTimerUpdate);
      socket.off("correct-guess", handleCorrectGuess);
      socket.off("time-up", handleTimeUp);
    };
  }, []);

  const createRoom = () => {
  if (!playerName.trim()) {
    return;
  }

  const code = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  socket.emit("create-room", {
    roomCode: code,
    playerName: playerName.trim(),
  });
};

  const joinRoom = () => {
  if (!playerName.trim() || !joinCode.trim()) {
    return;
  }

  socket.emit("join-room", {
    roomCode: joinCode.toUpperCase(),
    playerName: playerName.trim(),
  });
};
const isDrawing = useRef(false);

const startDrawing = (
  event: React.MouseEvent<HTMLCanvasElement>
) => {
  const canvas = canvasRef.current;

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  isDrawing.current = true;

  context.beginPath();

  context.moveTo(
    event.nativeEvent.offsetX,
    event.nativeEvent.offsetY
  );

  socket.emit("drawing-start", {
    roomCode,
    x: event.nativeEvent.offsetX,
    y: event.nativeEvent.offsetY,
  });
};
const startGame = () => {
  socket.emit("start-game", roomCode);
};
const draw = (
  event: React.MouseEvent<HTMLCanvasElement>
) => {
  if (!isDrawing.current) {
    return;
  }

  const canvas = canvasRef.current;

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.lineWidth = 4;
context.lineCap = "round";

context.lineTo(
  event.nativeEvent.offsetX,
  event.nativeEvent.offsetY
);

context.stroke();
socket.emit("drawing", {
  roomCode,
  x: event.nativeEvent.offsetX,
  y: event.nativeEvent.offsetY,
});
};

const stopDrawing = () => {
  isDrawing.current = false;
};
const clearCanvas = () => {
  const canvas = canvasRef.current;

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit("clear-canvas", roomCode);
};
const submitGuess = () => {
  if (!guess.trim()) {
    return;
  }

  socket.emit("submit-guess", {
    roomCode,
    guess: guess.trim(),
  });

  setGuess("");
};

 return (
  <div className="app">
    <div className="container">
      <h1 className="title">Sketch Guess</h1>

{!roomCode && (
  <div className="lobby-form">
    <input
      type="text"
      placeholder="Enter your name"
      value={playerName}
      onChange={(e) => setPlayerName(e.target.value)}
    />

    <button onClick={createRoom}>
      Create Room
    </button>

    <div>
      <h3>Join an existing room</h3>

      <input
        type="text"
        placeholder="Enter room code"
        value={joinCode}
        onChange={(e) => setJoinCode(e.target.value)}
      />

      <button onClick={joinRoom}>
        Join Room
      </button>
    </div>
  </div>
)}

      {roomCode && (
  <div className="card">
    <h2>Game Lobby</h2>

    <p className="room-code">
      Room Code: <strong>{roomCode}</strong>
    </p>

    <h3>Players</h3>

  <div className="player-list">
  {players.map((player) => (
    <div className="player-row" key={player.id}>
      <span>{player.name}</span>
      <span>Score: {player.score}</span>
    </div>
  ))}
</div>
    <button onClick={startGame}>
  Start Game
</button>
    <canvas
  ref={canvasRef}
  width={800}
  height={500}
  style={{
    border: "2px solid black",
    backgroundColor: "white",
  }}
  onMouseDown={startDrawing}
onMouseMove={draw}
onMouseUp={stopDrawing}
onMouseLeave={stopDrawing}
/>
<button className="clear-button" onClick={clearCanvas}>
  Clear Canvas
</button>

{gameStarted ? (
  <>
 <div className="game-info">
  <div>
    <span>Round</span>
    <strong>{round}</strong>
  </div>

  <div>
    <span>Time</span>
    <strong>{timeLeft}s</strong>
  </div>

  <div>
    <span>Drawer</span>
    <strong>{drawerName}</strong>
  </div>
</div>
    {drawerId === socket.id && word && (
  <p className="your-word">
    Your word: <strong>{word}</strong>
  </p>
)}

{timeLeft === 0 && word && (
  <p>
    Time's up! The word was: <strong>{word}</strong>
  </p>
)}

    {correctGuesser && (
      <p>{correctGuesser} guessed correctly! 🎉</p>
    )}

   {drawerId !== socket.id && (
  <div className="game-controls">
    <input
      type="text"
      placeholder="Enter your guess"
      value={guess}
      onChange={(e) => setGuess(e.target.value)}
    />

    <button onClick={submitGuess}>
      Guess
    </button>
  </div>
)}
  </>
) : (
  <p>Waiting for players...</p>
)}
  </div>
)}
</div>
    </div>
  );
}

export default App;