import React from 'react';
import './Login.css';
import TopBar from './TopBar.js';

function Login() {
    return ( //Display the login title and the login button which uses href to specify the link (Spotify)
        <> 
            <TopBar/>
            <div className="container">
                <div className="center">
                    <h1 className="big-title">Swipe in to Swipify</h1>
                    <a className="login-button" href='http://localhost:8000/login'>Login with Spotify</a>
                </div>
            </div>
        </>
    );
}

export default Login;

