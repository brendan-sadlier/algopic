import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import  { socket } from '../Socket'

// Styles
import './CreateGame.css';

const CreateGame = () => {

    const navigate = useNavigate();

    // Inputted username state
    const [username, setUsername] = useState('');

    const handleCreateGameClick = () => {

        if (username.trim()) {
            socket.emit('create-game', username);
        } else {
            console.log('Please enter a username');
            alert('Please enter a username');
        }
    };

    const handleGameCreated = useCallback((gameCode) => {
        if (typeof gameCode === 'string') {
            console.log('Game created with code: ', gameCode);
            navigate(`/game/${gameCode}/upload-images?username=${encodeURIComponent(username)}`);
        } else {
            console.log('Game creation failed - Code is not a String');
        }
    }, [navigate, username]);

    useEffect (() => {
        socket.on('gameCreated', handleGameCreated);

        // Clean up listener
        return () => {
            socket.off('gameCreated', handleGameCreated);
        };
    }, [handleGameCreated]);

    return (

        <div className='create-game-container'>
            <div>
                <h1 className='create-game-title'>Create A Game</h1>
            </div>
            <div className='create-game-form'>
                <input className='player-name-input' type='text' value={username} onChange={e => setUsername(e.target.value)} placeholder='Player Name'/>
                <button className='create-game-button' onClick={handleCreateGameClick}>Create Game</button>
            </div>
        </div>

    )

};

export default CreateGame;