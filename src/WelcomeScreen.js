import React, { useState, useEffect } from 'react';
import Playlist from './Playlist.js';
import TopBar from './TopBar.js';
import Spinner from './Spinner.js';

export default function WelcomeScreen() {
    const [playlists, setPlaylists] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function getPlaylists() {
            try {
                const response = await fetch('http://localhost:8000/playlists');
                const json = await response.json();
                setPlaylists(json);
            } catch (error) {
                console.error('Error fetching playlists:', error);
            } finally {
                setIsLoading(false);
            }
        }
        getPlaylists();
    }, []);

    let listItems = null;
    if (playlists) {
        listItems = playlists.map((playlist) => (
            <li key={playlist.id}>
                <Playlist name={playlist.name} id={playlist.id} images={playlist.images} />
            </li>
        ));
    }

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <>
            <TopBar />
            <div className="subheading">SELECT. SWIPE. SAVE.</div>
            <ul className='playlist-grid'>
                {listItems}
            </ul>
        </>
    );
}

