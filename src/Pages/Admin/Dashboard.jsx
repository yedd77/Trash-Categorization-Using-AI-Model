import React, { use } from 'react'
import AdminNavbar from './Components/AdminNavbar'
import Sidebar from './Components/sidebar'
import { data, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, getDocs, doc, setDoc, getCountFromServer, query, where, updateDoc, deleteDoc } from 'firebase/firestore'
import { getFunctions, httpsCallable } from "firebase/functions";
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PieController, plugins } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement, PieController, ChartDataLabels);

const Dashboard = () => {

  // State to hold data
  const [pointsCount, setPointsCount] = useState(0);
  const [activeStationCount, setActiveStationCount] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [stationCount, setStationCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trashTypeCounts, setTrashTypeCounts] = useState({});
  const [trashLoading, setTrashLoading] = useState(true);
  const [stationTrashCounts, setStationTrashCounts] = useState({});
  const [stationNames, setStationNames] = useState({});
  const [hourlyCounts, setHourlyCounts] = useState(Array(24).fill(0));
  const [userContributions, setUserContributions] = useState({});
  const [stackedData, setStackedData] = useState([]);
  const [timeSeriesCounts, setTimeSeriesCounts] = useState({});

  useEffect(() => {
    // Total waste submissions
    const fetchPointsCount = async () => {
      const pointsSnapshot = await getDocs(collection(db, "Points"));
      setPointsCount(pointsSnapshot.size);
    };
    fetchPointsCount();

    // Active stations
    const fetchActiveStationCount = async () => {
      const q = query(collection(db, "Station"), where("stationStatus", "==", "active"));
      const snapshot = await getDocs(q);
      setActiveStationCount(snapshot.size);
    };
    fetchActiveStationCount();
  }, []);

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
        ); 12

        const data = await res.json();
        setUserCount(data.userCount);
      } catch (err) {
        setError("Error fetching user count.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Function to handle the toggle of the sidebar
  // Function to handle sidebar toggle
  useEffect(() => {
    document.body.classList.toggle("sidebar-collapse", isCollapsed);
  }, [isCollapsed]);

  // Fetch trash type counts from Points collection
  useEffect(() => {
    const fetchTrashTypes = async () => {
      setTrashLoading(true);
      try {
        const pointsSnapshot = await getDocs(collection(db, "Points"));
        const counts = {};
        pointsSnapshot.forEach(doc => {
          const itemType = doc.data().itemType || "Unknown";
          counts[itemType] = (counts[itemType] || 0) + 1;
        });
        setTrashTypeCounts(counts);
      } catch (err) {
        setTrashTypeCounts({});
      } finally {
        setTrashLoading(false);
      }
    };
    fetchTrashTypes();
  }, []);

  // Fetch station trash counts and names
  // This will map binID to stationName and count the number of Points per binID
  useEffect(() => {
    const fetchStationTrashCounts = async () => {
      try {
        // Fetch all Points
        const pointsSnapshot = await getDocs(collection(db, "Points"));
        const counts = {};
        pointsSnapshot.forEach(doc => {
          const binID = doc.data().claimedBin;
          if (binID) { // Only count if binID exists and is not empty
            counts[binID] = (counts[binID] || 0) + 1;
          }
        });

        // Fetch all Stations for mapping binID to stationName
        const stationsSnapshot = await getDocs(collection(db, "Station"));
        const names = {};
        stationsSnapshot.forEach(doc => {
          const data = doc.data();
          names[data.binID] = data.stationName || data.binID;
        });

        setStationTrashCounts(counts);
        setStationNames(names);
      } catch (err) {
        setStationTrashCounts({});
        setStationNames({});
      }
    };
    fetchStationTrashCounts();
  }, []);

  useEffect(() => {
    const fetchHourlyCounts = async () => {
      try {
        const pointsSnapshot = await getDocs(collection(db, "Points"));
        const counts = Array(24).fill(0);
        pointsSnapshot.forEach(doc => {
          const claimedAt = doc.data().claimedAt;
          if (claimedAt && typeof claimedAt.toDate === "function") {
            const ts = claimedAt.toDate();
            const hour = ts.getHours();
            counts[hour]++;
          }
          // else: skip this doc
        });
        setHourlyCounts(counts);
      } catch (err) {
        setHourlyCounts(Array(24).fill(0));
      }
    };
    fetchHourlyCounts();
  }, []);

  useEffect(() => {
    const fetchUserContributions = async () => {
      try {
        const pointsSnapshot = await getDocs(collection(db, "Points"));
        const counts = {};
        pointsSnapshot.forEach(doc => {
          const username = doc.data().username || "Unknown";
          counts[username] = (counts[username] || 0) + 1;
        });
        setUserContributions(counts);
      } catch (err) {
        setUserContributions({});
      }
    };
    fetchUserContributions();
  }, []);

  useEffect(() => {
    const fetchStackedData = async () => {
      try {
        const pointsSnapshot = await getDocs(collection(db, "Points"));
        const data = {};
        const trashTypesSet = new Set();
        pointsSnapshot.forEach(doc => {
          const binID = doc.data().claimedBin;
          if (!binID) return; // Skip if binID is missing or empty
          const itemType = doc.data().itemType || "Unknown";
          trashTypesSet.add(itemType);
          if (!data[binID]) data[binID] = {};
          data[binID][itemType] = (data[binID][itemType] || 0) + 1;
        });

        // Fetch station names
        const stationsSnapshot = await getDocs(collection(db, "Station"));
        const names = {};
        stationsSnapshot.forEach(doc => {
          const d = doc.data();
          names[d.binID] = d.stationName || d.binID;
        });

        setStackedData({ data, trashTypes: Array.from(trashTypesSet), names });
      } catch (err) {
        setStackedData({});
      }
    };
    fetchStackedData();
  }, []);

  useEffect(() => {
    const fetchTimeSeriesCounts = async () => {
      try {
        const pointsSnapshot = await getDocs(collection(db, "Points"));
        const counts = {};
        pointsSnapshot.forEach(doc => {
          const ts = doc.data().claimedAt?.toDate?.() || new Date();
          const dateStr = ts.toISOString().slice(0, 10); // YYYY-MM-DD
          counts[dateStr] = (counts[dateStr] || 0) + 1;
        });
        setTimeSeriesCounts(counts);
      } catch (err) {
        setTimeSeriesCounts({});
      }
    };
    fetchTimeSeriesCounts();
  }, []);

  // Prepare data for chart
  const trashTypeLabels = Object.keys(trashTypeCounts);
  const trashTypeData = Object.values(trashTypeCounts);
  const stationBarLabels = Object.keys(stationTrashCounts).map(binID => stationNames[binID] || binID);
  const stationBarData = Object.values(stationTrashCounts);
  const userBarLabels = Object.keys(userContributions);
  const userBarData = Object.values(userContributions);
  const stackedLabels = stackedData.names ? Object.keys(stackedData.data).map(binID => stackedData.names[binID] || binID) : [];
  const trashTypes = stackedData.trashTypes || [];
  const timeSeriesLabels = Object.keys(timeSeriesCounts).sort();
  const timeSeriesData = timeSeriesLabels.map(date => timeSeriesCounts[date] || 0);

  const datasets = trashTypes.map((type, idx) => ({
    label: type,
    data: stackedLabels.map((_, i) => {
      const binID = Object.keys(stackedData.data)[i];
      return stackedData.data[binID]?.[type] || 0;
    }),
    backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#fd7e14'][idx % 7],
  }));

  const trashTypeChartData = {
    labels: trashTypeLabels,
    datasets: [
      {
        label: 'Count',
        data: trashTypeData,
        backgroundColor: [
          '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#fd7e14'
        ],
      },
    ],
  };

  const trashTypeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend:
      {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
          color: '#333',
        },
      },
      tooltip: { enabled: true },
      datalabels: {
        color: '#000000',
        font: {
          size: 12,
        },
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          const percentage = total ? (value / total) * 100 : 0;
          return percentage.toFixed(1) + '%';
        },
      },
    },
  };

  const stationBarChartData = {
    labels: stationBarLabels,
    datasets: [{
      label: 'Trash Collected',
      data: stationBarData,
      backgroundColor: '#007bff',
    }],
  };

  const stationBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        display: true,
        color: '#000000',
        font: {
          size: 12,
        },
        formatter: (value) => value,
      },
      tooltip: { enabled: true },
    },
    scales: { y: { beginAtZero: true } },
  };

  const hourlyChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Submissions',
      data: hourlyCounts,
      borderColor: '#28a745',
      backgroundColor: '#198754',
      fill: false,
      tension: 0.3,
    }],
  };

  const hourlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: true },
      datalabels: {
        display: true,
        color: '#000000',
        font: {        
          size: 12,
        },
        formatter: (value) => value,
      },
     },
    scales: { y: { beginAtZero: true } },
  };

  const userBarChartData = {
    labels: userBarLabels,
    datasets: [{
      label: 'Contributions',
      data: userBarData,
      backgroundColor: '#0d6efd',
    }],
  };

  const userBarChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false }, 
      datalabels: {
          display: true,
          color: '#000000',
          font: {        
            size: 12,           
          },
          formatter: (value) => value,
        },
    },
    scales: { x: { beginAtZero: true } },
  };

  const stackedBarChartData = {
    labels: stackedLabels,
    datasets,
  };

  const stackedBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: true },
      datalabels: {
            display: true,
            color: '#000000',
            font: {        
              size: 12,           
            },
            formatter: (value) => value,
          },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  const dailyChartData = {
    labels: timeSeriesLabels,
    datasets: [{
      label: 'Submissions',
      data: timeSeriesData,
      borderColor: '#6f42c1',
      backgroundColor: '#198754',
      fill: false,
      tension: 0.3,
    }],
  };

  const dailyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: true },
      datalabels: {
          display: true,
          color: '#000000',
          font: {        
            size: 12,
          },
          formatter: (value) => value,
        },
    },
    scales: { y: { beginAtZero: true } },
    
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
              <div className="row mb-4">
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
                <div className="col-lg-3 col-6">
                  <div className="small-box text-bg-warning">
                    <div className="inner" style={{ color: '#fff' }}>
                      <h3 className='fw-semibold'>{pointsCount.toLocaleString()}</h3>
                      <p>Total Waste Submissions</p>
                    </div>
                    <Link to="/admin/dashboard/point" className="small-box-footer link-light link-underline-opacity-0 link-underline-opacity-50-hover">
                      <i className="bi bi-link-45deg"></i>
                      More info
                    </Link>
                  </div>
                </div>
                <div className="col-lg-3 col-6">
                  <div className="small-box text-bg-primary">
                    <div className="inner" style={{ color: '#fff' }}>
                      <h3 className='fw-semibold'>{activeStationCount}</h3>
                      <p>Active Stations</p>
                    </div>
                    <Link to="/admin/dashboard/station" className="small-box-footer link-light link-underline-opacity-0 link-underline-opacity-50-hover">
                      <i className="bi bi-link-45deg"></i>
                      More info
                    </Link>
                  </div>
                </div>
              </div>
              <div className="row">
                {/* Pie Chart: Trash Type Distribution */}
                <div className="col-12 col-md-6 mb-4">
                  <div className="card card-primary">
                    <div className="card-header">
                      <h3 className="card-title">Trash Type Distribution</h3>
                    </div>
                    <div className="card-body" style={{ display: 'block' }}>
                      <div className="chart" style={{ height: '250px' }}>
                        {trashLoading ? (
                          <p>Loading...</p>
                        ) : (                        
                            <Pie
                              key={JSON.stringify(trashTypeLabels) + JSON.stringify(trashTypeData)}
                              data={trashTypeChartData}
                              options={trashTypeChartOptions}
                            />                          
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Bar Chart: Trash Collected Per Station */}
                <div className="col-12 col-md-6 mb-4">
                  <div className="card card-primary">
                    <div className="card-header">
                      <h3 className="card-title">Trash Collected Per Station</h3>
                    </div>
                    <div className="card-body">
                      <div className="chart" style={{height: '250px'}}>
                          <Bar data={stationBarChartData} options={stationBarChartOptions} plugins={[ChartDataLabels]} />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Bar Chart: Trash Disposal Frequency (Hourly) */}
                <div className="col-12 col-md-6 mb-4">
                  <div className="card card-success">
                    <div className="card-header">
                      <h3 className="card-title">Trash Disposal Frequency (Hourly)</h3>
                    </div>
                    <div className="card-body">
                      <div className="chart" style={{height: '250px'}}>
                          <Bar data={hourlyChartData} options={hourlyChartOptions} />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Bar Chart: Trash Disposal Frequency (Daily) */}
                <div className="col-12 col-md-6 mb-4">
                  <div className="card card-success">
                    <div className="card-header">
                      <h3 className="card-title">Trash Disposal Frequency (Daily)</h3>
                    </div>
                    <div className="card-body">
                      <div className="chart" style={{ height: '250px' }}>                        
                          <Bar data={dailyChartData} options={dailyChartOptions} />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Horizontal Bar Chart: User Contribution */}
                <div className="col-12 col-md-6 mb-4">
                  <div className="card card-primary">
                    <div className="card-header">
                      <h3 className="card-title">User Contribution</h3>
                    </div>
                    <div className="card-body">
                      <div className="chart" style={{ height: '250px' }}>            
                          <Bar data={userBarChartData} options={userBarChartOptions} />                        
                      </div>
                    </div>
                  </div>
                </div>
                {/* Stacked Bar Chart: Trash Type Per Station */}
                <div className="col-12 col-md-6 mb-4">
                  <div className="card card-primary">
                    <div className="card-header">
                      <h3 className="card-title">Trash Type Per Station</h3>
                    </div>
                    <div className="card-body">
                      <div className="chart" style={{ height: '250px' }}>                     
                          <Bar data={stackedBarChartData} options={stackedBarChartOptions} />
                      </div>
                    </div>
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