<script>
  import { flow } from "../stores/flow.js";
  import { ChevronLeft } from "lucide-svelte";

  let loading = true;
  let chatMessages = [];
  let chatInput = "";
  let chatLoading = false;
  let showSuccess = false;

  $: recipe = $flow.selectedRecipe;

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
          recipe: recipe.name
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
    flow.update((f) => ({ ...f, screen: 3 }));
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
  {:else if !recipe}
    <p>No recipe selected.</p>
    <button on:click={back}>Back</button>
  {:else}
    <button class="back-btn" on:click={back}>
      <ChevronLeft size={24} />
    </button>
    <div class="recipe-header">
      <h2>{recipe.name}</h2>
      
      <div class="quick-stats">
        <div class="stat">
          <span class="label">Time:</span>
          <span class="value">{recipe.cookingTime || recipe.minutes || '--'} min</span>
        </div>
        <div class="stat">
          <span class="label">Difficulty:</span>
          <span class="value">{recipe.difficulty || 'N/A'}</span>
        </div>
      </div>
    </div>

    <div class="recipe-content">
      {#if recipe.image}
        <section class="image-section">
          <img src={recipe.image} alt={recipe.name} />
        </section>
      {/if}

      <section class="ingredients-section">
        <h3>Ingredients</h3>
        <ul class="ingredients-list">
          {#each recipe.ingredients as ing}
            <li>{ing}</li>
          {/each}
        </ul>
      </section>

      {#if recipe.instructions}
        <section class="instructions-section">
          <h3>Instructions</h3>
          <p>{recipe.instructions}</p>
        </section>
      {/if}

      {#if recipe.description}
        <section class="description-section">
          <h3>Description</h3>
          <p>{recipe.description}</p>
        </section>
      {/if}

      <section class="actions-section">
        <h3>Actions</h3>
        <div class="action-buttons">
          <button class="save-btn" on:click={saveRecipe}>
            💾 Save Recipe
          </button>
          <button class="cook-btn" on:click={cookRecipe}>
            👨‍🍳 Cooked
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
    padding: 8px 12px 8px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;
    flex-shrink: 0;
    margin-bottom: 12px;
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
    background: #e8f6e3;
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
    border-left: 4px solid #C1EEBB;
  }

  h3 {
    margin: 0 0 16px 0;
    font-size: 1.4rem;
  }

  .image-section {
    padding: 0;
    border: none;
    background: transparent;
  }

  .image-section img {
    width: 100%;
    height: auto;
    max-height: 400px;
    object-fit: cover;
    border-radius: 12px;
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
    border-left: 3px solid #C1EEBB;
  }

  .description-section p {
    margin: 0;
    line-height: 1.6;
    color: #333;
  }

  .instructions-section p {
    margin: 0;
    line-height: 1.6;
    color: #333;
  }

  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .save-btn,
  .cook-btn {
    padding: 14px 20px;
    border: none;
    border-radius: 8px;
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
    background: #C1EEBB;
    color: #0f1f10;
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
    background: #C1EEBB;
    animation: bounce 1.4s infinite;
  }

  .loading-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .loading-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(1);
      opacity: 0.8;
    }
    40% {
      transform: scale(1.2);
      opacity: 1;
    }
  }

  .chat-input-form {
    display: flex;
    gap: 8px;
  }

  textarea {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.95rem;
    resize: none;
    max-height: 100px;
  }

  textarea:focus {
    outline: none;
    border-color: #C1EEBB;
  }

  textarea:disabled {
    background: #f5f5f5;
  }

  button[type="submit"] {
    padding: 10px 16px;
    background: #C1EEBB;
    color: #0f1f10;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
  }

  button[type="submit"]:hover:not(:disabled) {
    background: #a8d9a3;
  }

  button[type="submit"]:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .success-popup {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #4caf50;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease;
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

  @media (max-width: 600px) {
    .recipe-container {
      padding: 16px;
    }

    h2 {
      font-size: 1.6rem;
    }

    .action-buttons {
      grid-template-columns: 1fr;
    }

    .chat-box {
      height: 300px;
    }
  }
</style>
