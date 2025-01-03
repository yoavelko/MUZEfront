import { useState } from 'react';
import axios from 'axios';
import './SearchBar.css';
import { searchTrack, getAccessToken } from '../../../utils/ClientRoutes';

function SearchBar({ setLoader, setData, setIsSearch, setIsr }) {
    const [input, setInput] = useState('');

    async function handleKeyDown(e) {
        if (e.key === 'Enter') {
            await handleSearch();
        }
    }

    async function handleSearch() {
        if (input === '') {
            alert('לא ניתנו ערכי חיפוש')
        }
        else {
            setLoader(true);
            try {
                // Fetch the access token first
                const tokenResponse = await axios.post(getAccessToken);
                const accessToken = tokenResponse.data.token; // Adjust based on your response structure

                // Now use the token to search for the track
                const searchResponse = await axios.post(searchTrack, {
                    trackName: input,
                    token: accessToken
                });

                // setTimeout(() => {
                //     if (document.documentElement.scrollTop > 200) {
                //         window.scrollTo({ top: 200, behavior: 'auto' });
                //     } else {
                //         window.scrollTo(document.documentElement.scrollTop);
                //     }
                // }, 1);

                setData(searchResponse.data.tracks);
                setIsr(undefined);
                setIsSearch(true);
                setLoader(false);
            } catch (err) {
                console.error('Error during search:', err);
                setLoader(false);
            }
        }
    }

    return (
        <div className='search-bar-container'>
            <input
                className='search-input'
                type="text"
                placeholder='חפש...'
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button className='search-button' onClick={handleSearch}>
                <img id='search-logo' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFW0lEQVR4nO2dXYhVVRTHVwONBpEmvWQWk1lWlhGWFvSB1mO92VigzzomaVL0KGgDPuhToE499EUP2VBaPWgJWYRofhXEjGNY5kgv0mRJk/PQ/GJz14BDePa+99y5Z+199w8uDMP9WOv+zz57r73WXlckk8lkMplMJpMwwF3AKqAX+Aj4ATgDjABj+hjR/32vz+nV19xZtf3RA0wHuoH3gPOUZxh4F3jOvXfV/kUD8DDwFnCRqeMP4E3goar9NQvwGPAZredb4Nmq/TcDMB84QPXsd/OUtPkc0auTsRUuA1vabo7RFdNJ7PIjsEDaAeAF4BL2+QtYISkDvAaMl/iSBoAdwBpgKTAXuBG4Vh/u7zuAZfqcncBgic9ztr4qqQFcA2xv8Es5BqwHbi7x+bOBDcDxBm3Y5nyQVGhADHdlfuJikimwZTGwp4GRuk0Suk3VwyHgwRbYtQg4XKdtr0gCE3jolfg3sLqVtwagA+gBRgNtdL50S8QB36U6lpn3VmjrfbpgCOFPYJ5EGPSdCHTwK2CGAZuvB74ItNntNF8nsaAReAhucp0mti6kvYG2b5YYcLkH3YIIGRnmtiiAzsCR4rZ85ot1gC8D54wbxCjAjMA5ZZ9YRqNnH/8AC8U4wAJd+fl4XKwSONRXSyQAawP82S+GM30hQV+HRAK1OOVIgF/2Mo+aEvUFVVMegTcb92UHBLd9YgldLro8dREfS6TgTy1fNBWXaHWIj6ZvFLYKYEmAf8vFCsD7HmOPSuTgz3C+I1bQmqciXpLIATZ6fDwnhvLjRbgJcbZEDjAHP9VXSGqpZhEDkgjAkMfXlTFsJO6QRAB2eXzdYsHI/lQi8yZE7h9KBKuPpZIIwFMeX09YMPKsx8guSQRqZUdF/GzByN89Rs6SRABu8vh6wYKRvtrcTkkEYJrH18tV25gFmcxY1XrkW9ZkRiwI8gvFtNOkPhzDsneZJALwtPlN1IDAcI0kAvCix9fdFox83WPkTkkEoM/j69YYNhcHJRGA0x5fu60Uxvm4RSIHuDXAz65YElQbJP0E1XmxgnZbKOK4RA61dh1F7BIraLsKH4slUoBHAvx7RiIrA9ojkQJ87vHtgqUq/noK5RZJZFA7k+grlNsuRiv8fByOsJT0qMenf4G7xSLaL8RHj0QCsC7An36xCvBk4HGEB8Q41M4djkZ/Gw4cJQMWzhVeDWAmcCrAjw/EOu6Eqo4CHweNHmmbDnwT2Asljh0IbXEUwl5LolAT49NA29dLZLnn0L4iBy3cvqjdpr4OtPlATKvFKzcd3bAmcE65v0JbFwbOGXEfrdBzI6GtNUa1MrCjxXHGujpaa0wwWKY7UaW4flN1OnukFWf2qEXgvqAvWVFcv6l6GNfJdckU2PKo7k2VaaQ2wakoRdEGZvWKMoEronjZnc+QcsmljQFb6I2KEuf5F9dvquSVOaR57R4tfHYxzyxth9Gpf8/T6pC1+lxf2pV2F6VbWxylxlDMonQ10M0tBk5HE71fJXjcHNg5qFWMAr81YaTEKcoVAeQ+qqdfR25XQHlsuiNlAuCJCoQZ1yXwpMg7i/L/zGNfQI6+DO693wDuKbhAmjFSfiqzXDeF7rwu1x9hOUd5hoG33U9ThBYkZFH8c81KrSXerbvJZ/RI3Zjmtkd0Uv5OGzFvBZ4vc6A/i2IQ4DYVvwxnzZSapgBZlKRFub1qX5KBLIo9yKLYgyyKPZokyq95TmkiWZS0RZlbtS/JQBbFHk3aZnGvn1m1L8lA+ZGyqWofkoPGRcliGBIli2FIlCyGIVGyGIZEyWIYEiWLYUiULIYVctCXyWQymUwmIwb5D/AHzveEXmuvAAAAAElFTkSuQmCC" />
            </button>
        </div>
    );
}

export default SearchBar;
