import React, {useState, useEffect } from 'react';
import Login from './Login.js'
import WelcomeScreen from './WelcomeScreen.js'

export default function Home(){
    const [token, setToken] = useState('');

    useEffect(() => {

        async function getToken() { //get our token allowing access to the Spotify API
            const response = await fetch('http://localhost:8000/auth/token');
            console.log(response);
            const json = await response.json();
            setToken(json.access_token);
        }

    getToken();

  }, []);


    return ( //display correct screen based on if we have successfully grabbed token yet
        <>
        { (token === '') ? <Login/> :
            <>
                 <WelcomeScreen/>
            </>
        }
        </>
    )
}

