import React, { useState, useEffect } from 'react';
import Home from './Home.js'
import Swipescreen from './Swipescreen.js'
import { Routes, Route } from 'react-router-dom'


export default function App() {
    const [token, setToken] = useState('');

    useEffect(() => { //get our token allowing access to the Spotify API

        async function getToken() {
            const response = await fetch('http://localhost:8000/auth/token');
            console.log(response);
            const json = await response.json();
            setToken(json.access_token);
        }

        getToken();

    }, []);

    //app has two main pages, one to pick playlist, one to swipe on it
    return (
        <div className="App">
            <Routes>
                <Route exact path='/' element={<Home />} />
                <Route exact path='/swipe' element={<Swipescreen token = {token}/>} />
            </Routes>
        </div>
    )
}
