import React, { useState, useEffect } from 'react';
import Home from './Home.js'
import Swipescreen from './Swipescreen.js'
import FilterScreen from './FilterScreen.js'
import { Routes, Route } from 'react-router-dom'


export default function App() {
    const [token, setToken] = useState('');

    useEffect(() => {

        async function getToken() {
            const response = await fetch('http://localhost:8000/auth/token');
            console.log(response);
            const json = await response.json();
            setToken(json.access_token);
        }

        getToken();

    }, []);

    //check for token
    //if token
    //useNavigate(login page)

    //also check for every instance of fetch('http://localhost:8000/auth/token');

    return (
        <div className="App">
            <Routes>
                <Route exact path='/' element={<Home />} />
                <Route exact path='/filter' element={<FilterScreen />} /> )
                <Route exact path='/swipe' element={<Swipescreen token = {token}/>} />
            </Routes>
        </div>
    )
}
