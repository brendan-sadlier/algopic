import React from "react";
import './GuessField.css'

const GuessField = ({ guess, setCurrentGuess, handleGuessSubmit, onKeyPress }) => {

  return (
      <form className="guess-form" onSubmit={handleGuessSubmit}>
        <input
          className="guess-input"
          type="text"
          value={guess}
          onChange={(e) => setCurrentGuess(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Enter your guess"
        />
        <button className="guess-submit" type="submit">Guess</button>
      </form>
  )

}

export default GuessField;