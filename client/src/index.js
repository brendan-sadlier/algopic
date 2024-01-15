import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Components
import Home from './components/Home/Home';
import CreateGame from './components/CreateGame/CreateGame';
import JoinGame from './components/JoinGame/JoinGame';
import UploadPage from './components/UploadPage/UploadPage';
import GameLobby from './components/GameLobby/GameLobby';
import GamePage from './components/GamePage/GamePage';
import GameOver from './components/GameOver/GameOver';

// Unregister service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    registration.unregister();
  }).catch(error => {
    console.error("Service Worker unregistration failed: ", error);
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create-game" element={<CreateGame />} />
      <Route path="/join-game" element={<JoinGame />} />
      <Route path="/game/:gameCode/upload-images" element={<UploadPage />} />
      <Route path="/game/:gameCode/lobby" element={<GameLobby />} />
      <Route path="/game/:gameCode/start" element={<GamePage />} />
      <Route path="/game/:gameCode/game-over" element={<GameOver />} />
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
