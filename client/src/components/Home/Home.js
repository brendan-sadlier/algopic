import React from 'react';
import { useNavigate } from 'react-router-dom';

// Home Stylesheet
import './Home.css';

const Home = () => {

    const navigate = useNavigate();

    const onCreateClick = () => {
        navigate('/create-game');
    };

    const onJoinClick = () => {
        navigate('/join-game');
    };

    return (

        <div className="home-container">

            <div className="home-title">
                <img className='title-image' src={process.env.PUBLIC_URL + 'AlgoPic.png'}/>
            </div>

            <div className='button-container'>
                <button className='create-button' onClick={onCreateClick}>Create Game</button>
                <button className='join-button' onClick={onJoinClick}>Join Game</button>
            </div>

            <div className='footer'>
                <p>Created by <a className='github-link' href="https://github.com/brendan-sadlier">Brendan Sadlier</a></p>
            </div>

        </div>


    )

};

export default Home;