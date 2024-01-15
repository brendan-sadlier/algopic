import React, { useState, useEffect } from "react";
import axios from "axios";
import { socket } from '../Socket'

import { useParams, useLocation, useNavigate } from "react-router-dom";

import RoundOverModal from "./RoundOverModal";
import LeaveGameModal from "./LeaveGameModal";

// Styles
import "./GamePage.css";

const GamePage = () => {

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [nextImageIndex, setNextImageIndex] = useState(null);
    const [currentGuess, setCurrentGuess] = useState("");
    const [previousGuesses, setPreviousGuesses] = useState([]);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(60);
    const [currentRound, setCurrentRound] = useState(0);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalData, setModalData] = useState({ scores: {}, countdown: 5 });

    const [isCorrect, setIsCorrect] = useState(false);
    const [message, setMessage] = useState("");
    const [animationWrong, setAnimationWrong] = useState(false);
    const [timerFlash, setTimerFlash] = useState(false);

    const [showLeaveGameModal, setShowLeaveGameModal] = useState(false);

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


    useEffect(() => {

        let timerInterval;

        socket.on("timerUpdate", (timeLeft) => {

            setTimer(timeLeft);

            if (timeLeft <= 10) {
                timerInterval = setInterval(() => {
                    setTimerFlash(prevState => !prevState);
                }, 500);
            } else {
                setTimerFlash(false);
            }

        })

        // Listener to move to the next round
        socket.on("nextRound", (newImageIndex) => {

            // if (!isModalVisible) {
            //     setCurrentImageIndex(newImageIndex);
            //     setIsModalVisible(true);
            //     setPreviousGuesses([]);
            //     setTimer(60);
            // } else {
            //     setNextImageIndex(newImageIndex);
            // }

            setCurrentImageIndex(newImageIndex);
            setIsModalVisible(true);
            setPreviousGuesses([]);
            setTimer(60); // Reset timer here for the new round

        });

        socket.on("startNewRound", () => {
            setIsModalVisible(false);
            setTimer(60);
        })

        // Listener to move to end game
        socket.on('gameOver', ({ scores, winner }) => {
            console.log('Game Over received', scores, winner);
            navigate(`/game/${gameCode}/game-over`, { state: { scores, winner } })
          });

          // Round Ended Listener
        socket.on('roundEnded', ({ scores , nextRoundStartsIn }) => {
            setModalData({ scores, countdown: nextRoundStartsIn });
            setIsModalVisible(true);
          });

          return () => {
            socket.off('timerUpdate');
            socket.off('nextRound');
            socket.off('roundEnded');
            socket.off('gameOver');
          };

    }, [isModalVisible, gameCode, navigate]);

    const closeModal = () => {
        setIsModalVisible(false);
  
        if (nextImageIndex !== null) {
          setCurrentImageIndex(nextImageIndex);
          setCurrentRound(currentRound + 1);
          setNextImageIndex(null);
          setPreviousGuesses([]);
        }
      }

    const handleGuessSubmit = () => {

        // Check if the guess matches any object from the game-data
        const lowerCaseGuess = currentGuess.toLowerCase();
        const currentImageObjects = gameData[currentImageIndex]?.labels || [];

        // Check there is a match
        // Convert labels and guesses to lowercase to make it case insensitive
        const match = currentImageObjects.find(label => label.name.toLowerCase() === lowerCaseGuess);

        if (previousGuesses.includes(lowerCaseGuess)) {
            // Inform the user they have already guessed this
            setMessage("You have already guessed this!");
            setTimeout(() => setMessage(""), 2000);
            setCurrentGuess('');
            return;
        }

        if (match) {

            console.log("[MATCH FOUND] - Match Score:", match.score, "@", timer);

            setMessage("Correct!");
            setIsCorrect(true);
            setTimeout(() => setIsCorrect(false), 2000);
            setTimeout(() => setMessage(''), 2000);

            const pointsEarned = match.score * timer * 10;
            console.log("Points Earned from match:", pointsEarned);
            setScore(score + pointsEarned);

            if (pointsEarned > 0) {

                // Emit an event to the server to update the score

                socket.emit("updateScore", { 
                    username: username, 
                    gameCode: gameCode, 
                    pointsEarned: pointsEarned 
                });
            }
        } else {

            setMessage("Wrong Guess! Try Again");
            setAnimationWrong(true);
            setTimeout(() => {
                setMessage("");
                setAnimationWrong(false);
            }, 1000)

        }

        setPreviousGuesses(previousGuesses => [...previousGuesses, lowerCaseGuess]);
        setCurrentGuess("");
    }

    // Functionality to Allow User to Submit By Pressing Enter
    const handleEnterKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleGuessSubmit();
        }
    }

    const handleRedirectCountdown = () => {
        navigate('/');
    }

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

            console.log("Leave Game Event Received");
            setShowLeaveGameModal(true);
        });

        return () => {
            socket.off("leaveGame");
        }
    }, [navigate, username]);


    if (gameData.length === 0) {
        return (
            <div>
                <h1>Loading...</h1>
            </div>
        )
    }


    return (

        <div className="main-container">

            <div className="game-info">
                <div className="info-item player">{username}</div>
                <div className={`info-item timer ${timer <= 10 ? 'flash-animation' : ''}`}>{timer}s</div>
                <div className={`info-item score ${isCorrect ? 'correct-guess' : ''}`}>Score: {score}</div>
                <div className="info-item round">Round: {currentImageIndex+1}</div>
                <button className="info-item leave" onClick={handleLeaveGame}>Leave Game</button>
            </div>

            <div className="image-container">

            <div className={`message ${isCorrect ? 'correct' : ''}`}>{message}</div>

                {gameData.length > 0 && gameData[currentImageIndex] &&
                    <img className={`responsive-image ${animationWrong ? 'vibrate-animation' : ''}`} src={`http://localhost:3001/${gameData[currentImageIndex].path}`} alt="Game" />
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

            <RoundOverModal 
                isVisible={isModalVisible}
                scores={modalData.scores}
                countdown={modalData.countdown}
                onClose={closeModal}
            />

            <LeaveGameModal 
                isVisible={showLeaveGameModal}
                countdown={5}
                username={username}
                onCountdownEnd={handleRedirectCountdown}
                />

        </div>
    )
};

export default GamePage;