import React, { useState, useEffect, use } from 'react'
import AdminNavbar from './Components/AdminNavbar'
import Sidebar from './Components/sidebar'
import { collection, getDocs, doc, setDoc, getCountFromServer, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { Link } from 'react-router-dom'


const Station = () => {

  // State variables
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stationCount, setStationCount] = useState(0);
  const [inactiveStationCount, setInactiveStationCount] = useState(0);
  const [activeStationCount, setActiveStationCount] = useState(0);
  const [brokenStationCount, setBrokenStationCount] = useState(0);
  const [stations, setStations] = useState([]);

  // function to fetch station from Firestore
  useEffect(() => {

    // Fetching the count of stations from Firestore
    const countStation = async () => {
      const coll = collection(db, "Station");
      const snapshot = await getCountFromServer(coll);
      const count = snapshot.data().count;
      setStationCount(count);
    }
    countStation();

    // Fetching the count of inactive stations from Firestore
    const countInactiveStation = async () => {
      const stationRef = collection(db, "Station");
      const q = query(stationRef, where("stationStatus", "==", "inactive"));
      const snapshot = await getCountFromServer(q);
      const count = snapshot.data().count;
      setInactiveStationCount(count);
    }
    countInactiveStation();

    // Fetching the count of active stations from Firestore
    const countActiveStation = async () => {
      const stationRef = collection(db, "Station");
      const q = query(stationRef, where("stationStatus", "==", "active"));
      const snapshot = await getCountFromServer(q);
      const count = snapshot.data().count;
      setActiveStationCount(count);
    }
    countActiveStation();

    // Fetching the count of broken stations from Firestore
    const countBrokenStation = async () => {
      const stationRef = collection(db, "Station");
      const q = query(stationRef, where("stationStatus", "==", "broken"));
      const snapshot = await getCountFromServer(q);
      const count = snapshot.data().count;
      setBrokenStationCount(count);
    }
    countBrokenStation();
  }, []);

  // Function to handle the toggle of the sidebar
  // Function to handle sidebar toggle
  useEffect(() => {
    document.body.classList.toggle("sidebar-collapse", isCollapsed);
  }, [isCollapsed]);

  // Function to fetch stations from Firestore
  useEffect(() => {
    const fetchStations = async () => {
      const stationRef = collection(db, "Station");
      const snapshot = await getDocs(stationRef);
      const stationList = snapshot.docs.map((doc) => doc.data());
      setStations(stationList);
    }
    fetchStations();
  }, []);

  // function to get the status of the station
  const getStatusClass = (status) => {
    switch (status) {
      case "inactive":
        return "badge bg-warning";
      case "active":
        return "badge bg-success";
      case "broken":
        return "badge bg-danger";
      default:
        return "badge bg-light text-dark"; // fallback
    }
  };

  return (
    <>

      <div className="app-wrapper">
        <AdminNavbar toggleSidebar={() => setIsCollapsed(prev => !prev)} />
        <Sidebar />
        <div className="app-main">
          <div className="app-content-header">
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm-6"><h3 className="mb-0">Station Dashboard</h3></div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-end">
                    <li className="breadcrumb-item">Home</li>
                    <li className="breadcrumb-item active">Station Dashboard</li>
                  </ol>
                </div>
              </div>
              <section className="content">
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-lg-3 col-6">
                      <div className="small-box bg-info">
                        <div className="inner" style={{ color: "#fff" }}>
                          <h3>{stationCount}</h3>
                          <p>Total Station</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-6">
                      <div className="small-box bg-success">
                        <div className="inner" style={{ color: "#fff" }}>
                          <h3>{activeStationCount}</h3>
                          <p>Total Active Station</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-6">
                      <div className="small-box bg-warning">
                        <div className="inner" style={{ color: "#fff" }}>
                          <h3>{inactiveStationCount}</h3>
                          <p>Total Inactive Station</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-6">
                      <div className="small-box bg-danger">
                        <div className="inner" style={{ color: "#fff" }}>
                          <h3>{brokenStationCount}</h3>
                          <p>Total Broken Station</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h3 className="card-title">Station</h3>
                          <div className="card-tools">
                            <div className="input-group input-group-sm">
                              <div className="input-group-append">
                                <button type="submit" className="btn btn-default">
                                  <i className="fas fa-search"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="card-body table-responsive p-0">
                          <table className="table table-hover text-nowrap">
                            <thead>
                              <tr>
                                <th>Station ID</th>
                                <th>Station Name</th>
                                <th>Date Created</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stations.map((station, index) => (
                                <tr key={index}>
                                  <td>{station.binID}</td>
                                  <td>{station.stationName}</td>
                                  <td>{new Date(station.createdAt.seconds * 1000).toLocaleString()}</td>
                                  <td>
                                    <span className={getStatusClass(station.stationStatus)}>
                                      {station.stationStatus}
                                    </span>
                                  </td>
                                </tr>

                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="card card-outline card-info">
                        <div className="card-header">
                          <h3 className="card-title">Add New Station</h3>
                        </div>
                        <div className="card-body">
                          Prepare an empty NFC tag and make sure to use mobile with supported NFC to create a new station.
                        </div>
                        <div className="card-footer">
                          <Link to="/admin/dashboard/addStation" className="btn btn-primary">Add New Station</Link>
                          { /* TODO - Create Validation that display if user arent with mobile or PWA*/}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card card-outline card-info">
                        <div className="card-header">
                          <h3 className="card-title">Add New Station</h3>
                        </div>
                        <div className="card-body">
                          <div className="form-group">
                            <label>Bin ID</label>
                            <input className="form-control" disabled />
                          </div>
                          <div className='form-group'>
                            <label>Tag UID</label>
                            <input className="form-control" disabled />
                          </div>
                          <div className="form-group">
                            <label>Station URL</label>
                            <input className="form-control" disabled />
                          </div>
                          <div className="form-group">
                            <label>Station Name</label>
                            <input className="form-control" placeholder="Station Name Here" />
                          </div>
                          <div className="form-group">
                            <label>Station Coordinate</label>
                            <input className="form-control" id="exampleInputPassword1" placeholder="Station Coordinate"/>
                          </div>
                          <div className="form-group">
                            <label>Station Specific Instruction</label>
                            <textarea className='form-control'></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div >
      </div >
    </>
  );
}

export default Station