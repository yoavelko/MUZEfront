import { useEffect, useState } from 'react'
import './Loader.css'

function Loader() {

    const [top, setTop] = useState();

    function pxToVh(px) {
        const viewportHeight = window.innerHeight;
        return (px / viewportHeight) * 100;
    }

    useEffect(() => {
        if (document.documentElement.scrollTop > 200) {
            setTop(60);
        } else {
            setTop(50 + pxToVh(document.documentElement.scrollTop))
        }
    },[])

    return (
        <div id='loader-container'>
            <div aria-label="Orange and tan hamster running in a metal wheel" role="img" className="wheel-and-hamster" style={{top: `${top}vh`}}>
                <div className="wheel"></div>
                <div className="hamster">
                    <div className="hamster__body">
                        <div className="hamster__head">
                            <div className="hamster__ear"></div>
                            <div className="hamster__eye"></div>
                            <div className="hamster__nose"></div>
                        </div>
                        <div className="hamster__limb hamster__limb--fr"></div>
                        <div className="hamster__limb hamster__limb--fl"></div>
                        <div className="hamster__limb hamster__limb--br"></div>
                        <div className="hamster__limb hamster__limb--bl"></div>
                        <div className="hamster__tail"></div>
                    </div>
                </div>
                <div className="spoke"></div>
            </div>
        </div>
    )
}

export default Loader