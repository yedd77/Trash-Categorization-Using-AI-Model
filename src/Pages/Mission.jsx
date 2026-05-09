import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { auth } from '../firebase';
import './Mission.css';
import Navbar from '../Components/Navbar/Navbar';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const buildWeekDays = () => {
    const todayIndex = new Date().getDay();

    return dayLabels.map((label, index) => ({
        label,
        status: index === todayIndex ? 'current' : 'empty',
    }));
};

const ShareIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
);

const RecycleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <polyline points="23 20 23 14 17 14" />
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
);

export default function Mission() {
    const [streakCount, setStreakCount] = useState(0);
    const [co2Saved, setCo2Saved] = useState(0);
    const [itemsRecycled, setItemsRecycled] = useState(0);
    const [days] = useState(buildWeekDays);

    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                setStreakCount(0);
                setCo2Saved(0);
                setItemsRecycled(0);
                console.warn('No user is currently signed in.');
                return;
            }

            try {
                const db = getFirestore();
                const userDocRef = doc(db, 'userStats', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) return;

                const data = userDocSnap.data();
                setStreakCount(data.currentStreak || 0);
                setCo2Saved(data.co2Saved || 0);
                setItemsRecycled(data.totalItemsRecycled || 0);
            } catch (error) {
                console.error('Error fetching user stats:', error);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <>
            <Navbar />
            <div className="p-3">
                <p className="fw-bold fs-6 mb-3">Recycle Activities</p>
                <div className="stat-card bg-white d-flex align-items-center justify-content-between px-3 py-3 mb-3">
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                        <div className="stat-icon-wrap text-center">
                            <img src="/fire-lit.png" alt="" className="mission-icon" />
                        </div>
                        <div className="d-flex align-items-center flex-grow-1">
                            <span className="stat-value streak">{streakCount.toLocaleString()}</span>
                            <span className="text-secondary fw-medium" style={{ fontSize: 14, fontWeight: 900 }}>Days Streak</span>
                        </div>
                    </div>
                    <button className="btn btn-link share-btn p-0"><ShareIcon /></button>
                </div>
                <div className="stat-card bg-white d-flex align-items-center justify-content-between px-3 py-3 mb-3">
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                        <div className="stat-icon-wrap text-center fw-bold co2-icon">CO2</div>
                        <div className="d-flex align-items-center flex-grow-1">
                            <span className="stat-value co2">{co2Saved.toFixed(3)}<small style={{ fontSize: 13 }}>Kg</small></span>
                            <span className="text-secondary fw-medium" style={{ fontSize: 14 }}>CO<sup>2</sup> Saved</span>
                        </div>
                    </div>
                    <button className="btn btn-link share-btn p-0"><ShareIcon /></button>
                </div>
                <div className="stat-card bg-white d-flex align-items-center justify-content-between px-3 py-3 mb-3">
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                        <div className="stat-icon-wrap text-center"><RecycleIcon /></div>
                        <div className="d-flex align-items-center flex-grow-1">
                            <span className="stat-value recycle">{itemsRecycled.toLocaleString()}</span>
                            <span className="text-secondary fw-medium" style={{ fontSize: 14 }}>Item Recycled</span>
                        </div>
                    </div>
                    <button className="btn btn-link share-btn p-0"><ShareIcon /></button>
                </div>
                <p className="fw-bold fs-6 mb-3 mt-2">Daily Challenge</p>
                <div className="challenge-card bg-white px-3 py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        {days.map((day) => (
                            <div key={day.label} className="d-flex flex-column align-items-center gap-2">
                                <div className={`day-dot ${day.status}`} />

                                <span
                                    className={day.status === 'current' ? 'active-day' : 'text-secondary'}
                                    style={{ fontSize: 11, fontWeight: 500 }}
                                >
                                    {day.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </>
    );
}