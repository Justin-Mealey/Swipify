import React from 'react';
import { useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import Playlist from './Playlist.js'
import TopBar from './TopBar.js'; // Adjust the import path based on your file structure


export default function WelcomeScreen(){
    const [playlists, setPlaylists] = useState([{name: "Loading...", id : ""}]);

    useEffect(() => {

        async function getPlaylists() {
            const response = await fetch('http://localhost:8000/playlists');
            console.log(response);
            const json = await response.json();
            setPlaylists(json);
        }

    getPlaylists();


  }, []);

    let listItems = playlists.map((playlist) => 
        <li key={playlist.id}>
            <Playlist name={playlist.name} id={playlist.id} images={playlist.images}/>
        </li>
    )

    return (
        <>
            <TopBar/>
            <div className="subheading">SELECT. SWIPE. SAVE.</div>
            <ul className='playlist-grid'>
                {listItems}
            </ul>
        </>
    )
}
