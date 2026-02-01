<script>
  import { flow } from "../stores/flow.js";
  import { onMount } from "svelte";

  let loading = true;
  let error = null;
  let chatMessages = [];
  let chatInput = "";
  let chatLoading = false;
  let showSuccess = false;

  $: recipe = $flow.selectedRecipe;

  onMount(async () => {
    if (recipe) {
      loading = false;
    }
  });

  $: if (recipe) {
    loading = false;
  }

  async function sendChatMessage() {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    chatMessages = [...chatMessages, { role: "user", text: userMessage }];
    chatInput = "";
    chatLoading = true;

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          context: "ingredient",
          recipe: recipe.title
        })
      });

      if (!res.ok) throw new Error("Chat error");
      const data = await res.json();

      chatMessages = [...chatMessages, { role: "assistant", text: data.answer }];
    } catch (e) {
      chatMessages = [...chatMessages, { role: "error", text: `Error: ${e.message}` }];
    } finally {
      chatLoading = false;
    }
  }

  function back() {
   flow.update((f) => ({ ...f, screen: 11 }));
  }

  function saveRecipe() {
    flow.saveRecipe(recipe);
    showSuccess = true;
    setTimeout(() => {
      showSuccess = false;
      back();
    }, 2000);
  }

  function cookRecipe() {
    flow.cookRecipe(recipe);
    showSuccess = true;
    setTimeout(() => {
      showSuccess = false;
      back();
    }, 2000);
  }

  function handleKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  }
</script>

<div class="recipe-container">
  {#if loading}
    <p>Loading recipe…</p>
  {:else if error}
    <p>Error: {error}</p>
    <button on:click={back}>Back to results</button>
  {:else if !recipe}
    <p>No recipe selected.</p>
    <button on:click={back}>Back to results</button>
  {:else}
    <button class="back-btn" on:click={back}>
      ←
    </button>
    <div class="recipe-header">
      <h2>{recipe.title}</h2>
      
      <div class="quick-stats">
        <div class="stat">
          <span class="label">Match:</span>
          <span class="value">{recipe.match}%</span>
        </div>
        <div class="stat">
          <span class="label">Time:</span>
          <span class="value">{recipe.minutes} min</span>
        </div>
        <div class="stat">
          {#if recipe.missing === 0}
            <span class="label success">✅ All ingredients available</span>
          {:else}
            <span class="label warning">{recipe.missing} missing items</span>
          {/if}
        </div>
      </div>
    </div>

    <div class="recipe-content">
      <section class="ingredients-section">
        <h3>Ingredients</h3>
        <ul class="ingredients-list">
          {#each recipe.ingredients as ing}
            <li>{ing}</li>
          {/each}
        </ul>
      </section>

      <section class="actions-section">
        <h3>Actions</h3>
        <div class="action-buttons">
          <button class="save-btn" on:click={saveRecipe}>
            Save Recipe
          </button>
          <button class="cook-btn" on:click={cookRecipe}>
            Cooked
          </button>
        </div>
      </section>

      <section class="chat-section">
        <h3>Ask Cookbuddy to help you</h3>
        <p class="chat-hint">Use our AI assistant to find alternatives for any ingredient</p>
        
        <div class="chat-box">
          <div class="messages">
            {#each chatMessages as msg}
              <div class="message" class:user={msg.role === "user"} class:assistant={msg.role === "assistant"} class:error={msg.role === "error"}>
                <div class="message-text">{msg.text}</div>
              </div>
            {/each}
            {#if chatLoading}
              <div class="message assistant loading">
                <div class="loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            {/if}
          </div>

          <form class="chat-input-form" on:submit|preventDefault={sendChatMessage}>
            <textarea
              placeholder="e.g., 'What can I use instead of butter?'"
              bind:value={chatInput}
              on:keydown={handleKeydown}
              disabled={chatLoading}
            ></textarea>
            <button type="submit" disabled={chatLoading || !chatInput.trim()}>
              Send
            </button>
          </form>
        </div>
      </section>
    </div>

    {#if showSuccess}
      <div class="success-popup">
        ✅ Saved successfully!
      </div>
    {/if}
  {/if}
</div>

<style>
  .recipe-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .back-btn {
    background: none;
    border: none;
    color: #044000;
    cursor: pointer;
    font-size: 24px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;
    margin-bottom: 16px;
    width: 40px;
    height: 40px;
  }

  .back-btn:hover {
    opacity: 0.7;
  }

  .recipe-header {
    margin-bottom: 32px;
  }

  h2 {
    margin: 12px 0;
    font-size: 2rem;
  }

  .quick-stats {
    display: flex;
    gap: 16px;
    margin-top: 16px;
  }

  .stat {
    flex: 1;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat .label {
    font-size: 0.85rem;
    opacity: 0.7;
    font-weight: 600;
  }

  .stat .label.success {
    color: #155724;
    background: #d4edda;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .stat .label.warning {
    color: #856404;
    background: #fff3cd;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .stat .value {
    font-size: 1.2rem;
    font-weight: 700;
  }

  .recipe-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  section {
    padding: 24px;
    background: #f9f9f9;
    border-radius: 12px;
    border-left: 4px solid #ff6b6b;
  }

  h3 {
    margin: 0 0 16px 0;
    font-size: 1.4rem;
  }

  .ingredients-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ingredients-list li {
    padding: 10px 12px;
    background: white;
    border-radius: 6px;
    border-left: 3px solid #ff6b6b;
  }

  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .save-btn,
  .cook-btn {
    padding: 14px 24px;
    border: none;
    border-radius: 30px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .save-btn {
    background: #e8f5e9;
    color: #2e7d32;
    border: 2px solid #4caf50;
  }

  .save-btn:hover {
    background: #c8e6c9;
  }

  .cook-btn {
    background: #fff3e0;
    color: #e65100;
    border: 2px solid #ff9800;
  }

  .cook-btn:hover {
    background: #ffe0b2;
  }

  .chat-hint {
    margin: 0;
    opacity: 0.7;
    font-size: 0.95rem;
  }

  .chat-box {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: white;
    padding: 16px;
    border-radius: 8px;
    height: 400px;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .message {
    padding: 12px 16px;
    border-radius: 8px;
    max-width: 80%;
  }

  .message.user {
    align-self: flex-end;
    background: #ff6b6b;
    color: white;
    border-bottom-right-radius: 4px;
  }

  .message.assistant {
    align-self: flex-start;
    background: #f0f0f0;
    color: #333;
    border-bottom-left-radius: 4px;
  }

  .message.error {
    align-self: flex-start;
    background: #ffcdd2;
    color: #c62828;
    border-bottom-left-radius: 4px;
  }

  .message-text {
    word-wrap: break-word;
  }

  .loading-dots {
    display: flex;
    gap: 4px;
  }

  .loading-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ff6b6b;
    animation: bounce 1.4s infinite;
  }

  .loading-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .loading-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      opacity: 0.5;
      transform: translateY(0);
    }
    40% {
      opacity: 1;
      transform: translateY(-8px);
    }
  }

  .chat-input-form {
    display: flex;
    gap: 8px;
  }

  textarea {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 25px;
    font-family: inherit;
    font-size: 0.95rem;
    resize: none;
    min-height: 50px;
  }

  textarea:focus {
    outline: none;
    border-color: #ff6b6b;
  }

  textarea:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  .chat-input-form button {
    padding: 10px 20px;
    background: #7ec87e;
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
  }

  .chat-input-form button:hover:not(:disabled) {
    background: #ff5252;
  }

  .chat-input-form button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .success-popup {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 16px 24px;
    background: #4caf50;
    color: white;
    border-radius: 8px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
</style>