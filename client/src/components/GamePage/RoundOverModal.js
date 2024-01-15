import React, { useState, useEffect } from "react";

import './RoundOverModal.css';

const RoundOverModal = ({ isVisible, scores, countdown, onClose }) => {

    const [modalTimer, setModalTimer] = useState(countdown);

    // Reset the timer to the passed 'timer' value every time the modal opens
    useEffect(() => {

        if (isVisible) {
            setModalTimer(countdown);
        }
    }, [isVisible, countdown]);

    // Countdown Logic
    useEffect(() => {

        let intervalId;

        if (isVisible && modalTimer > 0) {
            intervalId = setInterval(() => {
                setModalTimer((prevTimer) => prevTimer - 1);
            }, 1000)
        }

        return () => clearInterval(intervalId);

    }, [isVisible, modalTimer]);

    // Close the modal when the timer reaches 0
    useEffect(() => {

        if (modalTimer === 0) {
            onClose();
        }

    }, [modalTimer, onClose]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="modal">
            <div className="modal-content">
                <h2 className="scores-title">Scores</h2>
                {Object.entries(scores).map(([player, score], index) => (
                    <p key={index}>{player}: {score}</p>
                ))}
                <p className="countdown">Next round starts in: {modalTimer} seconds</p>
            </div>
        </div>
    );

};

export default RoundOverModal;