import React from 'react'
import AdminNavbar from './Components/AdminNavbar'
import Sidebar from './Components/sidebar'
import { use, useEffect, useState } from 'react'
import { db } from '../../firebase'
import { getFirestore, collection, query, where, getDocs, doc } from 'firebase/firestore'

const Leaderboard = () => {

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);

  // Function to handle the toggle of the sidebar
  // Function to handle sidebar toggle
  useEffect(() => {
    document.body.classList.toggle("sidebar-collapse", isCollapsed);
  }, [isCollapsed]);


  // Function to fetch leaderboard data
  useEffect(() => {

    const fetchLeaderboard = async () => {
      const db = getFirestore();
      const leaderboardRef = collection(db, 'Points');
      const q = query(leaderboardRef, where("isClaimed", '==', true));

      const snapshot = await getDocs(q);
      const leaderboardMap = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        const uid = data.uid;
        const username = data.username || "Unknown User";
        const points = data.points || 0;

        if (!leaderboardMap[uid]) {
          leaderboardMap[uid] = {
            uid,
            username,
            totalPoints: 0,
            trashThrown: 0
          };
        }

        leaderboardMap[uid].totalPoints += points;
        leaderboardMap[uid].trashThrown += 1;
      });

      const sorted = Object.values(leaderboardMap).sort((a, b) => b.totalPoints - a.totalPoints);
      setLeaderboardData(sorted);
    };
    fetchLeaderboard();
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
                <div className="col-sm-6"><h3 className="mb-0">Leaderboard</h3></div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-end">
                    <li className="breadcrumb-item">Dashboard</li>
                    <li className="breadcrumb-item active">Leaderboard</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <section className="content">
            <div className="container-fluid">
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-body">
                      <table className="table">
                        <thead>
                          <tr>
                            <th className='text-center'>Rank</th>
                            <th className='text-center'>Username</th>
                            <th className='text-center'>Trash Thrown</th>
                            <th className='text-center'>Points Collected</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboardData.map((user, index) => (
                            <tr key={user.id || user.uid || index}>
                              <td className='text-center'>
                                {index + 1 === 1 ? (
                                  <i className="bi bi-1-circle-fill" style={{ fontSize: '1.2rem', color: 'gold' }}></i>
                                ) : index + 1 === 2 ? (
                                  <i className="bi bi-2-circle-fill" style={{ fontSize: '1.2rem', color: 'silver' }}></i>
                                ) : index + 1 === 3 ? (
                                  <i className="bi bi-3-circle-fill" style={{ fontSize: '1.2rem', color: '#cd7f32' }}></i>
                                ) : (
                                  index + 1
                                )}
                              </td>
                              <td className='text-center'>{user.username}</td>
                              <td className='text-center'>{user.trashThrown}</td>
                              <td className='text-center'>{user.totalPoints}</td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan="4" className="text-center fw-bold">
                              {leaderboardData.length > 0 ? `Total Users: ${leaderboardData.length}` : ""}
                            </td>
                          </tr>
                          {leaderboardData.length === 0 && (
                            <tr>
                              <td colSpan="4" className="text-center fw-bold">
                                {leaderboardData.length === 0 ? "No data available" : ""}
                              </td>
                            </tr>
                          )}
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

export default Leaderboard