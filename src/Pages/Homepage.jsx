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
            <button className="btn rounded-3 f-9 me-2" style={{ backgroundColor: "#80BC44", color: "#fff", width: "100%", maxWidth: "200px" }}>
              Try Our App
            </button>
          </div>
          <div className="col-md-4 col-12">
            <img src="../../public/app-display.png" className="img-fluid object-fit-cover rounded-start" alt="Device preview" />
          </div>
        </div>
      </div>

      <div className="container snap-child">
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

      <div className="container snap-child m-0 d-flex justify-content-center align-item-center mw-100" style={{ backgroundColor: "#FEFBEB" }}>
        <div className="py-5 min-vh-100 d-flex flex-column justify-content-center">
          <div className="text-center">
            <img src="../../public/download-icon.png" className="img-fluid mb-3" style={{ width: "150px", height: "150px" }} alt="Download App" />
            <h1 className="fw-bold text-center fs-2 mb-3" style={{ color: "#80BC44" }}>Download Our Progressive Web-App (PWA)</h1>
            <p className="fw-regular text-center fs-4 mb-3" style={{ color: "#244c4c" }}>Get Recognized and Rewarded for Recycling the right way Today</p>
            <div className="d-flex justify-content-center">
              <button className="btn rounded-3 f-9 w-100" type="button" style={{ backgroundColor: "#80BC44", color: "#fff", maxWidth: "200px" }}>
                Try Our App
              </button>
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
    </div>

  )
}

export default Homepage;