import React, { useEffect, useState } from 'react'
import AdminNavbar from './Components/AdminNavbar'
import Sidebar from './Components/sidebar'
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { FcGoogle } from 'react-icons/fc';
import { MdEmail } from 'react-icons/md';


const Users = () => {

  const [users, setUsers] = useState([]);
  const [adminCount, setAdminCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [normalUserCount, setNormalUserCount] = useState(0);
  const [adminUserCount, setAdminUserCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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

  // Function to copy UID to clipboard and show toast notification
  const handleCopyUID = (uid) => {
    navigator.clipboard.writeText(uid).then(() => {
      setToastMessage("UID copied to clipboard!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000); // auto-hide after 2 sec
    });
  };
  return (
    <>
      <div className="app-wrapper">
        <AdminNavbar toggleSidebar={() => setIsCollapsed(prev => !prev)} />
        <Sidebar />
        <main className="app-main">
          <div className="app-content-header">
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm-6"><h3 className="mb-0">Users</h3></div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-end">
                    <li className="breadcrumb-item">Dashboard</li>
                    <li className="breadcrumb-item active">Users</li>
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
                    <span className="info-box-icon text-bg-primary shadow-sm"><i className="bi bi-person-fill-lock"></i></span>
                    <div className="info-box-content">
                      <span className="info-box-text">Total Admins</span>
                      <span className="info-box-number">{adminCount}</span>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-3">
                  <div className="info-box shadow-sm">
                    <span className="info-box-icon text-bg-success shadow-sm"><i className="bi bi-people-fill"></i></span>
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
                        <div className="input-group input-group-sm" style={{ width: "200px" }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search by email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />

                          <div className="input-group-append">
                            <button type="submit" className="btn btn-default">
                              <i className="fas fa-search"></i>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                    <div className="card-body">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th className="text-center">No</th>
                            <th className="text-center">Email</th>
                            <th className="text-center">Username</th>
                            <th className="text-center">Providers</th>
                            <th className="text-center">Created</th>
                            <th className="text-center">Last Signed In</th>
                            <th className="text-center">UID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(users) && users
                            .filter(user => user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(user => (
                              <tr key={user.uid}>
                                <td className="text-center">{users.indexOf(user) + 1}</td>
                                <td>{user.email}</td>
                                <td className="text-center">{user.displayName || 'Unknown User'}</td>
                                <td className="text-center">
                                  {(user.provider || []).map((provider, index) => (
                                    <span key={index} className="me-2 d-inline-flex align-items-center">
                                      {provider === 'google.com' && <FcGoogle className="me-1" />}
                                      {provider === 'password' && <MdEmail className="me-1" />}
                                    </span>
                                  ))}
                                </td>
                                <td className="text-center">{new Date(user.creationTime).toLocaleString()}</td>
                                <td className="text-center">{new Date(user.lastSignInTime).toLocaleString()}</td>
                                <td>
                                  <button
                                    className="mx-5 btn btn-sm btn-outline-secondary"
                                    onClick={() => handleCopyUID(user.uid)}
                                    title="Copy UID">
                                    <i className="bi bi-copy"></i>
                                  </button>
                                  <span>
                                    {user.uid}
                                  </span>

                                  
                                </td>
                              </tr>
                            ))}
                          <tr><td colSpan={6} className='text-center' disabled>Showing {users.length} record{users.length !== 1 ? 's' : ''} from database</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
  className={`toast position-fixed bottom-0 end-0 m-3 ${showToast ? "show" : "hide"}`}
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
  style={{ zIndex: 9999 }}
>
  <div className="toast-body">
    {toastMessage}
  </div>
</div>
          </section>

        </main>
      </div>
    </>
  )
}

export default Users