import React, { use, useEffect, useState } from 'react'
import AdminNavbar from './Components/AdminNavbar'
import Sidebar from './Components/sidebar'
import { getFirestore, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../../firebase'
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

const Point = () => {
  // set state variables
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [totalPointDistributed, setTotalPointDistributed] = useState(0);
  const [totalPointClaimed, setTotalPointClaimed] = useState(0);
  const [totalPendingPoints, setTotalPendingPoints] = useState(0);
  const [totalPointExpired, setTotalPointExpired] = useState(0);
  const [pointsCardClicked, setPointsCardClicked] = useState(true);
  const [claimedCardClicked, setClaimedCardClicked] = useState(false);
  const [pendingCardClicked, setPendingCardClicked] = useState(false);
  const [expiredCardClicked, setExpiredCardClicked] = useState(false);
  const [pointsData, setPointsData] = useState([]);
  const [claimedPointsData, setClaimedPointsData] = useState([]);
  const [pendingPointsData, setPendingPointsData] = useState([]);
  const [expiredPointsData, setExpiredPointsData] = useState([]);

  //handle the toggle of the table
  const handlePointsCardClick = () => {
    setPointsCardClicked(true);
    setClaimedCardClicked(false);
    setPendingCardClicked(false);
    setExpiredCardClicked(false);
  };

  const handleClaimedCardClick = () => {
    setPointsCardClicked(false);
    setClaimedCardClicked(true);
    setPendingCardClicked(false);
    setExpiredCardClicked(false);
  };

  const handlePendingCardClick = () => {
    setPointsCardClicked(false);
    setClaimedCardClicked(false);
    setPendingCardClicked(true);
    setExpiredCardClicked(false);
  };

  const handleExpiredCardClick = () => {
    setPointsCardClicked(false);
    setClaimedCardClicked(false);
    setPendingCardClicked(false);
    setExpiredCardClicked(true);
  };

  // Function to handle the toggle of the sidebar
  // Function to handle sidebar toggle
  useEffect(() => {
    document.body.classList.toggle("sidebar-collapse", isCollapsed);
  }, [isCollapsed]);

  // Fetching data for top card
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
        where("expiresAt", "<=", new Date())
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

  useEffect(() => {

    // fetch points data
    const fetchPointsData = async () => {
      const db = getFirestore();

      const pointsQuery = query(
        collection(db, 'Points'),
      );

      try {
        const querySnapshot = await getDocs(pointsQuery);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPointsData(data);
      } catch (error) {
        console.error("Error fetching points data: ", error);
      }
    };
    fetchPointsData();

    // Fetch claimed points data
    const fetchClaimedPointsData = async () => {
      const db = getFirestore();

      const claimedPointsQuery = query(
        collection(db, 'Points'),
        where("isClaimed", '==', true)
      );

      try {
        const querySnapshot = await getDocs(claimedPointsQuery);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClaimedPointsData(data);

      } catch (error) {
        console.error("Error fetching claimed points data: ", error);
      }
    };
    fetchClaimedPointsData();

    // Fetch pending points data
    const fetchPendingPointsData = async () => {
      const db = getFirestore();

      const pendingPointsQuery = query(
        collection(db, 'Points'),
        where("isClaimed", '==', false),
        where("isExpired", '==', false)
      );

      try {
        const querySnapshot = await getDocs(pendingPointsQuery);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPendingPointsData(data);

      } catch (error) {
        console.error("Error fetching pending points data: ", error);
      }
    }
    fetchPendingPointsData();

    // Fetch expired points data
    const fetchExpiredPointsData = async () => {
      const db = getFirestore();

      const expiredPointsQuery = query(
        collection(db, 'Points'),
        where("expiresAt", "<=", new Date()),
        where("isClaimed", '==', false)
      );

      try {
        const querySnapshot = await getDocs(expiredPointsQuery);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setExpiredPointsData(data);

      } catch (error) {
        console.error("Error fetching expired points data: ", error);
      }
    }
    fetchExpiredPointsData();
  }, []);

  //this function calculates the time left for a point to expire
  function getTimeLeft(expiresAt) {
    if (!expiresAt || !expiresAt.toDate) return '';
    const now = new Date();
    const expireDate = expiresAt.toDate();
    const diffMs = expireDate - now;

    if (diffMs <= 0) return 'Expired';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m left`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ${diffSeconds}s left`;
    } else {
      return `${diffSeconds}s left`;
    }
  }

  useEffect(() => {

    //update the document field with query to search documents with isExpires false
    const updateExpiredPoints = async () => {
      const db = getFirestore();
      const now = new Date();

      const expiredQuery = query(
        collection(db, 'Points'),
        where("expiresAt", "<=", now),
        where("isExpired", "==", false)
      );

      try {
        const querySnapshot = await getDocs(expiredQuery);
        querySnapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, { isExpired: true });
        });
      } catch (error) {
        console.error("Error updating expired points: ", error);
      }
    };
    updateExpiredPoints();
  }, []);

  return (
    <>
      <div className="app-wrapper">
        <AdminNavbar toggleSidebar={() => setIsCollapsed(prev => !prev)} />
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
                <div 
                className="col-12 col-sm-6 col-md-3"
                onClick={handlePointsCardClick}
                style={{ cursor: 'pointer' }}>
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
                <div 
                className="col-12 col-sm-6 col-md-3"
                onClick={handleClaimedCardClick}
                style={{ cursor: 'pointer' }}>
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
                <div 
                className="col-12 col-sm-6 col-md-3"
                onClick={handlePendingCardClick}
                style={{ cursor: 'pointer' }}>
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
                <div 
                className="col-12 col-sm-6 col-md-3"
                onClick={handleExpiredCardClick}
                style={{ cursor: 'pointer' }}>
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
              {pointsCardClicked && (
                <div className="row mb-3">
                <div className="col-12">
                  <div className="card card-outline card-primary">
                    <div className="card-header">
                      <h3 className="card-title">Points Distribution History</h3>
                    </div>
                    <div className="card-body">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>No</th>
                            <th>User</th>
                            <th>Points</th>
                            <th>Trash Type</th>
                            <th>Scanned Date</th>
                            <th>Scanned Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pointsData.map((item) => (
                            <tr key={item.id}>
                              <td>{pointsData.indexOf(item) + 1}</td>
                              <td>{item.username}</td>
                              <td>{item.points}</td>
                              <td>{item.itemType}</td>
                              <td>{item.createdAt && item.createdAt.toDate ? item.createdAt.toDate().toLocaleDateString() : ''}</td>
                              <td>{item.createdAt && item.createdAt.toDate ? item.createdAt.toDate().toLocaleTimeString() : ''}</td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan={6} className='text-center' disabled>Showing {pointsData.length} record{pointsData.length !== 1 ? 's' : ''} from database</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              )}
              {claimedCardClicked && (
                <div className="row mb-3">
                <div className="col-12">
                  <div className="card card-outline card-info">
                    <div className="card-header">
                      <h3 className="card-title">Point Claims History</h3>
                    </div>
                    <div className="card-body">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>No</th>
                            <th>User</th>
                            <th>Points</th>
                            <th>Trash Type</th>
                            <th>Claimed Date</th>
                            <th>Claimed Time</th>
                          </tr>

                        </thead>
                        <tbody>
                          {claimedPointsData.map((item) => (
                            <tr key={item.id}>
                              <td>{claimedPointsData.indexOf(item) + 1}</td>
                              <td>{item.username}</td>
                              <td>{item.points}</td>
                              <td>{item.itemType}</td>
                              <td>{item.claimedAt && item.claimedAt.toDate ? item.claimedAt.toDate().toLocaleDateString() : ''}</td>
                              <td>{item.claimedAt && item.claimedAt.toDate ? item.claimedAt.toDate().toLocaleTimeString() : ''}</td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan={6} className='text-center' disabled>Showing {claimedPointsData.length} record{claimedPointsData.length !== 1 ? 's' : ''} from database</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              )}
              {pendingCardClicked && (
                <div className="row mb-3">
                <div className="col-12">
                  <div className="card card-outline card-warning">
                    <div className="card-header">
                      <h3 className="card-title">Pending Points History</h3>
                    </div>
                    <div className="card-body">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>No</th>
                            <th>User</th>
                            <th>Points</th>
                            <th>Trash Type</th>
                            <th>Scanned Date</th>
                            <th>Scanned Time</th>
                            <th>Expired in</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingPointsData.map((item) => (
                            <tr key={item.id}>
                              <td>{pendingPointsData.indexOf(item) + 1}</td>
                              <td>{item.username}</td>
                              <td>{item.points}</td>
                              <td>{item.itemType}</td>
                              <td>{item.createdAt && item.createdAt.toDate ? item.createdAt.toDate().toLocaleDateString() : ''}</td>
                              <td>{item.createdAt && item.createdAt.toDate ? item.createdAt.toDate().toLocaleTimeString() : ''}</td>
                              <td>{getTimeLeft(item.expiresAt)}</td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan={7} className='text-center' disabled>Showing {pendingPointsData.length} record{pendingPointsData.length !== 1 ? 's' : ''} from database</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              )}
              {expiredCardClicked && (
                <div className="row mb-3">
                <div className="col-12">
                  <div className="card card-outline card-danger">
                    <div className="card-header">
                      <h3 className="card-title">Expired Points History</h3>
                    </div>
                    <div className="card-body">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>No</th>
                            <th>User</th>
                            <th>Points</th>
                            <th>Trash Type</th>
                            <th>Scanned Date</th>
                            <th>Scanned Time</th>
                            <th>Expired Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expiredPointsData.map((item) => (
                            <tr key={item.id}>
                              <td>{expiredPointsData.indexOf(item) + 1}</td>
                              <td>{item.username}</td>
                              <td>{item.points}</td>
                              <td>{item.itemType}</td>
                              <td>{item.createdAt && item.createdAt.toDate ? item.createdAt.toDate().toLocaleDateString() : ''}</td>
                              <td>{item.createdAt && item.createdAt.toDate ? item.createdAt.toDate().toLocaleTimeString() : ''}</td>
                              <td>{item.expiresAt && item.expiresAt.toDate ? item.expiresAt.toDate().toLocaleTimeString() : ''}</td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan={7} className='text-center' disabled>Showing {expiredPointsData.length} record{expiredPointsData.length !== 1 ? 's' : ''} from database</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default Point