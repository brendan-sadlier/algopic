import React, { useState, useEffect } from "react";
import axios from "axios";
import { socket } from '../Socket'

import { useParams, useLocation, useNavigate } from "react-router-dom";

// Styles
import "./GamePage.css";

const GamePage = () => {

    const { gameCode } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    function useQuery() {
        return new URLSearchParams(useLocation().search);
    }

    const query = useQuery();
    const username = query.get("username");

    // Game States
    const [gameData, setGameData] = useState([]);
    const [currentImage, setCurrentImage] = useState(0);
    const [nextImage, setNextImage] = useState(null);
    const [currentGuess, setCurrentGuess] = useState("");
    const [previousGuesses, setPreviousGuesses] = useState([]);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(20);
    const [currentRound, setCurrentRound] = useState(0);

    useEffect(() => {

        const fetchData = async () => {

            try {

                const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'; // Fallback to a default value
                const response = await axios.get(`${backendUrl}/game-data`);
                console.log("Game Data: ", response.data);
                setGameData(response.data);

            } catch (err) {
                console.log("Error fetching game data", err);
            }
        };

        fetchData();
    }, []);


    // TODO: Update Timer
    // useEffect(() => {}, []);

    const handleGuessSubmit = () => {

        // Check if the guess matches any object from the game-data
        const currentImageObjects = gameData[currentImage]?.labels || [];

        // Check there is a match
        // Convert labels and guesses to lowercase to make it case insensitive
        const match = currentImageObjects.find((label => label.name.toLowerCase() === currentGuess.toLowerCase()));

        if (previousGuesses.includes(currentGuess.toLowerCase())){
            // Inform the user they have already guessed this
            // TODO: Add a client side notification
            setCurrentGuess("");
        }

        if (match) {

            console.log("[MATCH FOUND] - Match Score:", match.score, "@", timer);

            // TODO: Client Notification

            const pointsEarned = match.score * timer * 10;
            console.log("Points Earned from match:", pointsEarned);
            setScore(score + pointsEarned);

            if (pointsEarned > 0) {
                socket.emit("updateScore", { 
                    username: username, 
                    gameCode: gameCode, 
                    score: pointsEarned 
                });
            }
        } else {

            // TODO: Client Notification of Wrong Guess

        }

        setPreviousGuesses(previousGuesses => [...previousGuesses, currentGuess]);
        setCurrentGuess("");
    }

    // Functionality to Allow User to Submit By Pressing Enter
    const handleEnterKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleGuessSubmit();
        }
    }

    if (gameData.length === 0) {
        return (
            <div>
                <h1>Loading...</h1>
            </div>
        )
    }


    return (
        // <div className="game-container">
            
        //     <div className="game-header">
        //         <div className="header-item timer">{timer}s</div>
        //         <div className="header-item score">Score: {score}</div>
        //         <div className="header-item">Round: {currentRound + 1}</div>
        //     </div>

        //     <div className="image-container">

        //         {gameData.length > 0 && gameData[currentImage] &&
        //             <img className={`responsive-image`} src={`http://localhost:3001/${gameData[currentImage].path}`} alt="Game" />
        //         }

        //     </div>

                

        //     <div className="guess-container">

        //         <input
        //             className="guess-input"
        //             type="text" 
        //             placeholder="Enter Guess"
        //             value={currentGuess}
        //             onChange={(event) => setCurrentGuess(event.target.value)}
        //             onKeyPress={handleEnterKeyPress}
        //         />

        //         <button className="guess-button" onClick={handleGuessSubmit}>Guess</button>

        //     </div>

        //     <div className="prev-guess-container">

        //         <div className="previous-guesses">

        //             <div className="guesses-title">
        //                 Already Guessed
        //             </div>

        //             <div className="guesses-list">

        //                 {previousGuesses.map((guess, index) => (
        //                     <div className="guess-item" key={index}>{guess}</div>
        //                 ))}

        //             </div>

        //         </div>

        //     </div>

        //     {/* TODO: Add Round End Modal */}

        // </div>

        <div className="main-container">

            <div className="game-info">
                <div className="info-item player">{username}</div>
                <div className="info-item timer">{timer}s</div>
                <div className="info-item score">Score: {score}</div>
                <div className="info-item round">Round: {currentRound+1}</div>
                <button className="info-item leave">Leave Game</button>
            </div>

            <div className="image-container">

            <div className="message ">{}</div>

                {gameData.length > 0 && gameData[currentImage] &&
                    <img className={`responsive-image`} src={`http://localhost:3001/${gameData[currentImage].path}`} alt="Game" />
                }


                <div className="guess-input-area">

                    <input
                        className="guess-input"
                        type="text" 
                        placeholder="Enter Guess"
                        value={currentGuess}
                        onChange={(event) => setCurrentGuess(event.target.value)}
                        onKeyPress={handleEnterKeyPress}
                    />

                    <button className="guess-button" onClick={handleGuessSubmit}>Guess</button>

                </div>

            </div>

            <div className="prev-guess-panel">

                <p className="prev-guess-title">Already Guessed</p>

                <ul className="previous-guesses">

                    {previousGuesses.map((guess, index) => (
                        <div className="guess-item" key={index}>{guess}</div>
                    ))}

                </ul>

            </div>

        </div>
    )
};

export default GamePage;