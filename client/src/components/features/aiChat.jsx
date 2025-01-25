import React, { useContext, useEffect, useState } from "react";
import { UserInputContext } from "@/contexts/useUserContext";
import Header from "../layout/Header";
import Footer from "../layout/textarea";
import UserChatBubble from "./aiChatComponents/userChatBubble";
import AiChatBubble from "./aiChatComponents/aiChatBubble";
import runChat from "@/config/gemini";
import { dotStream } from 'ldrs';
import toast from "../layout/toast";
import axios from "axios";
import Form from './form';

dotStream.register();

export default function AiChat() {
  const {
    userInput,
    aiResponse,
    setAiResponse,
    chatHistory,
    setChatHistory,
  } = useContext(UserInputContext);

  const [loadingMessageId, setLoadingMessageId] = useState(null);
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [showContextForm, setShowContextForm] = useState(true); // State to control the visibility of the context form
  const [businessType, setBusinessType] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [businessPlacement, setBusinessPlacement] = useState("");
  const [financeUnderstanding, setFinanceUnderstanding] = useState("");
  const [comfortWithGraphs, setComfortWithGraphs] = useState("");

  useEffect(() => {
    const generateTitle = async (chatHistory) => {
      if (chatHistory.length === 0) {
        setGeneratedTitle("New Conversation");
        return; // Exit early
      } else if (chatHistory.length < 3) {
        setGeneratedTitle("Generating Title...");
        return; // Exit early
      }

      try {
        // Transform chatHistory into the expected payload format
        const payload = {
          chat_history: chatHistory.map((chat) => ({
            role: chat.ai ? "assistant" : "user", // Determine role based on whether it's an AI response
            content: chat.ai ? chat.ai : chat.user, // Use AI response or user input
          })),
        };

        const response = await axios.post(
          'http://localhost:8000/api/title',
          payload, // Send the transformed payload
          {
            headers: {
              'Content-Type': 'application/json', // Set headers
            },
          }
        );
        console.log("API Response:", response.data); // Log the response
        setGeneratedTitle(response.data.title);
      } catch (error) {
        console.error("Error generating title:", error.message); // Log the specific error
        setGeneratedTitle("Error generating title");
      }
    };

    generateTitle(chatHistory);
  }, [chatHistory]);

  const handleContextSubmit = async (e) => {
    e.preventDefault();
    setShowContextForm(false); // Hide the form after submission

    const context = {
      business_type: businessType,
      monthly_revenue: monthlyRevenue,
      business_placement: businessPlacement,
      finance_understanding: financeUnderstanding,
      comfort_with_graphs: comfortWithGraphs,
    };

    try {
      // Send the context to the backend
      await axios.post('http://localhost:8000/api/set-context', context);
      console.log("Context submitted successfully");
    } catch (error) {
      console.error("Error submitting context:", error.message);
    }
  };
  const handleSkipForm = () => {
    setShowContextForm(false); // Hide the form without submitting
    console.log("Form skipped, no context provided");
  };

  const fetchAIResponse = async () => {
    if (!userInput || userInput.trim() === "") return;

    const messageId = Date.now().toString();
    setLoadingMessageId(messageId);

    try {
      const response = await runChat(userInput);

      if (!response || typeof response !== 'string') {
        throw new Error("Invalid response from the API");
      }

      setChatHistory((prevHistory) => {
        const lastMessage = prevHistory[prevHistory.length - 1];
        if (lastMessage && lastMessage.user === userInput && lastMessage.ai === response) {
          return prevHistory;
        }
        return [...prevHistory, { id: messageId, user: userInput, ai: response }];
      });

      setAiResponse(response);
    } catch (error) {
      console.error(error);
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { id: messageId, user: userInput, ai: "Sorry, there was an error generating the response." },
      ]);
    } finally {
      setLoadingMessageId(null);
    }
  };

  useEffect(() => {
    if (userInput && userInput.trim() !== "") {
      fetchAIResponse();
    }
  }, [userInput]);

  return (
    <>
      <main className="h-screen shadow-xl flex flex-col p-4 bg-white">
        <Header title={generatedTitle} />
        <section className="p-4 flex-grow h-auto overflow-x-auto">
          <Form 
            showContextForm={showContextForm}
            handleContextSubmit={handleContextSubmit}
            handleSkipForm={handleSkipForm}
            businessType={businessType}
            setBusinessType={setBusinessType}
            monthlyRevenue={monthlyRevenue}
            setMonthlyRevenue={setMonthlyRevenue}
            businessPlacement={businessPlacement}
            setBusinessPlacement={setBusinessPlacement}
            financeUnderstanding={financeUnderstanding}
            setFinanceUnderstanding={setFinanceUnderstanding}
            comfortWithGraphs={comfortWithGraphs}
            setComfortWithGraphs={setComfortWithGraphs}
          />
        </section>
        <section className="p-4 flex-grow h-auto overflow-y-auto">
          {chatHistory.map((chat) => (
            <div key={chat.id} className="space-y-4 mb-6">
              <UserChatBubble message={chat.user} />
              {chat.id === loadingMessageId ? (
                <div className="flex justify-start p-4">
                  <l-dot-stream size="60" speed="2.5" color="black"></l-dot-stream>
                </div>
              ) : (
                chat.ai && <AiChatBubble message={chat.ai} />
              )}
            </div>
          ))}
        </section>
        <Footer />
      </main>
    </>
  );
}