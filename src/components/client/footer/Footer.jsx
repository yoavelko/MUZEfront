import './Footer.css';
import { useState, useEffect } from 'react';
import iconLocationHollow from '../../../media/footer/icon-location-hollow.png'
import iconLocationFill from '../../../media/footer/icon-location-fill.png'
import iconWorldHollow from '../../../media/footer/icon-world-hollow.png'
import iconWorldFill from '../../../media/footer/icon-world-fill.png'
import iconWaveHollow from '../../../media/footer/icon-wave-hollow.png'
import iconWaveFill from '../../../media/footer/icon-wave-fill.png'

function Footer({ isr, setIsr, isSearch, setIsSearch }) {
    const [color, setColor] = useState({
        israel: 'purple',
        global: 'black',
        aroundHere: 'black'
    });

    function handleClick(e) {
        setIsSearch(false);
        const value = e.target.value;
        if (value === 'Israel') {
            setIsr('israel');
            setColor({
                israel: 'purple',
                global: 'black',
                aroundHere: 'black'
            });
        } else if (value === 'Global') {
            setIsr('global');
            setColor({
                israel: 'black',
                global: 'purple',
                aroundHere: 'black'
            });
        } else if (value === 'Around Here') {
            setIsr('around');
            setColor({
                israel: 'black',
                global: 'black',
                aroundHere: 'purple'
            });
        }
    }

    useEffect(() => {
        if (isSearch) {
            setColor({
                israel: 'black',
                global: 'black',
                aroundHere: 'black'
            })
        }
    }, [isSearch])

    return (
        <div id="footer-container">
            <div className='color-container'>
                <div className="footer-buttons-container">
                    <div className={`footer-each-btn-container ${color.israel === 'purple' ? 'selected' : ''}`}>
                        <img
                            src={color.israel === 'purple' ? iconLocationFill : iconLocationHollow}
                            className='footer-icon'
                        />
                        <button
                            className={`footer-buttons ${color.israel === 'purple' ? 'selected' : ''}`}
                            onClick={(e) => handleClick(e)}
                            value="Israel"
                        >
                            Israel
                        </button>
                    </div>
                    <div className={`footer-each-btn-container ${color.global === 'purple' ? 'selected' : ''}`}>
                        <img
                            src={color.global === 'purple' ? iconWorldFill : iconWorldHollow}
                            className='footer-icon'
                        />
                        <button
                            className={`footer-buttons ${color.global === 'purple' ? 'selected' : ''}`}
                            onClick={(e) => handleClick(e)}
                            value="Global"
                        >
                            Global
                        </button>
                    </div>
                    <div className={`footer-each-btn-container ${color.aroundHere === 'purple' ? 'selected' : ''}`}>
                        <img
                            src={color.aroundHere === 'purple' ? iconWaveFill : iconWaveHollow}
                            className='footer-icon'
                        />
                        <button
                            className={`footer-buttons ${color.aroundHere === 'purple' ? 'selected' : ''}`}
                            onClick={(e) => handleClick(e)}
                            value="Around Here"
                        >
                            MUZE
                        </button>
                    </div>
                </div>
                <div className='powered-by'>© Powered by MUZE</div>
            </div>
        </div>
    );
}

export default Footer;
