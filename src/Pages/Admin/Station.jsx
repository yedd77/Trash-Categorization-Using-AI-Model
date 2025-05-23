import React, { useState, useEffect, use } from 'react'
import AdminNavbar from './Components/AdminNavbar'
import Sidebar from './Components/sidebar'
import { collection, getDocs, doc, setDoc, getCountFromServer, query, where, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { Link } from 'react-router-dom'
import "../Admin/css/adminlte.css"
import "../Admin/js/adminlte.js"
import QRDownload from './Components/QRDownload.jsx'

const Station = () => {

  // State variables
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stationCount, setStationCount] = useState(0);
  const [inactiveStationCount, setInactiveStationCount] = useState(0);
  const [activeStationCount, setActiveStationCount] = useState(0);
  const [brokenStationCount, setBrokenStationCount] = useState(0);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [stationName, setStationName] = useState("");
  const [stationCoordinate, setStationCoordinate] = useState("");
  const [stationInstruction, setStationInstruction] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);


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
      const q = query(stationRef, where("stationStatus", "==", "maintenance"));
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
      case "maintenance":
        return "badge bg-danger";
      default:
        return "badge bg-light text-dark"; // fallback
    }
  };

  // Function to handle the change of the station status
  useEffect(() => {
    if (selectedStation) {
      setStationName(selectedStation.stationName || '');
      setStationCoordinate(selectedStation.stationCoordinate || '');
      setStationInstruction(selectedStation.stationInstruction || '');
      setStatus(selectedStation.stationStatus || '');
    }
  }, [selectedStation]);

  // Function to handle the update of the station
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "Station", selectedStation.binID);
      await updateDoc(docRef, {
        stationName,
        stationCoordinate,
        stationInstruction,
        stationStatus: status,
      });
      setMessage("Station status updated successfully");
    } catch (error) {
      console.error("Error updating station status: ", error);
      setMessage("Error updating station status");
    } finally {
      window.location.reload();
    }
  }

  //function to show the update confirmation modal
  const showUpdateConfirmation = (e) => {
    e.preventDefault();
    setShowUpdateModal(true);
  }

  // function to handle the update confirmation
  const handleConfirmUpdate = async (e) => {
    setShowUpdateModal(false);
    await handleUpdate(e);
  }

  // function to show the delete confirmation modal
  const showDeleteConfirmation = (e) => {
    e.preventDefault();
    setShowDeleteModal(true);
  }

  // function to handle the delete confirmation
  const handleConfirmDelete = async (e) => {
    setShowDeleteModal(false);
    await handleDelete(e);
  }

  // function to handle the delete of the station
  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "Station", selectedStation.binID);
      await deleteDoc(docRef);
      setMessage("Station deleted successfully");
      setSelectedStation(null);
    } catch (error) {
      console.error("Error deleting station: ", error);
      setMessage("Error deleting station");
    } finally {
      window.location.reload();
    }
  }

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
            </div>
          </div>
          <div className="app-content">
            <div className="content">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="info-box shadow-sm">
                    <span className="info-box-icon text-bg-primary shadow-sm">
                      <i className="bi bi-trash"></i>
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">Total Station</span>
                      <span className="info-box-number">
                        {stationCount}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="info-box shadow-sm">
                    <span className="info-box-icon text-bg-success shadow-sm">
                      <i className="bi bi-check"></i>
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">Total Active Station</span>
                      <span className="info-box-number">
                        {activeStationCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-md-3">
                  <div className="info-box shadow-sm">
                    <span className="info-box-icon text-bg-warning shadow-sm">
                      <i className="bi bi-x-lg"></i>
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">Total Inactive Station</span>
                      <span className="info-box-number">
                        {inactiveStationCount}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="info-box shadow-sm">
                    <span className="info-box-icon text-bg-danger shadow-sm">
                      <i className="bi bi-gear-fill"></i>
                    </span>
                    <div className="info-box-content">
                      <span className="info-box-text">Total Broken Station</span>
                      <span className="info-box-number">
                        {brokenStationCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Station List</h3>
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
                          {stations.map((station) => (
                            <tr key={station.binID}>
                              <td>{station.binID}</td>
                              <td>{station.stationName}</td>
                              <td>{new Date(station.createdAt.seconds * 1000).toLocaleString()}</td>
                              <td>
                                <span className={getStatusClass(station.stationStatus)}>
                                  {station.stationStatus}
                                </span>
                              </td>
                              <td>
                                <button className='btn btn-primary mb-2 btn-sm'
                                  onClick={() => setSelectedStation(station)}>
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                          <tr><td colSpan={5} className='text-center' disabled>Showing {stations.length} record{stations.length !== 1 ? 's' : ''} from database</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-md-12">
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
              </div>
              {selectedStation && (
                <div className="row mt-4">
                  <div className="col-md-12">
                    <div className="card card-outline card-info">
                      <div className="card-header">
                        <h3 className="card-title">Station Details</h3>
                      </div>
                      <div className="card-body">
                        <div className="form-group">
                          <label>Bin ID</label>
                          <input className="form-control" disabled value={selectedStation.binID} />
                        </div>
                        <div className='form-group'>
                          <label>Tag UID</label>
                          <input className="form-control" disabled value={selectedStation.tagUID} />
                          {/* TODO - Add copy button*/}
                        </div>
                        <div className="form-group">
                          <label>Station URL</label>
                          <input className="form-control" disabled value={selectedStation.stationURL} />
                        </div>
                        <div className="form-group">
                          <label>Created At</label>
                          <input className="form-control" disabled value={new Date(selectedStation.createdAt.seconds * 1000).toLocaleString()} />
                        </div>
                        <div className="form-group">
                          <label>Station Name</label>
                          <input
                            className="form-control"
                            value={stationName}
                            onChange={e => setStationName(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Station Coordinate</label>
                          <input
                            className="form-control"
                            value={stationCoordinate}
                            onChange={e => setStationCoordinate(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Station Specific Instruction</label>
                          <textarea
                            className="form-control"
                            value={stationInstruction}
                            onChange={e => setStationInstruction(e.target.value)}
                          ></textarea>
                        </div>

                        <div className="btn-group my-4" role="group" aria-label="Basic radio toggle button group">
                          <label className={`btn btn-outline-primary ${status === "active" ? "active" : ""}`}>
                            <input
                              type="radio"
                              name="status"
                              value="active"
                              className="btn-check"
                              autoComplete="off"
                              checked={status === "active"}
                              onChange={(e) => setStatus(e.target.value)}
                            />
                            Active
                          </label>
                          <label className={`btn btn-outline-primary ${status === "inactive" ? "active" : ""}`}>
                            <input
                              type="radio"
                              name="status"
                              value="inactive"
                              className="btn-check"
                              autoComplete="off"
                              checked={status === "inactive"}
                              onChange={(e) => setStatus(e.target.value)}
                            />
                            Inactive
                          </label>

                          <label className={`btn btn-outline-primary ${status === "maintenance" ? "active" : ""}`}>
                            <input
                              type="radio"
                              name="status"
                              value="maintenance"
                              className="btn-check"
                              autoComplete="off"
                              checked={status === "maintenance"}
                              onChange={(e) => setStatus(e.target.value)}
                            />
                            Maintenance
                          </label>
                        </div>
                      </div>
                      <div className="card-footer">
                        <QRDownload stationURL={selectedStation.stationURL} />
                        <button type='button' className='btn btn-warning my-2 mx-2' onClick={showUpdateConfirmation}>update</button>
                        <button type='button' className='btn btn-danger my-2 mx-2' onClick={showDeleteConfirmation}>Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {showUpdateModal && (
              <div className="modal show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Confirm Update</h5>
                      <button type="button" className="btn-close" onClick={() => setShowUpdateModal(false)} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <p>Are you sure you want to update this station?</p>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                      <button type="button" className="btn btn-primary" onClick={handleConfirmUpdate}>Yes, Update</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {showDeleteModal && (
              <div className="modal show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header bg-danger">
                      <h5 className="modal-title" style={{ color: '#fff' }}>Confirm Delete</h5>
                      <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <p>Are you sure you want to delete this station?</p>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                      <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Yes, Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Station