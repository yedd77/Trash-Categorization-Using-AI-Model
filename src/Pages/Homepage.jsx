import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../Components/Navbar/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import './Homepage.css';
import { Link } from 'react-router-dom';
import InitialAvatar from '../Components/initialAvatar';
import { useLocation } from 'react-router-dom';


function Homepage() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [mobile, setMobile] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      const db = getFirestore();
      const q = query(collection(db, 'Points'), where("isClaimed", "==", true));
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
      window.leaderboardData = sorted;
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    const checkMobile = () => {
      setMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const howItWorksRef = useRef(null);
  const downloadRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollTo = params.get('scrollTo');

    const sectionRefs = {
      howItWorks: howItWorksRef,
      download: downloadRef,
    };

    const sectionRef = sectionRefs[scrollTo];
    if (sectionRef && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt(); // Show the install prompt

    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);

    // Clear the saved event after prompting
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <>
      {mobile ? (
        <>
          <Navbar />
          <div className="position-relative" style={{ height: "100vh", overflow: "hidden" }}>
            <img
              src="https://c1.wallpaperflare.com/preview/573/470/513/trash-junk-container-graffiti.jpg"
              className="position-absolute w-100 h-100 object-fit-cover"
              style={{
                objectPosition: "50% 70%",
                filter: "brightness(30%)",
                opacity: "90%",
                zIndex: 1,
              }}
              alt="Background" />
            <div className="position-absolute top-50 start-50 translate-middle text-center w-100 px-3" style={{ zIndex: 2 }}>
              {/* Mobile view header */}
              <div className="d-block d-md-none ps-3">
                <div className="text-start">
                  <p className="mb-2 fs-5 fw-bold text-light">Smart Waste</p>
                  <p className="mb-3 fs-5 fw-bold text-light">Management Start Here</p>
                  <div className="mb-3 lh-sm">
                    <p className="fs-1 fw-bold text-light">AI-power solution</p>
                    <p className="fs-1 fw-bold text-light">to identify, sort, and</p>
                    <p className="fs-1 fw-bold text-light">learn about waste</p>
                  </div>
                  <div className="mb-3 fs-5">
                    <p className="text-light">From homes to public spaces, our</p>
                    <p className="text-light">classification and user</p>
                    <p className="text-light">learn about waste</p>
                    <p className="text-light">enhanced with NFC/QR tools, it's</p>
                    <p className="text-light">designed for scalable, eco-</p>
                    <p className="text-light">conscious environtments</p>
                  </div>
                  <div className="d-grid gap-2">
                    <Link to="/categorizer" className="btn rounded-3 ps-0 pe-0 px-4 w-60" style={{ backgroundColor: "#80BC44", color: "#fff", width: "40%" }}>Try Our App</Link>
                    <Link to="/?scrollTo=howItWorks" className="btn rounded-3 ps-0 pe-0 w-50" style={{ border: "1px solid #80BC44", color: "#fff" }}>Learn How it Works</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container">
            {/* Mobile view intro */}
            <div className="d-block d-md-none">
              <div className="text-center mt-5 mb-5">
                <div className="col-md-4 col-12 mb-4">
                  <img src="/app-display.png" className="img-fluid object-fit-cover rounded-start" alt="Device preview" />
                </div>
                <p className="text-dark fw-bold mb-5 fs-1">
                  Introducing <span className='fs-1' style={{ color: "#80BC44" }}>BinBuddy</span>
                </p>
                <div className="lh-sm fs-5 mb-5">
                  <p className="text-dark">
                    <span style={{ color: "#80BC44" }}>BinBuddy</span> makes recycling simple
                  </p>
                  <p className="text-dark">and rewarding. Just snap a photo of your</p>
                  <p className="text-dark">waste - our AI identifies the type and tells</p>
                  <p className="text-dark">you how to dispose of it properly.</p>
                </div>
                <div className="lh-sm fs-5 mb-5">
                  <p className="text-dark">Scan a QR code or tap an NFC tag at a</p>
                  <p className="text-dark">verified bin to earn points, get real-time</p>
                  <p className="text-dark">feedback, and learn eco-friendly tips - all</p>
                  <p className="text-dark">from your phone or PWA.</p>
                </div>
                <div className="lh-sm fs-5 mb-5">
                  <p className="text-dark">Recycle smarter, get rewarded, and help</p>
                  <p className="text-dark">
                    the planet with <span style={{ color: "#80BC44" }}>BinBuddy</span>
                  </p>
                </div>
                <Link to="/categorizer" className="btn rounded-3 mb-5" style={{ backgroundColor: "#80BC44", color: "#fff" }}>Try Our App</Link>
              </div>
            </div>
            {/* Mobile view how it work */}
            <div className="d-block d-md-none" id='howItWorks' ref={howItWorksRef}>
              <div className="mt-5 mb-5">
                <p className="text-dark fw-bold text-center fs-1 mb-3">
                  How <span className='fs-1' style={{ color: "#80BC44" }}>BinBuddy</span> works?
                </p>
                <div className="d-flex align-items-center p-4">
                  <img
                    src="/1.png"
                    className="rounded-circle mb-3 me-3"
                    style={{ width: "60px", height: "60px", objectFit: "cover" }}
                    alt="Download"
                  />
                  <div>
                    <p className="text-dark fw-bold fs-3 mb-2">Download</p>
                    <p className="text-dark text-justify">
                      Install our Progressive Web App (PWA) directly from your browser for instant access—no app store needed
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center p-4">
                  <img
                    src="/2.png"
                    className="rounded-circle mb-3 me-3"
                    style={{ width: "60px", height: "60px", objectFit: "cover" }}
                    alt="Sign In"
                  />
                  <div>
                    <p className="text-dark fw-bold fs-3 mb-2">Sign In</p>
                    <p className="text-dark text-justify">
                      Log in securely using your Google account or email to start tracking your recycling journey
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center p-4">
                  <img
                    src="/3.png"
                    className="rounded-circle mb-3 me-3"
                    style={{ width: "60px", height: "60px", objectFit: "cover" }}
                    alt="Upload"
                  />
                  <div>
                    <p className="text-dark fw-bold fs-3 mb-2">Upload</p>
                    <p className="text-dark text-justify">
                      Snap or upload a photo of your trash using our AI-powered image categorizer
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center p-4">
                  <img
                    src="/4.png"
                    className="rounded-circle mb-3 me-3"
                    style={{ width: "60px", height: "60px", objectFit: "cover" }}
                    alt="Dispose"
                  />
                  <div>
                    <p className="text-dark fw-bold fs-3 mb-2">Dispose</p>
                    <p className="text-dark text-justify">
                      Follow the app's instructions to dispose of your trash at the nearest supported recycling station
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center p-4">
                  <img
                    src="/5.png"
                    className="rounded-circle mb-3 me-3"
                    style={{ width: "60px", height: "60px", objectFit: "cover" }}
                    alt="Rewarded"
                  />
                  <div>
                    <p className="text-dark fw-bold fs-3 mb-2">Rewarded</p>
                    <p className="text-dark text-justify">
                      Earn points for every valid disposal. Redeem them for rewards or track your eco-impact!
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="container mb-5 snap-child d-flex justify-content-center align-items-center mw-100" >
              <div className="py-5">
                <div className="row g-5">
                  <div className="col-md-4">
                    <div className="first-card d-flex flex-column justify-content-center align-items-center h-100">
                      <img src="/top-1.png" alt="" className='img-fluid rounded-circle' />
                      <h5 className="mt-2">{leaderboardData[0]?.username}</h5>
                      <div className='d-flex text-center text-align-center justify-content-center align-items-center flex-column'>
                        <InitialAvatar username={leaderboardData[0]?.username} size={60} />
                      </div>
                      <div className="d-flex justify-content-around mt-3 gap-4">
                        <div>
                          <small>Points Collected</small><br /><strong>{leaderboardData[0]?.totalPoints}</strong>
                        </div>
                        <div>
                          <small>Trash Thrown</small><br /><strong>{leaderboardData[0]?.trashThrown}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <h5 className="mb-4 fs-4 fw-semibold text-center">Top <span className="fs-4 semibold" style={{ color: "#80BC44" }}>BinBuddy</span> Users</h5>
                    <table className="table align-middle">
                      <thead className="table">
                        <tr>
                          <th scope="col" className='text-center'>#</th>
                          <th scope="col">User</th>
                          <th scope="col" className='text-center'>Points Collected</th>
                          <th scope="col" className='text-center'>Trash Thrown</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboardData.slice(1, 8).map((user, index) => (
                          <tr key={user.uid}>
                            <th scope="row" className='text-center' >
                              {index + 2 === 2 ? (
                                <img src="/top-2.png" alt="Top 2" className="img-fluid rounded-circle" style={{ width: '20px' }} />
                              ) : index + 2 === 3 ? (
                                <img src="/top-3.png" alt="Top 3" className="img-fluid rounded-circle" style={{ width: '20px' }} />
                              ) : (
                                index + 2
                              )}
                            </th>
                            <td className="d-flex align-items-center gap-2">
                              <InitialAvatar username={user.username} size={30} />
                              {user.username}
                            </td>
                            <td className='text-center'>{user.totalPoints.toLocaleString()}</td>
                            <td className='text-center'>{user.trashThrown}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                  </div>
                </div>
              </div>
            </div>
            {/* Mobile view download*/}
            { isInstallable && (
               <div className="d-block d-md-none mt-5" id='download' ref={downloadRef}>
              <div className="text-center">
                <img
                  src="/download-icon.png"
                  className="object-fit-cover rounded-start w-25 mb-5"
                  alt="Mobile Banner"
                />
                <p
                  className="fw-bold text-center fs-1 m-0"
                  style={{ color: "#80BC44" }}
                >
                  Download Our
                </p>
                <p
                  className="fw-bold text-center fs-1 m-0 mb-5"
                  style={{ color: "#80BC44" }}>
                  Progressive Web-App
                </p>
                <div className="lh-lg fs-4 mb-5">
                  <p className="text-dark mx-3">Get Recognized and Rewarded for Recycling the right way Today</p>
                </div>
                <button
                  className="btn rounded-3 ps-0 pe-0 mb-5"
                  style={{
                    backgroundColor: "#80BC44",
                    color: "#fff",
                    width: "28%",
                  }}
                  onClick={handleInstallClick}>
                  Try Our App
                </button>
              </div>
            </div>
            )}
           
            <div className="py-5 min-vh-100 justify-content-center p-3">
              <div className="text-center">
                <p className="fw-bold text-center fs-3 m-0" style={{ color: "#80BC44" }}>
                  FAQs
                </p>
                <p className="text-dark fw-bold text-center fs-5 mb-3">
                  Frequently Asked Questions
                </p>

                <div className="accordion" id="accordionPanelsStayOpenExample">
                  {/* Item 1 */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq1"
                        aria-expanded="true"
                        aria-controls="faq1"
                      >
                        What is a Trash Detection System?
                      </button>
                    </h2>
                    <div id="faq1" className="accordion-collapse collapse show">
                      <div className="accordion-body text-start text-justify">
                        A trash detection system uses artificial intelligence (AI) and computer
                        vision to automatically identify, classify, and track waste items. It
                        can be integrated with cameras or sensors to help improve waste
                        segregation, recycling, and overall waste management.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq2"
                        aria-expanded="false"
                        aria-controls="faq2"
                      >
                        How does the system detect trash?
                      </button>
                    </h2>
                    <div id="faq2" className="accordion-collapse collapse">
                      <div className="accordion-body text-start text-justify">
                        The system uses image recognition technology and machine learning models
                        trained on thousands of waste item images. When a camera captures a
                        trash item, the model analyzes it and classifies it into categories like
                        plastic, paper, metal, organic, or hazardous waste.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq3"
                        aria-expanded="false"
                        aria-controls="faq3"
                      >
                        Why is trash detection important?
                      </button>
                    </h2>
                    <div id="faq3" className="accordion-collapse collapse">
                      <div className="accordion-body text-start text-justify">
                        Trash detection automates the sorting process, reduces human error,
                        increases recycling rates, minimizes contamination in recyclable bins,
                        and supports sustainable waste management goals.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq4"
                        aria-expanded="false"
                        aria-controls="faq4"
                      >
                        What types of trash can be detected?
                      </button>
                    </h2>
                    <div id="faq4" className="accordion-collapse collapse">
                      <div className="accordion-body text-start text-justify">
                        Depending on the dataset and model used, the system can detect:
                        <ul>
                          <li>Plastic bottles</li>
                          <li>Aluminum cans</li>
                          <li>Glass</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq5"
                        aria-expanded="false"
                        aria-controls="faq5"
                      >
                        Does the system work in real-time?
                      </button>
                    </h2>
                    <div id="faq5" className="accordion-collapse collapse">
                      <div className="accordion-body text-start text-justify">
                        Yes, many implementations can perform real-time trash detection using
                        edge computing or live video streams, depending on the hardware and
                        processing power.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq6"
                        aria-expanded="false"
                        aria-controls="faq6"
                      >
                        Can the system improve recycling efficiency?
                      </button>
                    </h2>
                    <div id="faq6" className="accordion-collapse collapse">
                      <div className="accordion-body text-start text-justify">
                        Absolutely. By correctly sorting waste at the source, it reduces
                        contamination, improves recycling rates, and ensures proper disposal,
                        reducing landfill burden.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq7"
                        aria-expanded="false"
                        aria-controls="faq7"
                      >
                        Is the system environmentally friendly?
                      </button>
                    </h2>
                    <div id="faq7" className="accordion-collapse collapse">
                      <div className="accordion-body text-start text-justify">
                        Yes. It promotes sustainability by supporting proper waste sorting,
                        reducing landfill usage, and encouraging recycling and composting
                        practices.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="snap">
          <section className="hero snap-child">
            <div className="position-relative" style={{ height: "100vh", overflow: "hidden" }}>
              <Navbar />
              <img
                src="/hero.jpg"
                className="position-absolute w-100 h-100 object-fit-cover img-fluid"
                style={{ objectPosition: "50% 70%", filter: "brightness(30%)", opacity: "90%", zIndex: 1 }}
                alt="Background"
              />
              <div className="position-absolute top-50 start-50 translate-middle text-center w-100 px-3" style={{ zIndex: 2 }}>
                <div className="d-none d-md-block">
                  <p className="mb-2 fs-3 text-light">Smart Waste Management Start Here</p>
                  <p className="mb-4 fs-1 text-light fw-bold">AI-powered solution to identify, sort, and learn about waste</p>
                  <p className="mb-4 text-light fs-6">
                    From homes to public spaces, our app streamlines waste classification and user engagement. Powered by AI and enhanced with NFC/QR tools, it's designed for scalable, eco-conscious environments
                  </p>
                  <div className="d-grid gap-2 d-md-flex justify-content-center">
                    <Link to="/categorizer" className="btn rounded-3 px-4" style={{ backgroundColor: "#80BC44", color: "#fff" }}>Try Our App</Link>
                    <Link to="/?scrollTo=howItWorks" className="btn rounded-3 px-4" style={{ border: "1px solid #80BC44", color: "#fff" }}>Learn How it Works</Link>
                  </div>
                </div>
                <div className="d-block d-md-none">
                  <p className="mb-2 text-light fw-bold text-uppercase" style={{ fontSize: "1rem" }}>Smart Waste Management Start Here</p>
                  <p className="mb-3 text-light" style={{ fontSize: "0.75rem" }}>
                    From homes to public spaces, our app streamlines waste classification and user engagement. Powered by AI and enhanced with NFC/QR tools, it's designed for scalable, eco-conscious environments
                  </p>
                  <div className="d-grid gap-2">
                    <Link to="/categorizer" className="btn rounded-3 btn-sm" style={{ backgroundColor: "#80BC44", color: "#fff" }}>Try Our App</Link>
                    <Link to="/?scrollTo=howItWorks" className="btn rounded-3 px-4" style={{ border: "1px solid #80BC44", color: "#fff" }}>Learn How it Works</Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="container snap-child">
            <div className="row align-items-center" style={{ minHeight: "100vh" }}>
              <div className="col-md-8 col-12">
                <p className="text-dark fw-bold mb-3 fs-3">Introducing <span className="fs-3" style={{ color: "#80BC44" }}>BinBuddy</span></p>
                <p className="text-regular text-justify w-100 w-md-75 mb-3">
                  <span style={{ color: "#80BC44" }}>BinBuddy</span> is an AI-powered solution designed to make recycling easier, smarter, and more rewarding.
                  By simply uploading a photo of your waste, our system identifies the type of trash and provides instant guidance on how to dispose of it
                  properly. Whether it's recyclable, or compostable, <span style={{ color: "#80BC44" }}>BinBuddy</span> helps reduce confusion and ensures every item ends up in the right place —
                  all while making it accessible through your mobile device or Progressive Web App (PWA).
                </p>
                <p className="text-regular text-justify w-100 w-md-75">
                  Take recycling one step further by earning points every time you properly dispose of waste at one of our verified bins. Use our app to
                  scan QR codes or tap with NFC to verify your location, upload a photo, and get rewarded. With real-time feedback, educational tips, and
                  a growing reward system, <span style={{ color: "#80BC44" }}>BinBuddy</span> turns everyday disposal into a habit that benefits both you and the environment.
                </p>
                <Link to="/categorizer" className="btn rounded-3 f-9 me-2" style={{ backgroundColor: "#80BC44", color: "#fff", width: "100%", maxWidth: "200px" }}>Try Our App</Link>

              </div>
              <div className="col-md-4 col-12">
                <img src="/app-display.png" className="img-fluid object-fit-cover rounded-start" alt="Device preview" />
              </div>
            </div>
          </div>

          <div className="container snap-child" id='howItWorks' ref={howItWorksRef}>
            <div className="py-5 min-vh-100 d-flex flex-column justify-content-center">
              <p className="text-dark fw-bold text-center fs-3 mb-5">How <span className="fs-3" style={{ color: "#80BC44" }}>BinBuddy</span> works?</p>
              <div className="row justify-content-center">
                {[1, 2, 3, 4, 5].map((num, i) => (
                  <div key={i} className="col-md-2 col-10 text-center mx-md-3 mb-4">
                    <img
                      src={`/${num}.png`}
                      className="rounded-circle mb-3"
                      style={{ width: "60px", height: "60px", objectFit: "cover" }}
                      alt={`Step ${num}`}
                    />
                    <p className="text-dark fw-bold fs-5">{["Download", "Sign in", "Upload", "Dispose", "Rewarded"][i]}</p>
                    <p className="text-dark">{[
                      "Install our Progressive Web App (PWA) directly from your browser for instant access—no app store needed",
                      "Log in securely using your Google account or email to start tracking your recycling journey",
                      "Snap or upload a photo of your trash using our AI-powered image categorizer",
                      "Follow the app's instructions to dispose of your trash at the nearest supported recycling station",
                      "Earn points for every valid disposal. Redeem them for rewards or track your eco-impact!"
                    ][i]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="container snap-child d-flex justify-content-center align-items-center mw-100" >
            <div className="container py-5">
              <div className="row g-5">
                <div className="col-md-4">
                  <div className="first-card d-flex flex-column justify-content-center align-items-center h-100">
                    <img src="/top-1.png" alt="" className='img-fluid rounded-circle' />
                    <h5 className="mt-2">{leaderboardData[0]?.username}</h5>
                    <div className='d-flex text-center text-align-center justify-content-center align-items-center flex-column'>
                      <InitialAvatar username={leaderboardData[0]?.username} size={60} />
                    </div>
                    <div className="d-flex justify-content-around mt-3 gap-4">
                      <div>
                        <small>Points Collected</small><br /><strong>{leaderboardData[0]?.totalPoints}</strong>
                      </div>
                      <div>
                        <small>Trash Thrown</small><br /><strong>{leaderboardData[0]?.trashThrown}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-8">
                  <h5 className="mb-4 fs-4 fw-semibold">Top <span className="fs-4 semibold" style={{ color: "#80BC44" }}>BinBuddy</span> Users</h5>
                  <table className="table align-middle">
                    <thead className="table">
                      <tr>
                        <th scope="col" className='text-center'>#</th>
                        <th scope="col">User</th>
                        <th scope="col" className='text-center'>Points Collected</th>
                        <th scope="col" className='text-center'>Trash Thrown</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardData.slice(1, 8).map((user, index) => (
                        <tr key={user.uid}>
                          <th scope="row" className='text-center' >
                            {index + 2 === 2 ? (
                              <img src="/top-2.png" alt="Top 2" className="img-fluid rounded-circle" style={{ width: '20px' }} />
                            ) : index + 2 === 3 ? (
                              <img src="/top-3.png" alt="Top 3" className="img-fluid rounded-circle" style={{ width: '20px' }} />
                            ) : (
                              index + 2
                            )}
                          </th>
                          <td className="d-flex align-items-center gap-2">
                            <InitialAvatar username={user.username} size={30} />
                            {user.username}
                          </td>
                          <td className='text-center'>{user.totalPoints.toLocaleString()}</td>
                          <td className='text-center'>{user.trashThrown}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>
              </div>
            </div>
          </div>


          <div className="container snap-child m-0 d-flex justify-content-center align-item-center mw-100" style={{ backgroundColor: "#FEFBEB" }} id='download' ref={downloadRef}>
            <div className="py-5 min-vh-100 d-flex flex-column justify-content-center">
              <div className="text-center">
                <img src="/download-icon.png" className="img-fluid mb-3" style={{ width: "150px", height: "150px" }} alt="Download App" />
                <h1 className="fw-bold text-center fs-2 mb-3" style={{ color: "#80BC44" }}>Download Our Progressive Web-App (PWA)</h1>
                <p className="fw-regular text-center fs-4 mb-3" style={{ color: "#244c4c" }}>Get Recognized and Rewarded for Recycling the right way Today</p>
                <div className="d-flex justify-content-center">
                  {isInstallable ? (
                    <button className="download" onClick={handleInstallClick}>
                      <span className="download-content">Install PWA </span>
                    </button>
                  ) : (
                    <p className="text-muted mt-5">Open our site on your mobile and install our PWA!</p>  
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="container snap-child mw-100" style={{ backgroundColor: "#f5faf0" }}>
            <div className="py-5 min-vh-100 justify-content-center">
              <div className="text-center">
                <p className="fw-bold text-center fs-3 m-0" style={{ color: "#80BC44" }}>FAQs</p>
                <p className="text-dark fw-bold text-center fs-5 mb-3">Frequently Asked Questions</p>
                <div className="accordion" id="accordionPanelsStayOpenExample" style={{ maxWidth: "800px", margin: "0 auto" }}>
                  {[
                    {
                      q: "How does BinBuddy identify what type of trash I upload?",
                      a: "BinBuddy uses AI-powered image recognition to analyze the photo you upload. It compares the image with trained models to categorize the item as plastic, paper, metal, glass, or general waste.",
                    },
                    {
                      q: "Do I need to install an app to use BinBuddy?",
                      a: "No need! BinBuddy is a Progressive Web App (PWA). You can use it directly from your browser and even install it to your home screen for an app-like experience and no app store required.",
                    },
                    {
                      q: "Why can’t I upload the same image again to claim more points?",
                      a: "BinBuddy uses image hashing to detect duplicate or similar uploads. This ensures fairness and prevents users from reusing the same image to gain rewards.",
                    },
                    {
                      q: "What do I need to do after uploading a photo?",
                      a: "After uploading and identifying your trash, go to a verified BinBuddy station and scan its QR code (or tap with NFC if available) to dispose of it properly and claim your points.",
                    },
                    {
                      q: "How long do I have to claim my points after uploading an image?",
                      a: "You typically have a limited time window of 3 hours to claim your points before they expire. This encourages timely and proper disposal.",
                    },
                    {
                      q: "What can I do with the points I earn?",
                      a: "At the moment, BinBuddy awards points to recognize your effort in proper waste disposal. While these points aren’t redeemable for prizes yet, they reflect your positive environmental impact and may be used for future achievements, rankings, or programs.",
                    },
                    {
                      q: "Is BinBuddy suitable for schools, communities, or public events?",
                      a: "Absolutely. BinBuddy is designed to scale from personal use to large community programs by supporting multiple verified bins, user tracking, and data reporting.",
                    },
                  ].map((faq, i) => (
                    <div className="accordion-item" key={i}>
                      <h2 className="accordion-header">
                        <button className={`accordion-button${i === 0 ? "" : " collapsed"}`} type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${i}`} aria-expanded={i === 0} aria-controls={`collapse${i}`}>
                          {faq.q}
                        </button>
                      </h2>
                      <div id={`collapse${i}`} className={`accordion-collapse collapse${i === 0 ? " show" : ""}`}>
                        <div className="accordion-body text-start">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div >
      )}

    </>
  )
}

export default Homepage;