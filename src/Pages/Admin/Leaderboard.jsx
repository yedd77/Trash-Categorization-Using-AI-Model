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
                            <th>Rank</th>
                            <th>Username</th>
                            <th>Trash Thrown</th>
                            <th>Points Collected</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboardData.map((user, index) => (
                            <tr key={user.id || user.uid || index}>
                              <td>{index + 1}</td>
                              <td>{user.username}</td>
                              <td>{user.trashThrown}</td>
                              <td>{user.totalPoints}</td>
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

export default Leaderboard