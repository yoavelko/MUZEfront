import './SpotifyPlayer.css';
import React, { useEffect, useState, useRef, useContext } from 'react';
import playIcon from '../../../media/play-icon.png';
import pauseIcon from '../../../media/pause-icon.png';
import nextIcon from '../../../media/next-icon.png';
import previousIcon from '../../../media/previous-icon.png';
import playlistIcon from '../../../media/playlist-icon.png';
import deleteIcon from '../../../media/delete-icon.png'
import { removeFromQueue, setQueue, addToHistory } from '../../../utils/AdminRoutes';
import axios from 'axios';
import { SocketContext } from '../../../contexts/SocketContext';

const SpotifyPlayer = ({ queue, loadPlaylist, setLoadPlaylist, popModal, setPopModal, playSpecific }) => {
    const { socket } = useContext(SocketContext);
    const [player, setPlayer] = useState(null);
    const [isPaused, setIsPaused] = useState(true);
    const [token, setToken] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [trackProgress, setTrackProgress] = useState(0);
    const [trackDuration, setTrackDuration] = useState(0);
    const progressInterval = useRef(null);
    const [playedTracks, setPlayedTracks] = useState([]);
    const [isHandlingTrack, setIsHandlingTrack] = useState(false);
    const [isTrackEnding, setIsTrackEnding] = useState(false);

    const clientId = import.meta.env.VITE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;
    const scopes = import.meta.env.VITE_SCOPES;

    const authenticateSpotify = () => {
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
        window.location.href = authUrl;
    };

    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const token = hash.split('&')[0].split('=')[1];
            setToken(token);
            localStorage.setItem('spotifyToken', token);
            window.location.hash = '';
            return;
        }
        if (!token) {
            authenticateSpotify();
        }

    }, []);

    useEffect(() => {
        if (!token) return;

        const script = document.createElement('script');
        script.id = 'spotify-sdk';
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const spotifyPlayer = new window.Spotify.Player({
                name: 'My Web Player',
                getOAuthToken: (cb) => cb(token),
                volume: 0.5,
            });

            setPlayer(spotifyPlayer);
            spotifyPlayer.connect();

            spotifyPlayer.addListener('player_state_changed', (state) => {
                if (!state) return;

                setIsPaused(state.paused);
                setTrackProgress(state.position);
                setTrackDuration(state.duration);
            });

            spotifyPlayer.addListener('ready', ({ device_id }) => {
                setDeviceId(device_id);

                fetch('https://api.spotify.com/v1/me/player', {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ device_ids: [device_id], play: false }),
                }).catch((err) => console.error("Error activating device:", err));
            });
        };
    }, [token]);

    useEffect(() => {
        if (
            trackDuration > 0 &&
            trackProgress + 1000 >= trackDuration &&
            queue?.length > 0 &&
            !isHandlingTrack &&
            !isTrackEnding
        ) {
            setIsTrackEnding(true);
            handleNextTrack().then(() => setIsTrackEnding(false));
        }
    }, [trackProgress, trackDuration, queue, isHandlingTrack, isTrackEnding]);

    useEffect(() => {
        if (isPaused) {
            clearInterval(progressInterval.current);
        } else {
            progressInterval.current = setInterval(() => {
                setTrackProgress((prev) => Math.min(prev + 1000, trackDuration));
            }, 1000);
        }

        return () => clearInterval(progressInterval.current);
    }, [isPaused, trackDuration]);

    useEffect(() => {
        const [track] = queue.splice(playSpecific?.index, 1);
        queue.unshift(track);
        const response = replaceQueue(queue);
        socket.emit('queue-req', response, 'room-1');
        playTrack(playSpecific?.url);
    }, [playSpecific]);

    async function replaceQueue(queue) {
        try {
            if (queue[0]) {
                const response = await axios.post(setQueue, { tracks: queue });
                return response;
            }
        } catch (error) {
            console.log('Unable to set queue:', error);
        }
    }

    const playTrack = (uri, position = 0) => {
        if (!uri || !deviceId) {
            console.error("Missing URI or Device ID");
            return;
        }

        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uris: [uri], position_ms: position }),
        }).catch((err) => console.error("Error playing track:", err));
    };

    const handleManualNextTrack = async () => {
        setIsTrackEnding(false); // Prevent interference with auto-skip
        await handleNextTrack();
    };

    const handleNextTrack = async () => {
        if (isHandlingTrack) return; // Prevent concurrent calls
        setIsHandlingTrack(true);

        if (!queue || queue.length === 0) {
            console.error("Queue is empty or undefined");
            setIsHandlingTrack(false);
            return;
        }

        const currentTrack = queue[0];
        const nextTrack = queue[1];

        // Move current track to playedTracks
        setPlayedTracks((prev) => [...prev, currentTrack]);

        // Remove current track from queue
        try {
            const track = { track: currentTrack };
            console.log(track);
            const response = await axios.post(removeFromQueue, track);
            socket.emit('queue-req', response, 'room-1');
            if (trackProgress > 60000) {
                await axios.post(addToHistory, track.track);
            }
        } catch (error) {
            console.log("Error removing track from queue");
            setIsHandlingTrack(false);
            return;
        }

        // Play the next track if available
        if (nextTrack) {
            playTrack(nextTrack.url);
        } else {
            console.error("No next track available");
        }

        setIsHandlingTrack(false);
    };

    const handlePreviousTrack = () => {
        if (playedTracks.length === 0) {
            console.error("No previous tracks available");
            return;
        }

        const previousTrack = playedTracks[playedTracks.length - 1];

        // Move last played track back to queue
        setPlayedTracks((prev) => prev.slice(0, -1));
        playTrack(previousTrack.url);
    };

    const togglePlayPause = async () => {
        if (!player) return;

        try {
            if (isPaused && trackProgress === 0) {
                // Play first track on initial play
                if (queue && queue.length > 0) {
                    await playTrack(queue[0]?.url);
                    setIsPaused(false);
                    return;
                }
            }

            // Toggle play/pause state
            await player.togglePlay();
            setIsPaused((prev) => !prev);
        } catch (err) {
            console.error("Error toggling play/pause:", err);
        }
    };

    const handleSeek = (e) => {
        const newPosition = (e.target.value / 100) * trackDuration;
        setTrackProgress(newPosition);
        playTrack(queue[0]?.url, newPosition);
    };

    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    async function handleDeleteQueue() {
        const alertResponse = window.confirm('למחוק את תור ההשמעה?');

        if (alertResponse) {
            const response = await axios.post(setQueue, { tracks: [] });
            socket.emit('queue-req', response, 'room-1');
        }
    }

    return (
        <div className='player-container'>
            <div className='buffer-container'>
                <div className='current-track'>
                    {queue?.length > 0 ? (
                        <div className='current-track-container'>
                            {
                                queue[0] ?
                                    <>
                                        <img className='current-track-img' src={queue[0]?.img} alt="" />
                                        <div>{`${queue[0]?.name} - ${queue[0]?.artist}`}</div>
                                    </>
                                    :
                                    <>
                                        <div className='current-not-playing'>טוען שיר...</div>
                                    </>
                            }
                        </div>
                    ) : (
                        <div className='current-not-playing'>לא נבחר שיר</div>
                    )}
                </div>
                <input
                    className='range-buffer'
                    type="range"
                    min="0"
                    max="100"
                    value={(trackProgress / trackDuration) * 100 || 0}
                    onChange={handleSeek}
                />
                <div>
                    <span>{formatTime(trackProgress)}</span> / <span>{formatTime(trackDuration)}</span>
                </div>
            </div>
            <div className='player-btns-container'>
                <div className='load-pl-btn-container'>
                    <button
                        className='load-pl-btn'
                        onClick={() => setLoadPlaylist(!loadPlaylist)}
                        onMouseEnter={() => setPopModal(prev => ({ ...prev, playlist: true }))}
                        onMouseLeave={() => setPopModal(prev => ({ ...prev, playlist: false }))}
                    >
                        <img className='player-btns-icons' src={playlistIcon} alt="" />
                        {popModal.playlist && <div className='pop-modal'>טען פלייליסט</div>}
                    </button>
                </div>
                <button
                    className='player-btns'
                    onClick={handlePreviousTrack}
                    onMouseEnter={() => setPopModal(prev => ({ ...prev, previous: true }))}
                    onMouseLeave={() => setPopModal(prev => ({ ...prev, previous: false }))}
                >
                    <img className='player-btns-icons' src={previousIcon} alt="" />
                    {popModal.previous && <div className='pop-modal'>הקודם</div>}
                </button>
                <button
                    className='player-play-btn'
                    onClick={togglePlayPause}
                    onMouseEnter={() => setPopModal(prev => ({ ...prev, play: true }))}
                    onMouseLeave={() => setPopModal(prev => ({ ...prev, play: false }))}
                >
                    {isPaused ? (
                        <img className='play-icon' src={playIcon} alt="" />
                    ) : (
                        <img className='pause-icon' src={pauseIcon} alt="" />
                    )}
                    {popModal.play && <div className='pop-modal'>{isPaused ? 'נגן' : 'עצור'}</div>}
                </button>
                <button
                    className='player-btns'
                    onClick={handleManualNextTrack}
                    onMouseEnter={() => setPopModal(prev => ({ ...prev, next: true }))}
                    onMouseLeave={() => setPopModal(prev => ({ ...prev, next: false }))}
                >
                    <img className='player-btns-icons' src={nextIcon} alt="" />
                    {popModal.next && <div className='pop-modal'>הבא</div>}
                </button>
                <div className='load-pl-btn-container'>
                    <button
                        className='load-pl-btn'
                        onClick={handleDeleteQueue}
                        onMouseEnter={() => setPopModal(prev => ({ ...prev, delQueue: true }))}
                        onMouseLeave={() => setPopModal(prev => ({ ...prev, delQueue: false }))}
                    >
                        <img className='player-btns-icons' src={deleteIcon} alt="" />
                        {popModal.delQueue && <div className='pop-modal'>נקה את תור ההשמעה</div>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpotifyPlayer;