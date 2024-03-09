import React from 'react'
import { useEffect, useState } from 'react'
import WebPlayback from './WebPlayback'
import { useLocation } from 'react-router-dom'




export default function Swipescreen({ token }) {
    const { state } = useLocation();
    const { playlist_id, name } = state;
    const [tracks, setTracks] = useState([null]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getTracks(playlist_id) {
            const response = await fetch('http://localhost:8000/tracks?' + new URLSearchParams({
                playlist_id: playlist_id,
            }));
            const json = await response.json();
            console.log("Tracks: ", json);
            setTracks(json);
            setLoading(false);
        }
        getTracks(playlist_id);

    }, []);
    console.log("Tracks: ", tracks);
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="screen-container">
            <div className="swipe-screen">
                {<WebPlayback token={token} track_list={tracks.map(item => item.track)} playlist_name={name} playlist_id={playlist_id} />}
            </div>
        </div>
    );
}

