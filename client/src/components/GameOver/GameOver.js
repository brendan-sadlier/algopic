import React from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

const GameOver = () => {


    const location = useLocation();

    const gameCode = useParams();

    const { scores, winner } = location.state || { scores: [], winner: '' };

    if (!scores || !winner) {
        return <div>No Info Available</div>
    }



  return (
    <div>
        <h1>Game Over</h1>
        <h2>Winner: {winner}</h2>
        <h3>Scores</h3>
        <ul>
        {Object.entries(scores).map(([player, score]) => (
            <li className='player-scores-item' key={player}>{player}: {score}</li>
          ))}
        </ul>
    </div>
  )
}

export default GameOver