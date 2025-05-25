import React, { use } from 'react'
import AdminNavbar from './Components/AdminNavbar'
import Sidebar from './Components/sidebar'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, getDocs, doc, setDoc, getCountFromServer, query, where, updateDoc, deleteDoc } from 'firebase/firestore'
import { getFunctions, httpsCallable } from "firebase/functions";

const Dashboard = () => {

  // State to hold data
  const [stationCount, setStationCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Function to fetch stations data
  useEffect(() => {
    // Fetching the count of stations from Firestore
    const countStation = async () => {
      const coll = collection(db, "Station");
      const snapshot = await getCountFromServer(coll);
      const count = snapshot.data().count;
      setStationCount(count);
    }
    countStation();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          "https://us-central1-bin-buddy-v1.cloudfunctions.net/getUserCount"
        );
        const data = await res.json();
        setUserCount(data.userCount);
      } catch (err) {
        setError("Error fetching user count.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <div className="app-wrapper">
        <AdminNavbar />
        <Sidebar />
        <div className="app-main">
          <div className="app-content-header">
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm-6">
                  <h3 className="mb-0">Dashboard</h3>
                </div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-end">
                    <li className="breadcrumb-item active">Dashboard</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          <div className="app-content">
            <div className="container-fluid">
              <div className="row">
                <div className="col-lg-3 col-6">
                  <div className="small-box text-bg-success">
                    <div className="inner" style={{ color: '#fff' }}>
                      <h3 className='fw-semibold'>{stationCount}</h3>
                      <p>Total Stations</p>
                    </div>
                    <Link to="/admin/dashboard/station" className="small-box-footer link-light link-underline-opacity-0 link-underline-opacity-50-hover">
                      <i className="bi bi-link-45deg"></i>
                      More info
                    </Link>
                  </div>
                </div>
                <div className="col-lg-3 col-6">
                  <div className="small-box text-bg-info">
                    <div className="inner" style={{ color: '#fff' }}>
                      {loading && <h3>Loading...</h3>}
                      {error && <h3 className="fw-semibold">{error}</h3>}
                      {!loading && !error && <h3>{userCount}</h3>}
                      <p>Total Users</p>
                    </div>
                    <Link to="/admin/dashboard/users" className="small-box-footer link-light link-underline-opacity-0 link-underline-opacity-50-hover">
                      <i className="bi bi-link-45deg"></i>
                      More info
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard