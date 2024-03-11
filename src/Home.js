import React, {useState, useEffect } from 'react';
import Login from './Login'
import WelcomeScreen from './WelcomeScreen'

export default function Home(){
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


    return (
        <>
        { (token === '') ? <Login/> :
            <>
                 <WelcomeScreen/>
            </>
        }
        </>
    )
}

