import React, { useState, useEffect } from "react";
import axios from "axios";
import { socket } from '../Socket'

import { useParams, useLocation, useNavigate } from "react-router-dom";

import RoundOverModal from "./RoundOverModal";
import LeaveGameModal from "./LeaveGameModal";

import Confetti from "react-confetti";
import useSound from 'use-sound';

import CorrectSound from '../../correct.mp3';
import WrongSound from '../../incorrect.mp3'

// Styles
import "./GamePage.css";

const GamePage = () => {

    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

    const { gameCode } = useParams();
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

    const [playCorrect] = useSound(CorrectSound);
    const [playWrong] = useSound(WrongSound);

    // Mini-Game States
    const [isMiniGameVisible, setIsMiniGameVisible] = useState(false);
    const [miniGameData, setMiniGameData] = useState({ path: "", options: [] });

    const fetchMiniGameData = async (imageIndex) => {
        try {
            const response = await axios.get(`${backendUrl}/mini-game-data/${gameCode}/${imageIndex}`);
            setMiniGameData(response.data);
        } catch (err) {
            console.log("Error fetching mini-game data", err);
        }
    };

    const handleMiniGameGuess = async (guessedName) => {
        try {
            const response = await axios.post(`${backendUrl}/submit-guess`, {
                gameCode,
                playerName: username,
                guessedName,
                imageIndex: currentImageIndex
            });

            setIsMiniGameVisible(false);
            if (response.data.correct) {
                alert('Correct Guess!');
            } else {
                alert('Incorrect Guess!');
            }
        } catch (err) {
            console.log("Error submitting mini-game guess", err);
        }
    };

    const shuffleImages = (images) => {
        for (let i = images.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [images[i], images[j]] = [images[j], images[i]];
        }
    }

    

    useEffect(() => {

        const fetchData = async () => {

            try {

                const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'; // Fallback to a default value
                const response = await axios.get(backendUrl+"/game-data");
                console.log("Game Data: ", response.data);

                if (Array.isArray(response.data)) {
                    setGameData(response.data);
                } else {
                    console.log("Game Data is not an array");
                }

            } catch (err) {
                console.log("Error fetching game data", err);
            }
        };

        fetchData();

        socket.on("gameDataUpdated", () => {
            console.log("Game Data Updated");
        
        });

        // Listener to move to the next round
        socket.on("nextRound", (newImageIndex) => {

            // showMiniGameAtRandom();
            setCurrentImageIndex(newImageIndex);
            setIsModalVisible(true);
            setPreviousGuesses([]);
            setTimer(60); // Reset timer here for the new round

        });

        return () => {
            socket.off('gameDataUpdated');
            socket.off('nextRound');
        }

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

        socket.on("startNewRound", () => {
            setIsModalVisible(false);
            setTimer(60);
        })

        // Listener to move to end game
        socket.on('gameOver', ({ scores, winner }) => {
            console.log('Game Over received', scores, winner);
            navigate(`/game/${gameCode}/game-over?username=${encodeURIComponent(username)}`, { state: { scores, winner } })
          });

          // Round Ended Listener
        socket.on('roundEnded', ({ scores , nextRoundStartsIn }) => {
            setModalData({ scores, countdown: nextRoundStartsIn });
            setIsModalVisible(true);
          });

          return () => {
            socket.off('timerUpdate');
            socket.off('roundEnded');
            socket.off('gameOver');
          };

    }, [isModalVisible, gameCode, navigate, username]);

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
            playWrong();
            setTimeout(() => setMessage(""), 2000);
            setCurrentGuess('');
            return;
        }

        if (match) {

            console.log("[MATCH FOUND] - Match Score:", match.score, "@", timer);

            setMessage("Correct!");
            setIsCorrect(true);
            playCorrect();
            console.log("Correct Sound Played" , playCorrect);
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
            playWrong();
            setAnimationWrong(true);
            setTimeout(() => {
                setMessage("");
                setAnimationWrong(false);
            }, 1000)

        }

        setPreviousGuesses(previousGuesses => [...previousGuesses, lowerCaseGuess]);
        setCurrentGuess("");
    }

    const showMiniGameAtRandom = () => {

        // 25% chance to show the mini-game
        if (Math.random() < 0.5) {
            setIsMiniGameVisible(true);
            fetchMiniGameData();
        }
    };

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
            <div style={{
                backgroundColor: "white",
                borderRadius: "10px",
            }}>
                <h1 style={{
                    textAlign: "center",
                    fontSize: "2rem",
                    fontFamily: "Bungee, sans-serif",
                    color: "#ED1C24",
                }}>NO DATA FOUND :\</h1>
            </div>
        )
    }

    console.log(`${backendUrl}/${gameData[currentImageIndex].path}`);

    return (

        <div className="game-container">

            <div className="header">

                <div className={`header-item timer ${timer <= 10 ? 'flash-animation' : ''}`}>
                    <span className="header-label">{timer}s</span>
                </div>

                <div className={`header-item score ${isCorrect ? 'correct-guess' : ''}`}>
                    <span className="header-label">Score: {score}</span>
                </div>

                <div className="header-item round">
                    <span className="header-label">Round: {currentImageIndex+1}</span>
                </div>

                <div className="header-item leave">
                    <button className="leave-button" onClick={handleLeaveGame}>LEAVE</button>
                </div>

            </div>

            

            <div className="image-guess-container">

            {isCorrect && <Confetti numberOfPieces={1000}/>}

            <div className={`message ${isCorrect ? 'correct' : ''}`}>{message}</div>

                {gameData.length > 0 && gameData[currentImageIndex] &&
                    <div className="image-container">
                        <img key={currentImageIndex} className={`game-image ${animationWrong ? 'vibrate-animation' : ''}`} src={`${backendUrl}/${gameData[currentImageIndex].path}`} alt="Game" />
                    </div>
                    // <ImageView imageUrl={`http://localhost:3001/${gameData[currentImageIndex].path}`} />
                }


                <div className="guess-form">
                    <input
                        className="guess-input"
                        type="text" 
                        placeholder="Enter Guess"
                        value={currentGuess}
                        onChange={(event) => setCurrentGuess(event.target.value)}
                        onKeyPress={handleEnterKeyPress}
                    />

                    <button className="guess-submit" onClick={handleGuessSubmit}>Guess</button>
                </div>

            </div>

            {/* {
                isMiniGameVisible && (
                    <div className="mini-game">
                        <h3>Whose image is this?</h3>
                        <img src={miniGameData.path} alt="Mini-game prompt" />
                        {miniGameData.options.map((option, index) => (
                            <button key={index} onClick={() => handleMiniGameGuess(option)}>
                                {option}
                            </button>
                        ))}
                    </div>
                )
            } */}

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