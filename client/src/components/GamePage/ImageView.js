import React from "react";
import './ImageView.css'

const ImageView = ({ imageUrl }) => {

  return (
    <div className="image-container">
      <img src={imageUrl} alt="game" className="game-image" />
    </div>
  )

}

export default ImageView;