import React, { useState, useEffect } from "react";
import axios from "axios";

const MiniGame = ({ gameCode, imageIndex, playerName }) => {

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

  const [miniGameData, setMiniGameData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {

      const response = await axios.get(`${backendUrl}/mini-game-data/${gameCode}/${imageIndex}`);
      setMiniGameData(response.data);
    };

    fetchData();
  }, [gameCode, imageIndex, backendUrl]);

  const handleGuessSubmit = async (guessedName) => {

    const response = await axios.post(`${backendUrl}/submit-guess`, {

      gameCode,
      playerName,
      guessedName,
      imageIndex

    });

    if (response.data.correct) {
      alert('Correct Guess!');
    } else {
      alert('Incorrect Guess!');
    }

    return (
      <div>
          {miniGameData && (
              <div>
                  <img src={miniGameData.path} alt="Guess who uploaded this" />
                  <div>
                      {miniGameData.options.map((name, index) => (
                          <button key={index} onClick={() => handleGuessSubmit(name)}>
                              {name}
                          </button>
                      ))}
                  </div>
              </div>
          )}
      </div>
  );

  };


};

export default MiniGame;