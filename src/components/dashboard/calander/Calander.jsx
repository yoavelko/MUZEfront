import { useState } from 'react';
import './Calander.css'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { getSpecificHistory } from '../../../utils/AdminRoutes';
import { createPlaylist } from '../../../utils/AdminRoutes';

function Calander() {

    const [value, setValue] = useState(new Date());
    const [datePlaylist, setDatePlaylist] = useState(null);
    const [fullDate, setFullDate] = useState(null);

    async function handleSetDate(newValue) {

        setValue(newValue);
        setFullDate(newValue.toLocaleDateString('en-GB'));

        const day = newValue.getDate().toString();
        const month = (newValue.getMonth() + 1).toString();
        const year = newValue.getFullYear().toString();

        try {
            const response = await axios.post(getSpecificHistory, { day: day, month: month, year: year });
            setDatePlaylist(response.data)

        } catch (error) {
            setDatePlaylist([{ name: null }]);
        }
    }

    async function handleExportPL() {
        
        const playlistName = window.prompt('נא הכנס שם לפלייליסט:');
        
        await axios.post(createPlaylist, {
            name: playlistName,
            tracks: datePlaylist,
            isSpotifyPl: false
        })
    }

    return (
        <div className='calendar-container'>
            <div className='calendar-component-container'>
                <Calendar onChange={handleSetDate} value={value} calendarType='hebrew' />
            </div>
            {
                datePlaylist ?
                    <div className='specific-date-playlist-container'>
                        <div className='specific-date-playlist-header'>:{fullDate} התנגן בתאריך</div>
                        <button className='export-pl-btn' onClick={handleExportPL}>יצוא פלייליסט</button>
                        {
                            datePlaylist.map((value, index) => (
                                <div className='specific-date-track' key={index}>
                                    {
                                        value.name ?
                                            <>
                                                <div>{value.artist} - {value.name}</div>
                                                <div>&nbsp;&nbsp;-&nbsp;&nbsp;</div>
                                                <div className='specific-date-track-time'>{value.timePlayed}</div>
                                            </>
                                        :
                                        <div>אין היסטוריה בתאריך הנבחר</div>
                                    }
                                </div>
                            ))
                        }
                    </div>
                    :
                    <div className='specific-date-playlist-container'>לא נבחר תאריך</div>
            }
        </div>
    )
}

export default Calander