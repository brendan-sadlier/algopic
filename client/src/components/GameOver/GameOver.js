import React, { useEffect } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { socket } from '../Socket'
import axios from 'axios'

import './GameOver.css'

const GameOver = () => {

  const backendUrl = process.env.REACT_APP_BACKEND_URL


    const location = useLocation();
    const navigate = useNavigate();

    const { gameCode }  = useParams();

    const { scores, winner } = location.state || { scores: [], winner: '' };

    function useQuery() {
      return new URLSearchParams(useLocation().search);
    }

    const query = useQuery();
    const username = query.get('username');


    const handleLeaveGame = () => {
      socket.emit("leaveGameInitiated", { username, gameCode })

      // Make a request to the server to remove the user from the game
      axios.get(`${backendUrl}/delete-files`)
      .then(response => {
          console.log(response);
      })
      .catch(error => {
          console.log("Error deleting files", error);
      });

    };

      // Listen for the leave game event
      useEffect(() => {
        socket.on("leaveGame", ({ username, gameCode }) => {

          navigate('/');
          console.log("Leave Game Event Received");
        });

        return () => {
            socket.off("leaveGame");
        }
    }, [navigate, username]);


    if (!scores || !winner) {
        return <div>No Info Available</div>
    }



  return (
    <div className='game-over-container'>
        <div className='title-container'>
          <h1 className='game-over-title'>Game Over</h1>
        </div>
        
        <div className='winner-container'>
          <h2 className='winner-title'>Winner: {winner}</h2>
        </div>

        <div className='scores-container'>

          <h3 className='scores-title'>Final Scores</h3>

          <ul className='scores-list'>
            {Object.entries(scores).map(([player, score]) => (
              <li className='player-scores-item' key={player}>{player}: {score}</li>
            ))}
          </ul>

        </div>

        <button className='leave-game-button' onClick={handleLeaveGame}>Leave Game</button>
    </div>
  )
}

export default GameOver