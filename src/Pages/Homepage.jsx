import React from 'react';
import Navbar from '../Components/Navbar/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

//import test firebase firestore
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

//import admin test
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

// testing for firebase firestore
const addData = async () => {
  try {
    const docRef = await addDoc(collection(db, "dummy"), {
      name: "John Doe",
      email: "test"
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding document: ", error);
  }
}

const Homepage = () => {

  // testing for checking if user claim is admin
 const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      user.getIdTokenResult()
        .then((idTokenResult) => {
          if (idTokenResult.claims.admin) {
            console.log("User is admin");
          } else {
            console.log("User is not admin");
          }
        })
        .catch((error) => {
          console.log("Error getting token result:", error);
        });
    }
  }, [user, loading]);

  return (
    <div>
      <Navbar />

      {/* Testing for firebase firestore */}
      <div className="container mt-5">


        <button className="btn btn-primary" onClick={addData}>
          Click Me
        </button>
      </div>
    </div>
  )
}

export default Homepage;