export const HOST = import.meta.env.DEV ? "http://localhost:3001/statistics" : 'https://server-muze.onrender.com/statistics';
export const getMostPlayed = `${HOST}/get-most-played`;