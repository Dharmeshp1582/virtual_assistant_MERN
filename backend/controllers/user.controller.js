import axios from "axios";
import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import geminiResponse from "../gemini.js";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Current User Error", error: error.message });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    let assistantImage;

    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error during assistant update:", error.message);
    return res
      .status(500)
      .json({ message: "Error while updating image", error: error.message });
  }
};



// export const askToAssistant = async (req, res) => {
//   try {
//     const { command } = req.body;

//     // Fetch current user
//     const user = await User.findById(req.userId).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const userName = user.name;
//     const assistantName = user.assistantName;

//     // Get Gemini response
//     const result = await geminiResponse(command, assistantName, userName);

//     // Extract JSON block
//     const jsonMatch =
//       result.match(/```json([\s\S]*?)```/)?.[1] || result.match(/{[\s\S]*}/)?.[0];

//     if (!jsonMatch) {
//       return res.status(400).json({
//         message: "Sorry, invalid response format from assistant",
//       });
//     }

//     let gemResult;
//     try {
//       gemResult = JSON.parse(jsonMatch);
//     } catch (err) {
//       return res.status(400).json({
//         message: "Failed to parse JSON from assistant",
//         error: err.message,
//       });
//     }

//     const { type, query, location, weather, videoTitle, response } = gemResult;

//     // Passthrough types
//     const passthroughTypes = [
//       "notepad-open",
//       "text-editor-open",
//       "instagram-open",
//       "facebook-open",
//       "twitter-open",
//       "whatsapp-open",
//       "github-open",
//     ];

//     if (passthroughTypes.includes(type)) {
//       return res.json({
//         type,
//         userInput: command,
//         response: command,
//       });
//     }

//     // Switch type logic
//     switch (type) {
//       case "get-date":
//         return res.json({
//           type,
//           userInput: command,
//           response: `Today's date is ${moment().format("MMMM Do YYYY")}`,
//         });

//       case "get-time":
//         return res.json({
//           type,
//           userInput: command,
//           response: `The current time is ${moment().format("hh:mm A")}`,
//         });

//       case "get-day":
//         return res.json({
//           type,
//           userInput: command,
//           response: `Today is ${moment().format("dddd")}`,
//         });

//       case "get-month":
//         return res.json({
//           type,
//           userInput: command,
//           response: `This month is ${moment().format("MMMM")}`,
//         });

//       case "get-year":
//         return res.json({
//           type,
//           userInput: command,
//           response: `This year is ${moment().format("YYYY")}`,
//         });

//       case "google-search":
//         return res.json({
//           type,
//           userInput: command,
//           response: `You can search for "${command}" on Google.`,
//         });

//       case "youtube-search":
//         return res.json({
//           type,
//           userInput: command,
//           response: `You can search for "${command}" on YouTube.`,
//         });

//       case "wikipedia-search":
//         return res.json({
//           type,
//           userInput: command,
//           response: `You can search for "${command}" on Wikipedia.`,
//         });

//       case "weather":
//         return res.json({
//           type,
//           userInput: command,
//           response: `The weather in ${location} is currently ${weather}.`,
//         });

//       case "youtube-play":
//         return res.json({
//           type,
//           userInput: command,
//           response: `You can play the video "${command}" on YouTube.`,
//         });

//       case "general":
//         return res.json({
//           type,
//           userInput: command,
//           response:`Here's what I found: ${response}`,
//         });

//       case "calculator-open":
//         return res.json({
//           type,
//           userInput: command,
//           response: "Opening calculator...",
//         });

//       default:
//         return res.status(400).json({
//           message: "I didn't understand that command. Please try again.",
//         });
//     }
//   } catch (error) {
//     console.error("Error during assistant query:", {
//       message: error.message,
//       stack: error.stack,
//     });

//     return res.status(500).json({
//       message: "Error while querying assistant",
//       error: error.message,
//     });
//   }
// };

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;

    // Fetch current user
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userName = user.name;
    const assistantName = user.assistantName;

    // Get Gemini response
    const result = await geminiResponse(command, assistantName, userName);

    // Extract JSON block
    const jsonMatch =
      result.match(/```json([\s\S]*?)```/)?.[1] || result.match(/{[\s\S]*}/)?.[0];

    if (!jsonMatch) {
      return res.status(400).json({
        message: "Sorry, invalid response format from assistant",
      });
    }

    let gemResult;
    try {
      gemResult = JSON.parse(jsonMatch);
    } catch (err) {
      return res.status(400).json({
        message: "Failed to parse JSON from assistant",
        error: err.message,
      });
    }

    const { type, query, location, weather, videoTitle, response } = gemResult;

    // Passthrough types
    const passthroughTypes = [
      "notepad-open",
      "text-editor-open",
      "instagram-open",
      "facebook-open",
      "twitter-open",
      "whatsapp-open",
      "github-open",
    ];

    if (passthroughTypes.includes(type)) {
      return res.json({
        type,
        userInput: command,
        response: `Opening ${type.replace("-open", "").replace("-", " ")} for you.`,
      });
    }

    // Switch type logic with realistic spoken responses
    switch (type) {
      case "get-date":
        return res.json({
          type,
          userInput: command,
          response: `Sure! Today is ${moment().format("MMMM Do YYYY")}.`,
        });

      case "get-time":
        return res.json({
          type,
          userInput: command,
          response: `It's currently ${moment().format("hh:mm A")}.`,
        });

      case "get-day":
        return res.json({
          type,
          userInput: command,
          response: `Today is ${moment().format("dddd")}.`,
        });

      case "get-month":
        return res.json({
          type,
          userInput: command,
          response: `We're in the month of ${moment().format("MMMM")}.`,
        });

      case "get-year":
        return res.json({
          type,
          userInput: command,
          response: `The year is ${moment().format("YYYY")}.`,
        });

      case "google-search":
        return res.json({
          type,
          userInput: query || command,
          response: `Alright, let's search for "${query || command}" on Google.`,
        });

      case "youtube-search":
        return res.json({
          type,
          userInput: query || command,
          response: `Here's what I found on YouTube for "${query || command}".`,
        });

      case "wikipedia-search":
        return res.json({
          type,
          userInput: query || command,
          response: `Searching Wikipedia for "${query || command}".`,
        });

      case "weather":
        return res.json({
          type,
          userInput: command,
          response: `Here's the weather update for ${location}: it's currently ${weather}.`,
        });

      case "youtube-play":
        return res.json({
          type,
          userInput: query || command,
          response: `Sure, playing "${query || command}" on YouTube.`,
        });

      case "calculator-open":
        return res.json({
          type,
          userInput: command,
          response: "Opening the calculator for you.",
        });

      case "general":
        return res.json({
          type,
          userInput: command,
          response: response || "Here’s the answer I found.",
        });

      default:
        return res.status(400).json({
          message: "I didn't understand that command. Could you try rephrasing?",
        });
    }
  } catch (error) {
    console.error("Error during assistant query:", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      message: "Error while querying assistant",
      error: error.message,
    });
  }
};

