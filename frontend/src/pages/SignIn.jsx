import React, { useContext, useState } from "react";
import bg from "../assets/authBg.png";
import { useNavigate } from "react-router-dom";
import { IoEye, IoEyeOff } from "react-icons/io5";
import axios from "axios";
import { userDataContext } from "../context/userContext";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { serverURL,userData, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading,setLoading] = useState(false);

  const handleSignin = async e => {
    e.preventDefault();
    setError("");
    setLoading(true)
    try {
      let res = await axios.post(
        `${serverURL}/api/auth/login`,
        {
          email,
          password
        },
        { withCredentials: true }
      );

   setUserData(res.data)
     
     navigate('/customize');
      setLoading(false);
    } catch (error) {
      console.log(error);
      setError(error.response.data.message);
     setUserData(null);
      setLoading(false)
    }
  };

  return (
    <div
      className="w-full h-[100vh] bg-cover flex justify-center items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        onSubmit={handleSignin}
        className="w-[90%] h-[600px] max-w-[500px] bg-[rgba(0,0,0,0.41)] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-20"
      >
        <h1 className="text-white text-[30px] font-semibold mb-[30px]">
          Login to <span className="text-blue-300">Virtual AI</span>
        </h1>

        <input
          type="email"
          placeholder="Enter Your Email"
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] rounded-full py-[10px] text-[18px]"
          required
          onChange={e => setEmail(e.target.value)}
          value={email}
        />

        <div className="relative w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px]">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full h-full outline-none bg-transparent text-white placeholder-gray-300 px-[20px] rounded-full py-[10px] text-[18px]"
            placeholder="Enter Your Password"
            required
            onChange={e => setPassword(e.target.value)}
            value={password}
          />
          {showPassword
            ? <IoEyeOff
                className="absolute top-[20px] right-[16px] text-white w-[25px] h-[25px] cursor-pointer"
                onClick={() => setShowPassword(false)}
              />
            : <IoEye
                className="absolute top-[20px] right-[16px] text-white w-[25px] h-[25px] cursor-pointer"
                onClick={() => setShowPassword(true)}
              />}
        </div>
        {error.length > 0 &&
          <p className="text-red-500">
            {error}
          </p>}
        <button
          type="submit"
          className="min-w-[150px] mt-[13px] h-[60px] bg-white rounded-full text-black font-semibold text-[19px]"  disabled={loading}
        >
          {loading ? "loading..." : "Login" }
        </button>

        <p className="text-white text-[18px]">
          Want to create an new account ?{" "}
          <span
            className="text-blue-300 cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            SignUp
          </span>
        </p>
      </form>
    </div>
  );
};

export default SignIn;
