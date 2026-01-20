<script>
  let my_message = "";
  let ollama_response = "";

  async function sendMessage() {
    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: my_message }),
      });
      console.log(response);
      const data = await response.json();
      console.log(data);
      const responseJSON = JSON.parse(await data.answer);
      ollama_response = `The name ${responseJSON.inputName} reminds me of a ${responseJSON.vegetable}. ${responseJSON.explanation}`;

      console.log(ollama_response);
    } catch (error) {
      console.error("Error posting to chat endpoint:", error);
    }
  }
</script>

<main>
  <h1>Welcome to the Chat App</h1>
  <p>This is a simple chat application built with Svelte.</p>

  <input type="text" placeholder="Enter your message" bind:value={my_message} />
  <button on:click={sendMessage}>Send</button>
  <div class="messages">{ollama_response}</div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
