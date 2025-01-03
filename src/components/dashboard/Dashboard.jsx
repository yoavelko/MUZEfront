import { useState } from 'react';
import './Dashboard.css'
import Calander from './calander/Calander';

function Dashboard() {

    const [currentNav, setCurrentNav] = useState('calander');

    return (
        <div className='dashboard-container'>
            <div className='dash-header-container'>
                <div className='dash-header'>ניהול אפליקציה</div>
            </div>
            <div className='dash-body-container'>
                <div className='dash-navbar'>
                    <button
                        className={currentNav === 'calander' ? 'picked-dash-navbar-btn' : 'dash-navbar-btn'}
                        onClick={() => setCurrentNav('calander')}
                    >לוח שנה
                    </button>
                    <button
                        className={currentNav === 'statistics' ? 'picked-dash-navbar-btn' : 'dash-navbar-btn'}
                        onClick={() => setCurrentNav('statistics')}
                    >סטטיסטיקות
                    </button>
                    <button
                        className={currentNav === 'playlist' ? 'picked-dash-navbar-btn' : 'dash-navbar-btn'}
                        onClick={() => setCurrentNav('playlist')}
                    >פלייליסטים
                    </button>
                </div>
                <div className='dash-body'>
                    {
                        currentNav === 'calander' ?
                        <Calander />
                        : currentNav === 'statistics' ?
                        <div>statistics</div>
                        : currentNav === 'playlist' &&
                        <div>playlist</div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Dashboard;