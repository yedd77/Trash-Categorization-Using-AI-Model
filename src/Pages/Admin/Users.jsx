import React, { useEffect, useState } from 'react'
import AdminNavbar from './Components/AdminNavbar'
import Sidebar from './Components/sidebar'
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const Users = () => {

  const [users, setUsers] = useState([]);
  const [adminCount, setAdminCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [normalUserCount, setNormalUserCount] = useState(0);
  const [adminUserCount, setAdminUserCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true);

  // function to fetch users from Firestore (exclude admin users)
  useEffect(() => {
    let tempUserCount = 0;
    let tempNormalUserCount = 0;

    // Fetch normal user count
    const getNormalUserCount = fetch(
      "https://us-central1-bin-buddy-v1.cloudfunctions.net/getUserCount"
    )
      .then(res => res.json())
      .then(data => {
        tempNormalUserCount = data.userCount;
        setNormalUserCount(data.userCount);
      })
      .catch(() => setError("Error fetching user count."));

    // Fetch all users
    const getAllUsers = fetch('https://us-central1-bin-buddy-v1.cloudfunctions.net/listAuthUsersV2')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users);
        const regularUsers = data.users.filter(u => !u.email?.includes('admin'));
        tempUserCount = regularUsers.length;
        setUserCount(regularUsers.length);
      })
      .catch(err => console.error(err));

    // After both finished, count admins
    Promise.all([getNormalUserCount, getAllUsers]).then(() => {
      setAdminCount(tempUserCount - tempNormalUserCount);
      console.log("Admin Count:", tempUserCount - tempNormalUserCount);
    });
  }, []);

  // Function to handle the toggle of the sidebar
  // Function to handle sidebar toggle
  useEffect(() => {
    document.body.classList.toggle("sidebar-collapse", isCollapsed);
  }, [isCollapsed]);
  return (
    <>
      <div className="app-wrapper">
        <AdminNavbar toggleSidebar={() => setIsCollapsed(prev => !prev)} />
        <Sidebar />
        <main className="app-main">
          <div className="app-content-header">
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm-6"><h3 className="mb-0">User</h3></div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-end">
                    <li className="breadcrumb-item">Dashboard</li>
                    <li className="breadcrumb-item active">User</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <section className="content">
            <div className="container-fluid">
              <div className="row g-1 mb-3">
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="info-box shadow-sm">
                    <span className="info-box-icon text-bg-success shadow-sm"><i className="bi bi-check"></i></span>
                    <div className="info-box-content">
                      <span className="info-box-text">Total Admins</span>
                      <span className="info-box-number">{adminCount}</span>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="info-box shadow-sm">
                    <span className="info-box-icon text-bg-success shadow-sm"><i className="bi bi-check"></i></span>
                    <div className="info-box-content">
                      <span className="info-box-text">Total Users</span>
                      <span className="info-box-number">{normalUserCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">User</h3>
                      <div className="card-tools">
                        <div class="input-group input-group-sm" style={{ width: "200px" }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search by email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />

                          <div class="input-group-append">
                            <button type="submit" class="btn btn-default">
                              <i class="fas fa-search"></i>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                    <div className="card-body">
                      <table className="table table-bordered table-striped">
                        <thead>
                          <tr>
                            <th>Email</th>
                            <th>Providers</th>
                            <th>Created</th>
                            <th>Last Signed In</th>
                            <th>UID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(users) && users
                            .filter(user => user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(user => (
                              <tr key={user.uid}>
                                <td>{user.email}</td>
                                <td>{(user.provider || []).join(', ')}</td>
                                <td>{new Date(user.creationTime).toLocaleString()}</td>
                                <td>{new Date(user.lastSignInTime).toLocaleString()}</td>
                                <td>{user.uid}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
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

export default Users