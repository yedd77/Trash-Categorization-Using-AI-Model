import React, { useState } from 'react'
import Navbar from '../Components/Navbar/Navbar';
import {useDropzone} from 'react-dropzone'
import './categorizer.css'

const Categorizer = () => {

  const [files, setFiles] =  useState([])
  const {getRootProps, getInputProps} = useDropzone ({
    accept : 'image/*',
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) => Object.assign(file, {
          preview: URL.createObjectURL(file)
        }))
      )
      console.log(acceptedFiles)
    }
  })

  const images = files.map((file) => (
    <img key={file.name} src={file.preview} alt="dropped image" 
    style={{width:'200px' , height:"200px"}}/>
  ))
   

  return (
    <>
    <Navbar />
    <div>Categorizer</div>
    <div className="dropArea" {...getRootProps()}>
      <input {...getInputProps()} /> 
      <p>Drag 'n' drop some files here, or click to select files</p>
    </div>
    <div>{images}</div>
    </>
    
  )
}

export default Categorizer