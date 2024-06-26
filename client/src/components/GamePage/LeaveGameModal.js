import React, { useEffect, useState } from "react";

import "./LeaveGameModal.css";

const LeaveGameModal = ({ isVisible, countdown, username, onCountdownEnd }) => {

    const [timer, setTimer] = useState(countdown);

    useEffect(() => {

        if (isVisible && timer > 0) {
            const intervalId = setInterval(() => {
                setTimer((prevCountdown) => {
                    if (prevCountdown > 1) return prevCountdown - 1;
                    clearInterval(intervalId); // Clear interval when countdown finishes
                    return 0;
                });
            }, 1000);

            return () => clearInterval(intervalId);
        }
    }, [isVisible, timer, onCountdownEnd]);

    useEffect(() => {
        if (timer === 0) {
            onCountdownEnd();
        }
    }, [timer, onCountdownEnd]);

    if (!isVisible) {
        return null;
    }

    return (

        <div className="modal">

            <div className="modal-content">
            
                <h2 className="leave-game-title">Leaving Game</h2>
                <p><span className="username">{username}</span> has ended the game</p>
                <p className="countdown">Returning to home page in {timer} seconds</p>
            
            </div>

        </div>

    );
};

export default LeaveGameModal;