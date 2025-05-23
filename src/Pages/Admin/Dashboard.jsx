import React, { useEffect } from 'react'
import Sidebar from './Components/sidebar'

const Dashboard = () => {

  return (
    <>
      <div className="app-wrapper">
        <nav className="app-header navbar navbar-expand bg-body">
          <div className="container-fluid">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" data-lte-toggle="sidebar" href="#" role="button">
                  <i className="bi bi-list"></i>
                </a>
              </li>
              <li className="nav-item d-none d-md-block"><a href="#" className="nav-link">Home</a></li>
              <li className="nav-item d-none d-md-block"><a href="#" className="nav-link">Contact</a></li>
            </ul>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" data-widget="navbar-search" href="#" role="button">
                  <i className="bi bi-search"></i>
                </a>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link" data-bs-toggle="dropdown" href="#">
                  <i className="bi bi-chat-text"></i>
                  <span className="navbar-badge badge text-bg-danger">3</span>
                </a>
                <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
                  <a href="#" className="dropdown-item">
                    <div className="d-flex">
                      <div className="flex-shrink-0">
                        <img
                          src="../../dist/assets/img/user1-128x128.jpg"
                          alt="User Avatar"
                          className="img-size-50 rounded-circle me-3"
                        />
                      </div>
                      <div className="flex-grow-1">
                        <h3 className="dropdown-item-title">
                          Brad Diesel
                          <span className="float-end fs-7 text-danger"
                          ><i className="bi bi-star-fill"></i
                          ></span>
                        </h3>
                        <p className="fs-7">Call me whenever you can...</p>
                        <p className="fs-7 text-secondary">
                          <i className="bi bi-clock-fill me-1"></i> 4 Hours Ago
                        </p>
                      </div>
                    </div>
                  </a>
                  <div className="dropdown-divider"></div>
                  <a href="#" className="dropdown-item">
                    <div className="d-flex">
                      <div className="flex-shrink-0">
                        <img
                          src="../../dist/assets/img/user8-128x128.jpg"
                          alt="User Avatar"
                          className="img-size-50 rounded-circle me-3"
                        />
                      </div>
                      <div className="flex-grow-1">
                        <h3 className="dropdown-item-title">
                          John Pierce
                          <span className="float-end fs-7 text-secondary">
                            <i className="bi bi-star-fill"></i>
                          </span>
                        </h3>
                        <p className="fs-7">I got your message bro</p>
                        <p className="fs-7 text-secondary">
                          <i className="bi bi-clock-fill me-1"></i> 4 Hours Ago
                        </p>
                      </div>
                    </div>
                  </a>
                  <div className="dropdown-divider"></div>
                  <a href="#" className="dropdown-item">
                    <div className="d-flex">
                      <div className="flex-shrink-0">
                        <img
                          src="../../dist/assets/img/user3-128x128.jpg"
                          alt="User Avatar"
                          className="img-size-50 rounded-circle me-3"
                        />
                      </div>
                      <div className="flex-grow-1">
                        <h3 className="dropdown-item-title">
                          Nora Silvester
                          <span className="float-end fs-7 text-warning">
                            <i className="bi bi-star-fill"></i>
                          </span>
                        </h3>
                        <p className="fs-7">The subject goes here</p>
                        <p className="fs-7 text-secondary">
                          <i className="bi bi-clock-fill me-1"></i> 4 Hours Ago
                        </p>
                      </div>
                    </div>
                  </a>
                  <div className="dropdown-divider"></div>
                  <a href="#" className="dropdown-item dropdown-footer">See All Messages</a>
                </div>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link" data-bs-toggle="dropdown" href="#">
                  <i className="bi bi-bell-fill"></i>
                  <span className="navbar-badge badge text-bg-warning">15</span>
                </a>
                <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
                  <span className="dropdown-item dropdown-header">15 Notifications</span>
                  <div className="dropdown-divider"></div>
                  <a href="#" className="dropdown-item">
                    <i className="bi bi-envelope me-2"></i> 4 new messages
                    <span className="float-end text-secondary fs-7">3 mins</span>
                  </a>
                  <div className="dropdown-divider"></div>
                  <a href="#" className="dropdown-item">
                    <i className="bi bi-people-fill me-2"></i> 8 friend requests
                    <span className="float-end text-secondary fs-7">12 hours</span>
                  </a>
                  <div className="dropdown-divider"></div>
                  <a href="#" className="dropdown-item">
                    <i className="bi bi-file-earmark-fill me-2"></i> 3 new reports
                    <span className="float-end text-secondary fs-7">2 days</span>
                  </a>
                  <div className="dropdown-divider"></div>
                  <a href="#" className="dropdown-item dropdown-footer"> See All Notifications </a>
                </div>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#" data-lte-toggle="fullscreen">
                  <i data-lte-icon="maximize" className="bi bi-arrows-fullscreen"></i>
                  <i data-lte-icon="minimize" className="bi bi-fullscreen-exit"></i>
                </a>
              </li>
              <li className="nav-item dropdown user-menu">
                <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                  <img
                    src="../../dist/assets/img/user2-160x160.jpg"
                    className="user-image rounded-circle shadow"
                    alt="User Image"
                  />
                  <span className="d-none d-md-inline">Alexander Pierce</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
                  <li className="user-header text-bg-primary">
                    <img
                      src="../../dist/assets/img/user2-160x160.jpg"
                      className="rounded-circle shadow"
                      alt="User Image"
                    />
                    <p>
                      Alexander Pierce - Web Developer
                      <small>Member since Nov. 2023</small>
                    </p>
                  </li>
                  <li className="user-body">
                    <div className="row">
                      <div className="col-4 text-center"><a href="#">Followers</a></div>
                      <div className="col-4 text-center"><a href="#">Sales</a></div>
                      <div className="col-4 text-center"><a href="#">Friends</a></div>
                    </div>
                  </li>
                  <li className="user-footer">
                    <a href="#" className="btn btn-default btn-flat">Profile</a>
                    <a href="#" className="btn btn-default btn-flat float-end">Sign out</a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>
        <Sidebar />
        <main className="app-main">
          <div className="app-content-header">
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm-6"><h3 className="mb-0">Dashboard</h3></div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-end">
                    <li className="breadcrumb-item"><a href="#">Home</a></li>
                    <li className="breadcrumb-item active" aria-current="page">Dashboard</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          <div className="app-content">
            <div className="container-fluid">
              <div className="row">
                <div className="col-lg-3 col-6">
                  <div className="small-box text-bg-success">
                    <div className="inner">
                      <h3>00</h3>
                      <p>Empty Bins</p>
                    </div>
                    <svg
                      className="small-box-icon"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
                      ></path>
                    </svg>
                    <a
                      href="#"
                      className="small-box-footer link-light link-underline-opacity-0 link-underline-opacity-50-hover"
                    >
                    </a>
                  </div>
                </div>
                <div className="col-lg-3 col-6">
                  <div className="small-box text-bg-warning">
                    <div className="inner">
                      <h3>00</h3>
                      <p>Half Bin</p>
                    </div>
                    <svg
                      className="small-box-icon"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z"
                      ></path>
                    </svg>
                    <a
                      href="#"
                      className="small-box-footer link-light link-underline-opacity-0 link-underline-opacity-50-hover"
                    >
                    </a>
                  </div>
                </div>
                <div className="col-lg-3 col-6">
                  <div className="small-box text-bg-danger">
                    <div className="inner">
                      <h3>00</h3>
                      <p>Full Bin</p>
                    </div>
                    <svg
                      className="small-box-icon"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z"
                      ></path>
                    </svg>
                    <a
                      href="#"
                      className="small-box-footer link-dark link-underline-opacity-0 link-underline-opacity-50-hover"
                    >
                    </a>
                  </div>
                </div>
              </div>
              <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                  <a className="nav-link active" aria-current="page" href="#">All</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-dark">Empty</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-dark">Half</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-dark">Full</a>
                </li>
              </ul>
              <div className="row">

              </div>
            </div>
          </div>
        </main>
        <footer className="app-footer">
          <div className="float-end d-none d-sm-inline">Anything you want</div>
          <strong>
            Copyright &copy; 2014-2024&nbsp;
            <a href="https://adminlte.io" className="text-decoration-none">AdminLTE.io</a>.
          </strong>
          All rights reserved.
        </footer>
      </div>
    </>
  );
};

export default Dashboard;