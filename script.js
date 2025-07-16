const chat = document.getElementById("chat");
const input = document.getElementById("userInput");

input.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const userText = input.value.trim();
    if (!userText) return;

    chat.textContent += `\nYOU: ${userText}`;
    input.value = "";

    const prompt = `You are Marie Antoinette, reborn as an AI. You're flirtatious, witty, royal, and a bit dramatic. Respond to this: "${userText}"`;

    try {
      // Send job to Horde
      const res = await fetch("https://horde.koboldai.net/api/v2/generate/text/async", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          params: {
            max_context_length: 2048,
            max_length: 200,
            temperature: 0.8,
            stop_sequence: ["YOU:", "MARIE:"]
          },
          models: ["KoboldAI/psycho-mix-7b"] // or another allowed model
        })
      });

      const { id } = await res.json();

      // Poll for results
      let reply = "Waiting...";
      while (true) {
        const poll = await fetch(`https://horde.koboldai.net/api/v2/generate/text/status/${id}`);
        const result = await poll.json();
        if (result.done) {
          reply = result.generations[0].text.trim();
          break;
        }
        await new Promise(r => setTimeout(r, 1000));
      }

      chat.textContent += `\nMARIE: ${reply}`;
      chat.scrollTop = chat.scrollHeight;
    } catch (err) {
      console.error(err);
      chat.textContent += `\nMARIE: Zut alors! I cannot respond right now.`;
    }
  }
});
