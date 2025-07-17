import React, { createContext, useEffect, useState } from "react";
export const userDataContext = createContext();
import axios from "axios";

const UserContext = ({ children }) => {
  const serverURL = "http://localhost:8000";
  const [userData, setUserData] = useState(null);
   const [frontendImage,setFrontendImage] = useState(null);
      const [backendImage,setBackendImage] = useState(null);
      const [selectedImage , setSelectedImage] = useState(null)
     
  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverURL}/api/user/current`,{
        withCredentials: true
      });

      setUserData(result.data)
      console.log(result.data)
    } catch (error) {
      console.log(error)
    }
  };

  const getGeminiResponse = async (command) => {
  try {
    const result = await axios.post(`${serverURL}/api/user/asktoassistant`, 
      { command },{withCredentials: true})

      return result.data;
  } catch (error) {
    console.log(error)
  }
  }

  useEffect(()=>{
    handleCurrentUser()
  },[])

  const value = {
    serverURL,userData, setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,selectedImage , setSelectedImage, getGeminiResponse 
  };


  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  );
};

export default UserContext;
