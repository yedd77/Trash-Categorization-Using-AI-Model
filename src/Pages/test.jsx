import React from 'react'
import Navbar from '../Components/Navbar/Navbar'

const test = () => {
  return (
    <>
      <Navbar />
      <div className="container-fluid">
        <div className="d-flex flex-column" style={{ minHeight: '90vh' }}>
          <div className="d-flex flex-column flex-grow-1 pt-5" id="page-3">
            <div className="main-section container">
              <div className="result-card">
                <img src="https://cdn1.npcdn.net/images/1593584628fb904e0fb02092edd14651cf0f25c4a4.webp?md5id=6281642964070c8fc6df23720ee81281&new_width=1000&new_height=1000&w=1652761475&from=jpg" alt="Plastic Bag" />
                <div className="text-block">
                  <p className="fw-bold empty fs-2 mb-2">Plastic Bag (Plastic)</p>
                  <p className="text-muted lh-sm mb-2">Please rinse and throw it in our blue recycle bin</p>
                  <p className="text-muted lh-sm">
                    Almost there!
                    <br />
                    Install our app and dispose of your waste properly to start earning rewards.
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-3">
                <button className="btn btn-custom" id="btn-3" >
                  <i className="bi bi-check2-square"></i> Classify More
                </button>
              </div>
            </div>
            <div className="mt-auto text-center px-4 pb-3">
              <p className="fw-semibold empty text-muted">
                Install our app to get rewarded each time you scan and throw it correctly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default test