import React, { useState, useEffect } from 'react'
import AdminNavbar from './Components/AdminNavbar'
import Sidebar from './Components/sidebar'

const Station = () => {
  const [nfcSupported, setNfcSupported] = useState(null);
  const [nfcMessage, setNfcMessage] = useState('');

  useEffect(() => {
    setNfcSupported('NDEFReader' in window);
  }, []);

  const handleWriteNfc = async () => {
    if (!nfcSupported) {
      setNfcMessage('NFC is not supported on this device.');
      return;
    }
    try {
      const ndef = new window.NDEFReader();
      await ndef.write("Hello World");
      setNfcMessage('Message written to NFC tag!');
    } catch (error) {
      setNfcMessage(`Write failed: ${error}`);
    }
  };

  return (
    <>
      <div className="app-wrapper">
        <AdminNavbar />
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
              <div className="row">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Create New Station</h3>
                    </div>
                    <div className="card-body">
                      <div className="form-group">
                        <label>Bin ID</label>
                        <input className="form-control" placeholder="Bin ID Here" disabled />
                      </div>
                      <div className="form-group">
                        <label>Station Name</label>
                        <input className="form-control" placeholder="Station Name Here" />
                      </div>
                      <div className="form-group">
                        <label>Station Coordinate</label>
                        <input className="form-control" id="exampleInputPassword1" placeholder="Station Coordinate" />
                      </div>
                      <div className="form-group">
                        <label>Station Specific Instruction</label>
                        <textarea className='form-control'></textarea>
                      </div>
                    </div>
                    <div className="card-footer">
                      <button type="submit" className="btn btn-primary">Submit</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div style={{ margin: 16 }}>
            {nfcSupported === null && <p>Checking NFC support...</p>}
            {nfcSupported === false && <p style={{color: 'red'}}>NFC is NOT supported on this device.</p>}
            {nfcSupported === true && (
              <button className="btn btn-success" onClick={handleWriteNfc}>
                Write "Hello World" to NFC Tag
              </button>
            )}
            {nfcMessage && <p>{nfcMessage}</p>}
          </div>
        </main>
      </div>
    </>
  )
}

export default Station