import React from "react";
import './Header.css'

const Header = ({ timeLeft, score, round, onLeave }) => {

  return (
    <div className="header">

      <div className="header-item timer">
        <span className="header-label">{timeLeft}s</span>
      </div>

      <div className="header-item score">
        <span className="header-label">SCORE: {score}</span>
      </div>

      <div className="header-item round">
        <span className="header-label">ROUND: {round}</span>
      </div>

      <div className="header-item leave">
        <button className="leave-button" onClick={onLeave}>LEAVE</button>
      </div>

    </div>
  )


}

export default Header;