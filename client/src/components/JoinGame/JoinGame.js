import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from '../Socket'

// Styles
import './JoinGame.css'

const JoinGame = () => {

    const navigate = useNavigate();

    const [gameCode, setGameCode] = useState('');
    const [username, setUsername] = useState('');

    const handleJoinGameClick = () => {

        setGameCode(gameCode.toUpperCase());

        if (username.trim() && gameCode.trim()) {
            navigate(`/game/${gameCode}/upload-images?username=${encodeURIComponent(username)}`);
        } else {
            console.log('Username and/or game code is empty');
            alert('Please enter a username and game code');
        }
    };

    return (
        <div className='join-game-container'>
            <div>
                <h1 className='join-game-title'>Join a Game</h1>
            </div>
            <div className='join-game-form'>
                <input 
                    className='player-name-input'
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    placeholder='Player Name'
                />
                <input 
                    className='game-code-input'
                    type="text" 
                    placeholder="Game Code" 
                    value={gameCode} 
                    onChange={(e) => setGameCode(e.target.value.toUpperCase)} 
                />
        
        <button className='join-game-button' onClick={handleJoinGameClick}>Join Game</button>
      </div>

    </div>
    )
}

export default JoinGame