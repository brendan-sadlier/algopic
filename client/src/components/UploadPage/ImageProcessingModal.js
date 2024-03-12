import React from 'react'

import './ImageProcessingModal.css'

const ImageProcessingModal = ({ isOpen }) => {

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p>The AI is thinking...</p>
                <div className="loader"></div>
                <h3>How To Play</h3>
                <p style={{
                    fontSize: '0.7rem',
                }}>
                    In this game, you'll see images processed by AI to identify objects within them.
                    Your task is simple: guess the objects correctly to score points.

                    Type your guesses quickly and accurately to earn the highest score. 
                    Remember, each round is timed, so think fast!
                </p>
            </div>
        </div>
    );
}

export default ImageProcessingModal