import React from 'react'
import { useEffect, useState } from 'react'
import WebPlayback from './WebPlayback'
import { useLocation } from 'react-router-dom'




export default function Swipescreen({ token }) {
    const { state } = useLocation();
    const { playlist_id, name } = state;
    const [tracks, setTracks] = useState([null]);
    const [artists, setArtists] = useState([null]);
    const [tracksToRemove, setTracksToRemove] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trackCounter, setTrackCounter] = useState(0);

    useEffect(() => {
        async function getTracks(playlist_id) {
            const response = await fetch('http://localhost:8000/tracks_and_artists?' + new URLSearchParams({
                playlist_id: playlist_id,
            }));
            const json = await response.json();
            console.log("Tracks: ", json);
            setTracks(json.tracks);
            setArtists(json.artists);
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
                {<WebPlayback token={token} track_list={tracks.map(item => item.track)} playlist_name={name} />}
            </div>
            <FilterArtistButton artists={artists}/>
        </div>
    );
}

//use tracks state to get artists instead of doing another fetch, make dropdown of all artists
//so the user can select who to filter
function FilterArtistButton({artists}){
    if(artists[0]){
        return (
        <select>
            {artists.map((artist) => <option>{artist.name}</option>)}
        </select>
    )
    }
    return <div></div>
}