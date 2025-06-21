import React from 'react';
import Navbar from '../Components/Navbar/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import './Homepage.css';
import { Link } from 'react-router-dom';

function Homepage() {

  return (

    <div className="snap">

      <section className="hero snap-child">

        <div className="position-relative" style={{ height: "100vh", overflow: "hidden" }}>
          <Navbar />
          <img
            src="../../public/hero.jpg"
            className="position-absolute w-100 h-100 object-fit-cover"
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
                <button className="btn rounded-3 px-4" style={{ border: "1px solid #80BC44", color: "#fff" }}>Learn How it Works</button>
              </div>
            </div>
            <div className="d-block d-md-none">
              <p className="mb-2 text-light fw-bold text-uppercase" style={{ fontSize: "1rem" }}>Smart Waste Management Start Here</p>
              <p className="mb-3 text-light" style={{ fontSize: "0.75rem" }}>
                From homes to public spaces, our app streamlines waste classification and user engagement. Powered by AI and enhanced with NFC/QR tools, it's designed for scalable, eco-conscious environments
              </p>
              <div className="d-grid gap-2">
                <Link to="/categorizer" className="btn rounded-3 btn-sm" style={{ backgroundColor: "#80BC44", color: "#fff" }}>Try Our App</Link>
                <button className="btn btn-sm rounded-3" style={{ border: "1px solid #80BC44", color: "#fff" }}>Learn More</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container snap-child">
        <div className="row align-items-center" style={{ minHeight: "100vh" }}>
          <div className="col-md-8 col-12">
            <p className="text-dark fw-bold mb-3 fs-3">Introducing <span className="fs-3" style={{ color: "#80BC44" }}>BinBuddy</span></p>
            <p className="text-regular text-justify w-75 mb-3">
              <span style={{ color: "#80BC44" }}>BinBuddy</span> is an AI-powered solution designed to make recycling easier, smarter, and more rewarding.
              By simply uploading a photo of your waste, our system identifies the type of trash and provides instant guidance on how to dispose of it
              properly. Whether it's recyclable, or compostable, <span style={{ color: "#80BC44" }}>BinBuddy</span> helps reduce confusion and ensures every item ends up in the right place —
              all while making it accessible through your mobile device or Progressive Web App (PWA).
            </p>
            <p className="text-regular text-justify w-75">
              Take recycling one step further by earning points every time you properly dispose of waste at one of our verified bins. Use our app to
              scan QR codes or tap with NFC to verify your location, upload a photo, and get rewarded. With real-time feedback, educational tips, and
              a growing reward system, <span style={{ color: "#80BC44" }}>BinBuddy</span> turns everyday disposal into a habit that benefits both you and the environment.
            </p>
            <button className="btn rounded-3 f-9 me-2" style={{ backgroundColor: "#80BC44", color: "#fff", width: "20%" }}>
              Try Our App
            </button>
          </div>
          <div className="col-md-4 col-12">
            <img src="../../public/app-display.png" className="object-fit-cover rounded-start" style={{ width: "150%", height: "100%", objectPosition: "35% 70%" }} alt="Device preview" />
          </div>
        </div>
      </div>
      <div className="container snap-child">
        <div className="py-5 min-vh-100 d-flex flex-column justify-content-center">
          <p className="text-dark fw-bold text-center fs-3 mb-5">How <span className="fs-3" style={{ color: "#80BC44" }}>BinBuddy</span> works?</p>
          <div className="row justify-content-center">
            {[1, 2, 3, 4, 5].map((num, i) => (
              <div key={i} className="col-md-2 col-10 text-center mx-3 mb-4">
                <img
                  src={`/${num}.png`}
                  className="rounded-circle mb-3"
                  style={{ width: "60px", height: "60px", objectFit: "cover" }}
                  alt={`Step ${num}`}
                />
                <p className="text-dark fw-bold fs-5">{["Download", "Sign in", "Upload", "Dispose", "Rewarded"][i]}</p>
                <p className="text-dark">Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container snap-child">
        <div className="py-5 min-vh-100 d-flex flex-column justify-content-center">
          <div className="text-center">
            <p className="text-dark fw-bold text-center fs-5 mb-3">Download Now</p>
            <p className="fw-bold text-center fs-3 mb-3" style={{ color: "#80BC44" }}>Get Recognized and Rewarded for Recycling the right way Today</p>
            <button className="btn rounded-3 f-9" type="button" style={{ backgroundColor: "#80BC44", color: "#fff", width: "20%" }}>
              Try Our App
            </button>
          </div>
          <img src="../../public/Device_Mockup.png" className="img-fluid w-100" style={{ height: "auto" }} alt="Device Mockup" />
        </div>
      </div>

      <div className="container snap-child">
        <div className="py-5 min-vh-100 justify-content-center">
          <div className="text-center">
            <p className="fw-bold text-center fs-3 m-0" style={{ color: "#80BC44" }}>FAQs</p>
            <p className="text-dark fw-bold text-center fs-5 mb-3">Frequently Asked Questions</p>
            <div className="accordion" id="accordionPanelsStayOpenExample">
              {[
                {
                  q: "What is a Trash Detection System?",
                  a: "A trash detection system uses artificial intelligence (AI) and computer vision...",
                },
                {
                  q: "How does the system detect trash?",
                  a: "The system uses image recognition technology and machine learning models...",
                },
                {
                  q: "Why is trash detection important?",
                  a: "Trash detection automates the sorting process, reduces human error...",
                },
                {
                  q: "What types of trash can be detected?",
                  a: "Depending on the dataset and model used, the system can detect: Plastic bottles, Aluminum cans, Glass",
                },
                {
                  q: "Does the system work in real-time?",
                  a: "Yes, many implementations can perform real-time trash detection...",
                },
                {
                  q: "Can the system improve recycling efficiency?",
                  a: "Absolutely. By correctly sorting waste at the source, it reduces contamination...",
                },
                {
                  q: "Is the system environmentally friendly?",
                  a: "Yes. It promotes sustainability by supporting proper waste sorting...",
                },
              ].map((faq, i) => (
                <div className="accordion-item" key={i}>
                  <h2 className="accordion-header">
                    <button className={`accordion-button${i === 0 ? "" : " collapsed"}`} type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${i}`} aria-expanded={i === 0} aria-controls={`collapse${i}`}>
                      {faq.q}
                    </button>
                  </h2>
                  <div id={`collapse${i}`} className={`accordion-collapse collapse${i === 0 ? " show" : ""}`}>
                    <div className="accordion-body text-start text-justify">
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}

export default Homepage;