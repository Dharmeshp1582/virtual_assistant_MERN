import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ai from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";

const Home = () => {
  const {
    userData,
    serverURL,
    setUserData,
    getGeminiResponse,
    previewAssistantImage,
  } = useContext(userDataContext);
  
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [ham, setHam] = useState(false);
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const synth = window.speechSynthesis;

  // Debug: log userData changes to ensure Home gets the latest image
  useEffect(() => {
    // This will run whenever userData changes
    // console.log('Home userData:', userData);
  }, [userData]);

  const handleLogout = async () => {
    try {
      const result = await axios.get(`${serverURL}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.error(error);
    }
  };

  const startRecognition = () => {
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch (error) {
      if (!error.message.includes("start")) {
        console.error("Recognition error:", error);
      }
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    const voices = synth.getVoices();
    const hindiVoice = voices.find((v) => v.lang === "hi-IN");
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    isSpeakingRef.current = true;
    utterance.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      startRecognition();
    };
    synth.speak(utterance);
  };

  const handleCommand = async (data) => {
    const { type, userInput, response } = data;
    speak(response);

    const urlMap = {
      "notepad-open": "https://notepad.com",
      "text-editor-open": "https://codepen.io",
      "instagram-open": "https://instagram.com",
      "facebook-open": "https://facebook.com",
      "twitter-open": "https://twitter.com",
      "whatsapp-open": "https://web.whatsapp.com",
      "github-open": "https://github.com",
      "calculator-open": "https://www.calculator.com",
    };

    if (urlMap[type]) window.open(urlMap[type], "_blank");

    if (type === "google-search") {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(userInput)}`,
        "_blank"
      );
    }

    if (type === "youtube-search" || type === "youtube-play") {
      window.open(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
          userInput
        )}`,
        "_blank"
      );
    }

    if (type === "weather-show") {
      window.open(
        `https://www.weather.com/en-IN/weather/today/l/${encodeURIComponent(
          userInput
        )}`,
        "_blank"
      );
    }

    if (type === "get-time")
      speak(`The current time is ${new Date().toLocaleTimeString()}`);
    if (type === "get-date")
      speak(`Today's date is ${new Date().toLocaleDateString()}`);
    if (type === "get-day")
      speak(
        `Today is ${new Date().toLocaleDateString("en-US", {
          weekday: "long",
        })}`
      );
    if (type === "get-month")
      speak(
        `This month is ${new Date().toLocaleDateString("en-US", {
          month: "long",
        })}`
      );
    if (type === "get-year") speak(`This year is ${new Date().getFullYear()}`);
    if (type === "wikipedia-search") {
      window.open(
        `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(
          userInput
        )}`,
        "_blank"
      );
    }
  };

  // console.log(userData)

  useEffect(() => {
    if (!userData?.assistantName) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    const safeRecognition = () => {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
        } catch (error) {
          if (error.name !== "InvalidStateError")
            console.error("Error starting recognition:", error);
        }
      }
    };

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if (!isSpeakingRef.current) {
        setTimeout(() => safeRecognition(), 1000);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "aborted" && !isSpeakingRef.current) {
        setTimeout(() => safeRecognition(), 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      if (
        transcript.toLowerCase().includes(userData.assistantName.toLowerCase())
      ) {
        setUserText(transcript);
        setAiText("");
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);
        const data = await getGeminiResponse(transcript);
        handleCommand(data);
        setAiText(data.response);
        setUserText("");
      }
    };

    const fallback = setInterval(() => {
      if (!isRecognizingRef.current && !isSpeakingRef.current) {
        safeRecognition();
      }
    }, 10000);

    safeRecognition();

    const greeting = new SpeechSynthesisUtterance(
      "Hello, how can I help you today?"
    );
    greeting.lang = "hi-IN";
    synth.speak(greeting);

    return () => {
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      clearInterval(fallback);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  return (
    <div className="w-full  h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex flex-col items-center justify-center gap-[15px] relative overflow-hidden">
      {/* Mobile Menu Icon - only show when sidebar is closed */}
      {!ham && (
        <CgMenuRight
          className="text-white absolute top-[20px] right-[20px] w-[32px] h-[32px] cursor-pointer lg:hidden z-50"
          onClick={() => setHam(true)}
        />
      )}

      {/* Sidebar & Overlay - only show when sidebar is open */}
      {ham && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setHam(false)}
          />
          {/* Sidebar Panel - now full screen */}
          <div className="relative w-full max-w-full h-full bg-[#181830] shadow-2xl p-8 flex flex-col items-start z-50 animate-slideInLeft">
            <RxCross1
              className="text-white absolute top-[20px] right-[20px] w-[32px] h-[32px] cursor-pointer lg:hidden"
              onClick={() => setHam(false)}
            />
            <button
              className="min-w-[180px] h-[60px] text-black font-bold bg-white rounded-full cursor-pointer text-[22px] mb-6 mt-16"
              onClick={handleLogout}
            >
              Log Out
            </button>
            <button
              className="min-w-[180px] h-[60px] text-black font-bold bg-white rounded-full text-[22px] px-7 py-3 mb-8"
              onClick={() => {
                setHam(false);
                navigate("/customize");
              }}
            >
              Customize
            </button>
            <div className="w-full border-t border-gray-600 my-6" />
            <h1 className="text-white font-bold text-[26px] mb-4">History</h1>
            <div className="w-full h-[350px] overflow-y-auto flex flex-col gap-3 pr-2">
              {userData?.history?.length ? (
                userData.history.map((his, index) => (
                  <span key={index} className="text-gray-200 text-[20px] ">
                    {his}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-[20px]">
                  No history yet.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Top Buttons */}
      <button
        className="absolute top-4 right-4 bg-white text-black font-semibold text-sm sm:text-base px-4 py-2 rounded-full shadow-md hidden lg:block"
        onClick={handleLogout}
      >
        Log Out
      </button>
      <button
        className="absolute top-[70px] right-4 bg-white text-black font-semibold text-sm sm:text-base px-4 py-2 rounded-full shadow-md hidden lg:block"
        onClick={() => navigate("/customize")}
      >
        Customize
      </button>
      {/* Assistant Image */}
      <div className="w-[80%] max-w-[320px] aspect-[3/4] rounded-3xl overflow-hidden shadow-xl flex items-center justify-center">
        <img
          src={userData?.assistantImage}
          alt="Assistant"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Assistant Name & Response */}
      <h1 className="text-white text-center text-base sm:text-lg font-semibold mt-4">
        I'M {userData?.assistantName}
      </h1>
      {!aiText && (
        <img src={userImg} alt="user" className="w-[150px] sm:w-[200px]" />
      )}
      {aiText && <img src={ai} alt="ai" className="w-[150px] sm:w-[200px]" />}
      <h1 className="text-white text-[18px] font-bold text-center px-3  max-w-[90%]">
        {userText || aiText}
      </h1>
    </div>
  );
};

export default Home;
