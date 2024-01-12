import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom';

import { socket } from '../Socket';
import './GameLobby.css'

function GameLobby() {

    const { gameCode }  = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [players, setPlayers] = useState([]);
    const [host, setHost] = useState('');
    const [isHost, setIsHost] = useState(false); // Add this line

    // Helper function to parse query parameters
    function useQuery() {
        return new URLSearchParams(location.search);
    }
    
    const query = useQuery();
    const username = query.get('username');

    useEffect(() => {

        socket.emit('joinGame', { username, gameCode });

        socket.on('updatePlayers', (data) => {

            if (data && Array.isArray(data.players)) {
                console.log("Updated Players: ", data.players);
                setPlayers(data.players);
                setHost(data.host);
                setIsHost(username === data.host); // Set true if current user is the host
                console.log(data.players);
            } else {
                console.log('Invalid players data');
            }
        });

        return () => socket.off('updatePlayers');
    }, [username, gameCode]);

    useEffect(() => {

        socket.on('gameStarting', (gameCode) => {
            console.log(`Game ${gameCode} is starting`);
            navigate(`/game/${gameCode}/start?username=${encodeURIComponent(username)}`);
        });

        return () => { socket.off('gameStarting'); };

    }, [navigate, username]);


    const handleStartGame = () => {
        console.log('Starting game');
        socket.emit('startGame', { gameCode });
        // Add code to start the game
        navigate(`/game/${gameCode}/start?username=${encodeURIComponent(username)}`);
    }

    return (
        <div className='game-lobby-container'>
            <div>
                <h1 className='game-lobby-title'>Game Lobby</h1>
            </div>
            <div className='game-code-container'>
                <h3 className='game-lobby-code'>Game Code: {gameCode}</h3>
            </div>
            <h3 className='host-title'>Host: {host}</h3>
            <p className='players-title'>Players In Lobby</p>
          <ul className='game-lobby-players'>
            {Array.isArray(players) && players.map((player, index) => (
                <li key={index}>{player}</li>
            ))}
          </ul>
          {isHost && (
                <button className='start-game-button' onClick={handleStartGame} disabled={players.length < 2}>
                    Start Game
                </button>
            )}
        </div>
      );

}

export default GameLobby