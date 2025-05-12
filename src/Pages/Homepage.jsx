import React from 'react';
import Navbar from '../Components/Navbar/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';


     
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