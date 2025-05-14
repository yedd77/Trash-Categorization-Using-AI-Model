import React from 'react'
import Navbar from '../Components/Navbar/Navbar'
import "./ForgotPass.css"

const Categorizer = () => {
  return (
    <div>
      <Navbar />
      <div className="container-fluid">
        <div className="d-flex flex-column" style={{ minHeight: '90vh' }}>
          {/* Page 1 */}
          <div className="d-flex flex-column flex-grow-1 pt-5" id="page-1">
            <p className="fw-bold empty fs-2 text-center">What Kind of Trash Is This</p>
            <p className="fw-semibold empty text-muted text-center lh-sm">Not sure what kind of trash you have? Upload picture</p>
            <p className="fw-semibold empty text-muted text-center lh-sm mb-5">and let us figure it out for you.</p>

            <div className="d-flex justify-content-center mb-5">
              <div className="card border-0 rounded-4 shadow resizeCard" style={{ height: '30vh' }}>
                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                  <button
                    className="btn btn-lg rounded-4 col-8 mb-4 shadow fw-bold"
                    id="btn-1"
                    type="button"
                    style={{ backgroundColor: '#80BC44', color: '#fff' }}
                    onClick={() => showPage('page-2')}
                  >
                    <i className="bi bi-upload me-3"></i>Upload Image
                  </button>
                  <p className="fw-semibold empty f-9 text-muted lh-sm">or drop a file here</p>
                  <p className="fw-semibold empty f-9 text-muted lh-sm">CTRL + V to paste an image</p>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-center mb-4">
              <div className="text-center me-3">
                <p className="fw-semibold empty f-8 text-muted">No image?</p>
                <p className="fw-semibold empty f-8 text-muted">Try one of these images</p>
              </div>
              <img
                src="https://cdn1.npcdn.net/images/1593584628fb904e0fb02092edd14651cf0f25c4a4.webp?md5id=6281642964070c8fc6df23720ee81281&new_width=1000&new_height=1000&w=1652761475&from=jpg"
                className="rounded-3 me-3"
                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
              />
              <img
                src="https://cdn1.npcdn.net/images/1593584628fb904e0fb02092edd14651cf0f25c4a4.webp?md5id=6281642964070c8fc6df23720ee81281&new_width=1000&new_height=1000&w=1652761475&from=jpg"
                className="rounded-3 me-3"
                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
              />
              <img
                src="https://cdn1.npcdn.net/images/1593584628fb904e0fb02092edd14651cf0f25c4a4.webp?md5id=6281642964070c8fc6df23720ee81281&new_width=1000&new_height=1000&w=1652761475&from=jpg"
                className="rounded-3 me-3"
                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
              />
            </div>

            <div className="mt-auto text-center px-4 pb-3">
              <p className="fw-semibold empty text-muted">
                Install our app to get rewarded each time you scan and throw it correctly.
              </p>
            </div>
          </div>

          {/* Page 2 */}
          <div className="d-flex flex-column flex-grow-1 pt-5 d-none" id="page-2">
            <p className="fw-bold empty fs-2 text-center">What Kind of Trash Is This</p>
            <p className="fw-semibold empty text-muted text-center lh-sm">Not sure what kind of trash you have? Upload picture</p>
            <p className="fw-semibold empty text-muted text-center lh-sm mb-5">and let us figure it out for you.</p>

            <div className="d-flex justify-content-center mb-5">
              <div className="card border-0" style={{ height: '30vh' }}>
                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                  <img
                    src="https://cdn1.npcdn.net/images/1593584628fb904e0fb02092edd14651cf0f25c4a4.webp?md5id=6281642964070c8fc6df23720ee81281&new_width=1000&new_height=1000&w=1652761475&from=jpg"
                    alt="Plastic Bag"
                    className="rounded-3 mb-3"
                    style={{ objectFit: 'cover', height: '200px', width: '100%', margin: '0 auto' }}
                  />
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                className="btn btn-lg rounded-4 col-3 mb-4 shadow fw-bold text-center"
                id="btn-2"
                type="button"
                style={{ backgroundColor: '#80BC44', color: '#fff' }}
                onClick={() => showPage('page-3')}
              >
                <i className="bi bi-lightbulb-fill me-2"></i>Classify Trash
              </button>
            </div>

            <div className="mt-auto text-center px-4 pb-3">
              <p className="fw-semibold empty text-muted">
                Install our app to get rewarded each time you scan and throw it correctly.
              </p>
            </div>
          </div>

          {/* Page 3 */}
          <div className="d-flex flex-column flex-grow-1 pt-5 d-none" id="page-3">
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
                <button className="btn btn-custom" id="btn-3" onClick={() => showPage('page-1')}>
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
    </div>
  )
}

export default Categorizer