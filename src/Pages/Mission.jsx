import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { auth } from '../firebase';
import './Mission.css';
import Navbar from '../Components/Navbar/Navbar';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getMalaysianDateString = (date = new Date()) => {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kuala_Lumpur',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
};

const getStartOfWeek = (date = new Date()) => {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
};

const getEndOfWeek = (startOfWeek) => {
    const end = new Date(startOfWeek);
    end.setDate(end.getDate() + 7);
    return end;
};

const buildWeekDays = () => {
    const now = new Date();
    const todayString = getMalaysianDateString(now);
    const startOfWeek = getStartOfWeek(now);

    return dayLabels.map((label, index) => {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(currentDate.getDate() + index);

        const dateString = getMalaysianDateString(currentDate);

        let status = 'upcoming';

        if (dateString === todayString) {
            status = 'current';
        } else if (dateString < todayString) {
            status = 'missed';
        }

        return {
            label,
            date: dateString,
            status,
        };
    });
};

const getWeeklyChallengeStatus = async (uid) => {
    const db = getFirestore();

    const now = new Date();
    const todayString = getMalaysianDateString(now);

    const startOfWeek = getStartOfWeek(now);
    const endOfWeek = getEndOfWeek(startOfWeek);

    const pointsRef = collection(db, 'Points');

    const q = query(
        pointsRef,
        where('uid', '==', uid),
        where('isClaimed', '==', true),
        where('claimedAt', '>=', Timestamp.fromDate(startOfWeek)),
        where('claimedAt', '<', Timestamp.fromDate(endOfWeek))
    );

    const pointsSnap = await getDocs(q);

    const disposedDateSet = new Set();

    pointsSnap.forEach((docSnap) => {
        const data = docSnap.data();

        if (!data.claimedAt) return;

        const claimedDate = getMalaysianDateString(data.claimedAt.toDate());
        disposedDateSet.add(claimedDate);
    });

    const weekDays = dayLabels.map((label, index) => {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + index);

        const dateString = getMalaysianDateString(currentDate);

        let status = 'empty';

        if (disposedDateSet.has(dateString)) {
            status = 'done';
        } else if (dateString === todayString) {
            status = 'current';
        } else if (dateString < todayString) {
            status = 'missed';
        } else {
            status = 'empty';
        }

        return {
            label,
            date: dateString,
            status,
        };
    });

    return weekDays;
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
    const [days, setDays] = useState(buildWeekDays);

    const auth = getAuth();
    const user = auth.currentUser;
    const [streakBool, setStreakBool] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                setStreakCount(0);
                setCo2Saved(0);
                setItemsRecycled(0);
                setDays(buildWeekDays());
                console.warn('No user is currently signed in.');
                return;
            }

            try {
                const db = getFirestore();

                const userDocRef = doc(db, 'userStats', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const data = userDocSnap.data();

                    //streak calculator
                    if (data.lastDisposeDate === getMalaysianDateString()) {
                        setStreakBool(true);
                    } else {
                        setStreakBool(false);
                    }
                    setStreakCount(data.currentStreak || 0);
                    setCo2Saved(data.co2Saved || 0);
                    setItemsRecycled(data.totalItemsRecycled || 0);
                } else {
                    setStreakCount(0);
                    setCo2Saved(0);
                    setItemsRecycled(0);
                }

                const weeklyDays = await getWeeklyChallengeStatus(currentUser.uid);
                setDays(weeklyDays);

            } catch (error) {
                console.error('Error fetching mission data:', error);
            }
        });

        return () => unsubscribe();
    }, []);
    
    const handleShare = async (title, description) => {
        try {
            await navigator.share({
                title : title,
                text : description,
                url : 'https://binbuddy.my'
            });
            return;
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };
    
    return (
        <>
            <Navbar />
            <div className="p-3">
                <p className="fw-bold fs-6 mb-3">Recycle Activities</p>
                <div className="stat-card bg-white d-flex align-items-center justify-content-between px-3 py-3 mb-3">
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                        <div className="stat-icon-wrap text-center">
                            {streakBool === false ?
                                <img src="/fire-dim.png" alt="" className="mission-icon" />
                                :
                                <img src="/fire-lit.png" alt="" className="mission-icon" />
                            }

                        </div>
                        <div className="d-flex align-items-center flex-grow-1">
                            <span className="stat-value streak">{streakCount.toLocaleString()}</span>
                            <span className="text-secondary fw-medium" style={{ fontSize: 14, fontWeight: 900 }}>Days Streak</span>
                        </div>
                    </div>
                    <button className="btn btn-link share-btn p-0" onClick={() => handleShare("My Recycling Streak", `I've maintained a ${streakCount}-day recycling streak! Join me in making a difference.`)}>
                        <ShareIcon />
                    </button>
                </div>
                <div className="stat-card bg-white d-flex align-items-center justify-content-between px-3 py-3 mb-3">
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                        <div className="stat-icon-wrap text-center fw-bold co2-icon">CO2</div>
                        <div className="d-flex align-items-center flex-grow-1">
                            <span className="stat-value co2">{co2Saved.toFixed(3)}<small style={{ fontSize: 13 }}>Kg</small></span>
                            <span className="text-secondary fw-medium" style={{ fontSize: 14 }}>CO<sup>2</sup> Saved</span>
                        </div>
                    </div>
                    <button className="btn btn-link share-btn p-0 " onClick={() => handleShare("My CO2 Savings", `I've saved ${co2Saved.toFixed(3)}kg of CO2 through recycling! Join me in making a difference.`)}>
                        <ShareIcon />
                    </button>
                </div>
                <div className="stat-card bg-white d-flex align-items-center justify-content-between px-3 py-3 mb-3">
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                        <div className="stat-icon-wrap text-center"><RecycleIcon /></div>
                        <div className="d-flex align-items-center flex-grow-1">
                            <span className="stat-value recycle">{itemsRecycled.toLocaleString()}</span>
                            <span className="text-secondary fw-medium" style={{ fontSize: 14 }}>Item Recycled</span>
                        </div>
                    </div>
                    <button className="btn btn-link share-btn p-0" onClick={() => handleShare("My Recycling Achievements", `I've recycled ${itemsRecycled.toLocaleString()} items! Join me in making a difference.`)}>
                        <ShareIcon />
                    </button>
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