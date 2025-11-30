export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { messages } = req.body;

    // Debugging
    console.log("Messages received:", messages.length);
    console.log("Key length:", process.env.OPENROUTER_KEY?.length);

    const response = await fetch("https://openrouter.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`
      },
      body: JSON.stringify({
        model: "x-ai/grok-4.1-fast:free",
        messages,
        max_tokens: 400,
        temperature: 0.4
      })
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
