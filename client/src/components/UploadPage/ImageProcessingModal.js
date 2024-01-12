import React from 'react'

import './ImageProcessingModal.css'

const ImageProcessingModal = ({ isOpen }) => {

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p>Processing images...</p>
                <div className="loader"></div>
            </div>
        </div>
    );
}

export default ImageProcessingModal