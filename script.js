const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

// Load saved memory
let messages = JSON.parse(localStorage.getItem("himu_memory")) || [
  { role: "system", content: "Your name is HimuAI, developed by Himanshu Gurjar. You Remember Everything from the chat session, you are a brilliant coder and software engineer, also a agentic ai. Made In India" }
];

// Load old chat
window.onload = () => {
  messages.forEach(msg => {
    if(msg.role !== "system"){
      appendMessage(msg.role === "user" ? "user" : "bot", formatText(msg.content));
    }
  });
};

// Enter to send
userInput.addEventListener("keydown",(e)=>{
  if(e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage(){
  const text = userInput.value.trim();
  if(!text) return;

  appendMessage("user", escapeHtml(text));
  messages.push({role:"user", content:text});
  userInput.value = "";
  saveMemory();

  const typing = appendMessage("bot","Typing...");

  try{
    const res = await fetch("/api/chat",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();

    // Safety check
    if(!data.choices || !data.choices[0]?.message?.content){
      throw new Error("No response from server");
    }

    const reply = data.choices[0].message.content;

    typing.remove();

    messages.push({role:"assistant", content: reply});
    saveMemory();

    appendMessage("bot", formatText(reply));
  }
  catch(e){
    typing.textContent="Error fetching response!";
    console.error(e);
  }
}

function appendMessage(role, content){
  const div = document.createElement("div");
  div.className = `bubble ${role}`;
  div.innerHTML = content;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  Prism.highlightAll();

  return div;
}

function saveMemory(){
  localStorage.setItem("himu_memory", JSON.stringify(messages));
}

// Formatting
function formatText(text){
  if(!text) return "";

  // Code blocks
  text = text.replace(/```([\s\S]*?)```/g, (m,code)=>{
    return `
    <pre>
      <button class="copy-btn" onclick="copyCode(this)">Copy</button>
      <code>${escapeHtml(code)}</code>
    </pre>`;
  });

  // Bold & Italic
  text = text.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>");
  text = text.replace(/\*(.*?)\*/g,"<em>$1</em>");

  // Links
  text = text.replace(/(https?:\/\/[^\s]+)/g, `<a href="$1" target="_blank">$1</a>`);

  // New lines
  text = text.replace(/\n/g,"<br>");

  return text;
}

function escapeHtml(text){
  return text.replace(/&/g,"&amp;")
            .replace(/</g,"&lt;")
            .replace(/>/g,"&gt;");
}

function copyCode(btn){
  const code = btn.nextElementSibling.innerText;
  navigator.clipboard.writeText(code);
  btn.innerText = "Copied ✅";
  setTimeout(()=>btn.innerText="Copy",1500);
}
