import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const { userData, serverURL, setUserData, getGeminiResponse } =
    useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;

  const handleLogout = async () => {
    try {
      const result = await axios.get(`${serverURL}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      console.log(result.data);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error);
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

  // Function to handle text-to-speech
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    const voices = synth.getVoices();
    const hindiVoice = voices.find(v => v.lang === "hi-IN");  
  if(hindiVoice) {
    utterance.voice = hindiVoice;
  }


    isSpeakingRef.current = true;
    utterance.onend = () => {
      isSpeakingRef.current = false;
      startRecognition();
      console.log("Speech ended, recognition restarted");
    };
    synth.speak(utterance);
  };

  const handleCommand = async (data) => {
    const { type, userInput, response } = data;
    speak(response);

    if (type === "notepad-open") {
      window.open("https://notepad.com", "_blank");
    }

    if (type === "text-editor-open") {
      window.open("https://codepen.io", "_blank");
    }

    if (type === "instagram-open") {
      window.open("https://instagram.com", "_blank");
    }

    if (type === "facebook-open") {
      window.open("https://facebook.com", "_blank");
    }

    if (type === "twitter-open") {
      window.open("https://twitter.com", "_blank");
    }

    if (type === "whatsapp-open") {
      window.open("https://web.whatsapp.com", "_blank");
    }

    if (type === "github-open") {
      window.open("https://github.com", "_blank");
    }

    if (type === "google-search") {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, "_blank");
    }

    if (type === "youtube-search" || type === "youtube-play") {
      const query = encodeURIComponent(userInput);
      window.open(
        `https://www.youtube.com/results?search_query=${query}`,
        "_blank"
      );
    }

    if (type === "calculator-open") {
      window.open("https://www.calculator.com", "_blank");
    }

    if (type === "weather-show") {
      const query = encodeURIComponent(userInput);
      window.open(
        `https://www.weather.com/en-IN/weather/today/l/${query}`,
        "_blank"
      );
    }

    if (type === "get-time") {
      const currentTime = new Date().toLocaleTimeString();
      speak(`The current time is ${currentTime}`);
    }

    if (type === "get-date") {
      const currentDate = new Date().toLocaleDateString();
      speak(`Today's date is ${currentDate}`);
    }

    if (type === "get-day") {
      const currentDay = new Date().toLocaleDateString("en-US", {
        weekday: "long",
      });
      speak(`Today is ${currentDay}`);
    }

    if (type === "get-month") {
      const currentMonth = new Date().toLocaleDateString("en-US", {
        month: "long",
      });
      speak(`This month is ${currentMonth}`);
    }

    if (type === "get-year") {
      const currentYear = new Date().getFullYear();
      speak(`This year is ${currentYear}`);
    }

    if (type === "wikipedia-search") {
      const query = encodeURIComponent(userInput);
      window.open(
        `https://en.wikipedia.org/wiki/Special:Search?search=${query}`,
        "_blank"
      );
    }

    // Optional fallback for unknown types
    if (
      ![
        "notepad-open",
        "text-editor-open",
        "instagram-open",
        "facebook-open",
        "twitter-open",
        "whatsapp-open",
        "github-open",
        "google-search",
        "youtube-search",
        "youtube-play",
        "calculator-open",
        "weather-show",
        "get-time",
        "get-date",
        "get-day",
        "get-month",
        "get-year",
        "wikipedia-search",
      ].includes(type)
    ) {
      speak("Sorry, I didn't understand that command.");
    }
  };

  useEffect(() => {
    if (!userData?.assistantName) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognitionRef.current = recognition;

    const isRecognizingRef = { current: false };

    const safeRecognition = () => {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
          console.log("Recognition requested to start");
        } catch (error) {
          if (error.name !== "InvalidStateError") {
            console.error("Error starting recognition:", error);
          }
        }
      }
    };

    recognition.onstart = () => {
      console.log("Recognition started");
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      console.log("Recognition ended");
      isRecognizingRef.current = false;
      setListening(false);
      if (!isSpeakingRef.current) {
        setTimeout(() => {
          safeRecognition();
        }, 1000); //delay to avoid immediate restart
      }
    };

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      if (event.error !== "aborted" && !isSpeakingRef.current) {
        setTimeout(() => {
          safeRecognition();
        }, 1000); // Restart recognition after a delay
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log("Heard: ", transcript);

      if (
        transcript.toLowerCase().includes(userData.assistantName.toLowerCase())
      ) {
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);

        const data = await getGeminiResponse(transcript);
        // speak(data.response);
        handleCommand(data);
        console.log(data);
      }
    };
    const fallback = setInterval(() => {
      if (!isRecognizingRef.current && !isSpeakingRef.current) {
        safeRecognition();
      }
    }, 10000);

    safeRecognition();

    return () => {
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      clearInterval(fallback);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        console.log("Recognition stopped");
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-t from-black to-[#02023d] flex flex-col items-center justify-center gap-4 px-4 relative">
      {/* Log Out Button */}
      <button
        className="absolute top-4 right-4 bg-white text-black font-semibold text-base sm:text-lg px-3 py-2 rounded-full shadow-md"
        onClick={handleLogout}
      >
        Log Out
      </button>

      {/* Customize Button */}
      <button
        className="absolute top-20 sm:top-24 right-4 bg-white text-black font-semibold text-base sm:text-lg px-2 py-2 rounded-full shadow-md"
        onClick={() => navigate("/customize")}
      >
        Customize Your Assistant
      </button>

      {/* Assistant Image Container */}
      <div className="w-[80%] max-w-[320px] aspect-[3/4] rounded-3xl overflow-hidden shadow-xl flex items-center justify-center">
        <img
          src={userData?.assistantImage}
          alt="Assistant"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Assistant Name */}
      <h1 className="text-white text-center text-base sm:text-lg font-semibold mt-4">
        I'M {userData?.assistantName}
      </h1>
    </div>
  );
};

export default Home;
