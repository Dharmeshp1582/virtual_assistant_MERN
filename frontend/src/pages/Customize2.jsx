import React, { useContext, useState } from "react";
import { userDataContext } from "../context/userContext";
import axios from "axios";
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Customize2 = () => {
  const {
    userData,
    backendImage,
    frontendImage,
    selectedImage,
    serverURL,
    setUserData,
  } = useContext(userDataContext);
  const [assistantName, setAssistantName] = useState(
    userData?.assistantName || ""
  );
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  
  const handleUpdateAssistant = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("assistantName", assistantName);
      if (backendImage) {
        formData.append("assistantImage", backendImage);
      } else {
        formData.append("imageUrl", selectedImage); // <-- use imageUrl (lowercase "l")
      }
      const result = await axios.post(
        `${serverURL}/api/user/update`,
        formData,
        { withCredentials: true }
      );
      setLoading(false);
      setUserData(result.data); // Ensure context is updated with new image
      navigate("/");
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };


  return (
    <div className="w-full  h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex flex-col items-center justify-center gap-[15px] relative  overflow-y-auto">
      <MdKeyboardBackspace
        className="absolute top-[30px] left-[30px] text-white w-[25px] h-[25px] cursor-pointer"
        onClick={() => navigate("/customize")}
      />

      <h1 className="text-white text-[30px] mb-[20px] text-center">
        Select Your <span className="text-blue-300">Assistant Image</span>
      </h1>

      {/* Image Preview */}
      {selectedImage === "input" && frontendImage && (
        <img
          src={frontendImage}
          alt="Selected"
          className="w-[150px] h-[250px] object-cover rounded-2xl mb-4"
        />
      )}
      {selectedImage !== "input" && selectedImage && (
        <img
          src={selectedImage}
          alt="Selected"
          className="w-[150px] h-[250px] object-cover rounded-2xl mb-4"
        />
      )}

      <input
        type="text"
        placeholder="eg: Shifra"
        className="min-w-[150px] w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] rounded-full py-[10px] text-[18px]"
        required
        onChange={(e) => setAssistantName(e.target.value)}
        value={assistantName}
      />

      {assistantName && (
        <button
          className="min-w-[150px] mt-[13px] h-[60px] bg-white rounded-full text-black font-semibold text-[19px] cursor-pointer"
          disabled={loading}
          onClick={() => {
            handleUpdateAssistant();
          }}
        >
          {!loading ? "Create Your Assistant Now" : "loading..."}
        </button>
      )}
    </div>
  );
};

export default Customize2;
