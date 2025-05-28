import React, { useEffect, useState } from 'react'
import AdminNavbar from './Components/AdminNavbar'
import Sidebar from './Components/sidebar'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../../firebase'

const Point = () => {

  // set state variables
  const [totalPointDistributed, setTotalPointDistributed] = useState(0);
  const [totalPointClaimed, setTotalPointClaimed] = useState(0);
  const [totalPendingPoints, setTotalPendingPoints] = useState(0);
  const [totalPointExpired, setTotalPointExpired] = useState(0);


  useEffect(() => {

    // Fetch total points distributed from Firestore
    const fetchPointsData = async () => {
      const db = getFirestore();
      const pointRef = collection(db, 'Points');

      try {
        const snapShot = await getDocs(pointRef);
        let distributed = 0;
        snapShot.forEach(doc => {
          const data = doc.data();

          distributed += data.points || 0;
        });

        setTotalPointDistributed(distributed);
      } catch (error) {
        console.error("Error fetching points data: ", error);
      }
    };
    fetchPointsData();

    // fetch total points claimed
    const fetchClaimedPoints = async () => {
      const db = getFirestore();
      const claimedRef = query(
        collection(db, 'Points'),
        where("isClaimed", '==', true) 
      );

      try {
        const snapShot = await getDocs(claimedRef);
        let claimed = 0;
        snapShot.forEach(doc => {
          const data = doc.data();

          claimed += data.points || 0;
        });

        setTotalPointClaimed(claimed);
      } catch (error) {
        console.error("Error fetching claimed points: ", error);
      }
    };
    fetchClaimedPoints();

    // Fetch total pending points
    const fetchPendingPoints = async () => {
      const db = getFirestore();
      const pendingRef = query(
        collection(db, 'Points'),
        where("isClaimed", '==', false),
        where("isExpired", '==', false)
      );

      try {
        const snapShot = await getDocs(pendingRef);
        let pending = 0;
        snapShot.forEach(doc => {
          const data = doc.data();

          pending += data.points || 0;
        });

        setTotalPendingPoints(pending);
      } catch (error) {
        console.error("Error fetching pending points: ", error);
      }
    };
    fetchPendingPoints();

    // Fetch total expired points
    const fetchExpiredPoints = async () => {
      const db = getFirestore();
      const expiredRef = query(
        collection(db, 'Points'),
        where("isExpired", '==', true)
      );

      try {
        const snapShot = await getDocs(expiredRef);
        let expired = 0;
        snapShot.forEach(doc => {
          const data = doc.data();

          expired += data.points || 0;
        });

        setTotalPointExpired(expired);
      } catch (error) {
        console.error("Error fetching expired points: ", error);
      }
    };
    fetchExpiredPoints();

  }, []);

  return (
    <>
      <div className="app-wrapper">
        <AdminNavbar />
        <Sidebar />
        <main className="app-main">
          <div className="app-content-header">
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm-6">
                  <h3 className="mb-0">Point Distribution</h3>
                </div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-end">
                    <li className="breadcrumb-item">Dashboard</li>
                    <li className="breadcrumb-item">Point Distribution</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          <div className="app-content">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="info-box shadow-sm">
                    <span className="info-box-icon text-bg-primary shadow-sm">
                      <i className="bi bi-trash"></i>
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">Total Point Distributed</span>
                      <span className="info-box-number">
                        {totalPointDistributed}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="info-box shadow-sm">
                    <span className="info-box-icon text-bg-info shadow-sm">
                      <i className="bi bi-trash"></i>
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">Total Point Claimed</span>
                      <span className="info-box-number">
                        {totalPointClaimed}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="info-box shadow-sm">
                    <span className="info-box-icon text-bg-warning shadow-sm">
                      <i className="bi bi-trash"></i>
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">Total Pending Points</span>
                      <span className="info-box-number">
                        {totalPendingPoints}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="info-box shadow-sm">
                    <span className="info-box-icon text-bg-danger shadow-sm">
                      <i className="bi bi-trash"></i>
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">Total Point Expired</span>
                      <span className="info-box-number">
                        {totalPointExpired}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <p>Points</p>
      </div>
    </>
  )
}

export default Point