export const getAccessToken = import.meta.env.DEV ? `http://localhost:3001/token/access` : 'https://server-muze.onrender.com/token/access';
export const HOST = import.meta.env.DEV ? "http://localhost:3001/client" : 'https://server-muze.onrender.com/client';
export const searchTrack = `${HOST}/search-track`;
export const getPlaylist = `${HOST}/get-playlist`;
export const sendTrack = `${HOST}/send-track`;