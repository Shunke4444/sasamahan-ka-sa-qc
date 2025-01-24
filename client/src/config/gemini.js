
const API_ENDPOINT = "http://127.0.0.1:8000/api/chat";

const runChat = async (userInput) => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userInput }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.message; 
  } catch (error) {
    return "An error occurred. Please try again later."; 
  }
};


export default runChat;


