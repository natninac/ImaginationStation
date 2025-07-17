
const tiles = document.querySelectorAll('.tile');
const allTileTexts = Array.from(tiles).map(tile => tile.getAttribute('data-content'));
const resultDiv = document.getElementById('result');
const startBtn = document.getElementById('start-btn');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('typebox');
const chatLog = document.getElementById('chat-log');


   

    function addMessage(role, text) {
        const message = document.createElement('div');
        message.className = role === 'user' ? 'user-msg' : 'ai-msg';
        message.innerHTML = `<strong>${role === 'user' ? 'You' : 'Storybot'}:</strong> ${text}`;
        chatLog.appendChild(message);
        chatLog.scrollTop = chatLog.scrollHeight;
      }

async function getStoryPrompt(tileTexts) {
    try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3:instruct',
        prompt: `You are a storytelling facilitator for children. Based on the following saved ideas, write a VERY short story moment and ask a fun, open-ended question. Highlight any words or phrases inspired by the ideas by wrapping them in <mark> tags. Do not say "Here's a story" or "Here's a question." \n\n${tileTexts.join("\n")}\n\nOutput:`,
        stream: false,
        
      })
    });
  
    if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("AI response:", data);
      return data.response;
    } catch (error) {
      return "⚠️ Error contacting Ollama API. Is Ollama running locally on port 11434?";
    }
}



async function continueStory(userInput) {
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama3:instruct',
            prompt: `Continue this children's story using the themes below. Keep it short and curious. Then ask an imaginative question. Highlight any words or phrases inspired by the ideas by wrapping them in <mark> tags.\n\nIdeas:\n${allTileTexts.join("\n")}\n\nChild wrote:\n${userInput}\n\nOutput:`,
            stream: false
          })
        });
      
        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
          }
    
          const data = await response.json();
          return data.response;
        } catch (error) {
          return "⚠️ Error contacting Ollama API. Is Ollama running locally on port 11434?";
        }
    }


  startBtn.addEventListener('click', async () => {
    
    startBtn.style.display = 'none';

    chatLog.innerHTML = '';
  addMessage('system', 'Starting a new story...');

  const story = await getStoryPrompt(allTileTexts);
  addMessage('ai', story);
  });

  sendBtn.addEventListener('click', async () => {
    const userText = userInput.value.trim();
    if (!userText) {
      alert("Please type something first!");
      return;
    }
  
    addMessage('user', userText);
  userInput.value = '';
  addMessage('system', 'Thinking about your idea... ✨');

  const reply = await continueStory(userText);
  addMessage('ai', reply);
  });

