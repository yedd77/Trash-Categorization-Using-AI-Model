import React, { useState, useEffect, use } from 'react'
import AdminNavbar from './Components/AdminNavbar'
import Sidebar from './Components/sidebar'
import { collection, getDocs, doc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'


const AddStation = () => {

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [nfcMessage, setNfcMessage] = useState('');
    const [tagUID, setTagUID] = useState('');
    const [binID, setBinID] = useState('');
    const [stationURL, setStationURL] = useState('');
    const [stationName, setStationName] = useState('');
    const [stationCoordinate, setStationCoordinate] = useState('');
    const [stationInstruction, setStationInstruction] = useState('');
    const [error, setError] = useState('');
    const [NFCError, setNFCErrors] = useState(false);
    const [showNfcOverlay, setShowNfcOverlay] = useState(false);


    // Function to handle sidebar toggle
    useEffect(() => {
        document.body.classList.toggle("sidebar-collapse", isCollapsed);
    }, [isCollapsed]);

    // Generate next Bin ID (function, not used in this snippet, but fixed scope)
    const genrateNextBinID = async () => {
        const snapshot = await getDocs(collection(db, "Station")); // Assuming "Station" is the collection name
        let maxID = 0;

        // Loop through the documents to find the maximum ID
        snapshot.forEach((docSnap) => {
            const match = docSnap.id.match(/^BIN(\d+)$/); // Use docSnap.id, not docSnap
            if (match) {
                const num = parseInt(match[1], 10); // Extract the number from the ID
                if (num > maxID) {
                    maxID = num; // Update maxID if current ID is greater
                }
            }
        });

        // Generate the next Bin ID
        const nextNumber = maxID + 1;
        const nextBinID = `BIN${nextNumber.toString().padStart(4, '0')}`; // Example: BIN0001

        return nextBinID;
    };

    // Function to handle form submission
    const handleSubmit = async (e) => {

        //regex validation for coordinates
        const regex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;

        //validation for station name
        if (stationName === "") {
            setError("Please fill the station name!");
            return;
        }
        // validation for station coordinates    
        else if (stationCoordinate === "") {
            setError("Please fill the station coordinates!");
            return;
        }
        // validation for coordinates
        else if (!regex.test(stationCoordinate)) {
            setError("Please enter valid coordinates!");
            return;
        }
        //validation for station instruction
        else if (stationInstruction === "") {
            setError("Please fill the station instruction!");
            return;
        }
        // Clear previous error
        setError('');
        setNfcMessage('');
        setNFCErrors(false);

        //handle NFC write
        setShowNfcOverlay(true); // set on NFC when its ready to write
        try {
            const ndef = new window.NDEFReader();
            await ndef.write(stationURL);
            setNfcMessage('URL written to NFC tag successfully!');
        } catch (error) {
            setNfcMessage(`Write failed: ${error}`);
            setNFCErrors(true);
        } finally {
            setShowNfcOverlay(false); // set off NFC when its done
        }

        // Create a new station document in Firestore
        const stationRef = doc(db, "Station", binID);
        await setDoc(stationRef, {
            binID: binID,
            tagUID: tagUID,
            stationURL: stationURL,
            stationName: stationName,
            stationCoordinate: stationCoordinate,
            stationInstruction: stationInstruction,
            createdAt: new Date(),
            stationStatus: false,
        });
    }

    //TODO : Add code to permenantly write the NFC tag

    // Function to create a new UID and set the Bin ID
    useEffect(() => {
        setTagUID(crypto.randomUUID());

        //function to fetch the next Bin ID
        const fetchBinId = async () => {
            const nextId = await genrateNextBinID();
            setBinID(nextId);
        };
        fetchBinId();
    }, []);

    // Function to create URL based on UID and Bin ID
    useEffect(() => {
        // Generate a unique station URL using the tag UID and bin ID
        if (tagUID && binID) {
            const baseURL = "https://bin-buddy-v1.web.app/binVerify/";
            const url = `${baseURL}?tagUID=${tagUID}&binID=${binID}`;
            setStationURL(url);
        }
    }, [tagUID, binID]);

    return (
        <>
            {showNfcOverlay && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                }}>
                    <div>
                        <i className="bi bi-nfc" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <div>
                        Please scan your NFC tag now...
                    </div>
                </div>
            )}
            <div className="app-wrapper">
                <AdminNavbar toggleSidebar={() => setIsCollapsed(prev => !prev)} />
                <Sidebar />
                <main className="app-main">
                    <div className="app-content-header">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-6"><h3 className="mb-0">Station Dashboard</h3></div>
                                <div className="col-sm-6">
                                    <ol className="breadcrumb float-sm-end">
                                        <li className="breadcrumb-item"><a href="#">Home</a></li>
                                        <li className="breadcrumb-item active">Station Dashboard</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                    <section className="content">
                        <div className="container-fluid">
                            <div className="alert alert-info alert-dismissible">
                                <h5><i className="icon fas fa-info"></i> Notification</h5>
                                Please ready an empty NFC tag to write the station information before creating a new station.
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="card">
                                        <div className="card-header">
                                            <h3 className="card-title">Create New Station</h3>
                                        </div>
                                        <div className="card-body">
                                            <div className="form-group">
                                                <label>Bin ID</label>
                                                <input className="form-control" value={binID} disabled />
                                            </div>
                                            <div className='form-group'>
                                                <label>Tag UID</label>
                                                <input className="form-control" value={tagUID} disabled />
                                            </div>
                                            <div className="form-group">
                                                <label>Station URL</label>
                                                <input className="form-control" value={stationURL} disabled />
                                            </div>
                                            <div className="form-group">
                                                <label>Station Name</label>
                                                <input className="form-control" placeholder="Station Name Here" onChange={(e) => { setStationName(e.target.value); setError(""); }} />
                                            </div>
                                            <div className="form-group">
                                                <label>Station Coordinate</label>
                                                <input className="form-control" id="exampleInputPassword1" placeholder="Station Coordinate" onChange={(e) => { setStationCoordinate(e.target.value); setError(""); }} />
                                            </div>
                                            <div className="form-group">
                                                <label>Station Specific Instruction</label>
                                                <textarea className='form-control' onChange={(e) => { setStationInstruction(e.target.value); setError(""); }}></textarea>
                                            </div>
                                            {error && <p className=" text-danger text-start mt-3">{error}</p>}
                                            {nfcMessage && <p className="text-success text-start mt-3">{nfcMessage}</p>}
                                            {NFCError && <p className="text-danger text-start mt-3">NFC write failed. Please try again and ensure your device supports NFC.</p>}
                                        </div>
                                        <div className="card-footer">
                                            <button type="submit" className="btn btn-primary" onClick={handleSubmit}>Submit</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

        </>
    )
}

export default AddStation