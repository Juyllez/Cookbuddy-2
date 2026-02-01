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

  // Parse ingredient to separate quantity+unit from name
  function parseIngredient(ing) {
    // Match pattern like "2 cups flour", "1/4 tsp salt", "1/3 cup sugar"
    const unitMatch = ing.match(/^([\d\/.\s]+\s*[a-z]+)/i);
    if (unitMatch) {
      const unit = unitMatch[1].trim();
      const name = ing.substring(unitMatch[0].length).trim();
      return { unit, name };
    }
    return { unit: "", name: ing };
  }

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
          recipe: recipe.title,
        }),
      });

      if (!res.ok) throw new Error("Chat error");
      const data = await res.json();

      chatMessages = [
        ...chatMessages,
        { role: "assistant", text: data.answer },
      ];
    } catch (e) {
      chatMessages = [
        ...chatMessages,
        { role: "error", text: `Error: ${e.message}` },
      ];
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
    }, 2000);
  }

  function cookRecipe() {
    flow.cookRecipe(recipe);
    showSuccess = true;
    setTimeout(() => {
      showSuccess = false;
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
    <button on:click={back}>Back to result</button>
  {:else if !recipe}
    <p>No recipe selected.</p>
    <button on:click={back}>Back to results</button>
  {:else}
    <button class="back-btn" on:click={back}> ← </button>
    
    {#if recipe.image || recipe.thumb}
      <img src={recipe.image || recipe.thumb} alt={recipe.title} class="recipe-image" />
    {/if}
    
    <div class="recipe-header">
      <h2>{recipe.title}</h2>

      <div class="quick-stats">
        <div class="stat">
          <!-- <span class="label">Dietary Preference:</span> -->
          <span class="value">{recipe.dietType || "omnivore"}</span>
        </div>
        <div class="stat">
          <!-- <span class="label">Time:</span> -->
          <span class="value">{recipe.minutes} min</span>
        </div>
        {#if recipe.taste}
          <div class="stat">
            <!-- <span class="label">Taste</span> -->
            <span class="value">{recipe.taste}</span>
          </div>
        {/if}
      </div>
    </div>

    <div class="recipe-content">
      <section class="ingredients-section">
        <h3>Ingredients</h3>
        <ul class="ingredients-list">
          {#each recipe.ingredients as ing}
            {@const parsed = parseIngredient(ing)}
            {#if parsed.unit}
              <li>
                <span class="unit">{parsed.unit}</span><span class="name"
                  >{parsed.name}</span
                >
              </li>
            {:else}
              <li>{ing}</li>
            {/if}
          {/each}
        </ul>
      </section>

      {#if recipe.instructions || recipe.analyzedInstructions}
        <section class="instructions-section">
          <h3>Instructions</h3>
          {#if recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && recipe.analyzedInstructions[0].steps}
            <ol class="instructions-list">
              {#each recipe.analyzedInstructions[0].steps as step}
                <li>{step.step}</li>
              {/each}
            </ol>
          {:else if recipe.instructions}
            <div class="instructions-text">
              {@html recipe.instructions}
            </div>
          {/if}
        </section>
      {/if}

      <section class="chat-section">
        <h3>Ask Cookbuddy to help you</h3>
        <p class="chat-hint">
          <!-- Use our AI assistant to find alternatives for any ingredient
        </p>
        <br> -->

        <div class="chat-box">
          <div class="messages">
            {#each chatMessages as msg}
              <div
                class="message"
                class:user={msg.role === "user"}
                class:assistant={msg.role === "assistant"}
                class:error={msg.role === "error"}
              >
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

          <form
            class="chat-input-form"
            on:submit|preventDefault={sendChatMessage}
          >
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

      <section class="actions-section">
        <h3>Actions</h3>
        <div class="action-buttons">
          <button class="save-btn" on:click={saveRecipe}>
            Save Recipe
          </button>
        </div>
      </section>
    </div>

    {#if showSuccess}
      <div class="success-popup">Saved successfully!</div>
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

  .recipe-image {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 25px;
    margin-bottom: 24px;
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
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 16px;
  }

  .stat {
    padding: 8px 14px;
    background: #e3f2fd;
    color: #1565c0;
    border-radius: 20px;
    border: 1px solid #bbdefb;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  /* .stat .label {
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
  } */

  .stat .value {
    font-size: 0.95rem;
    font-weight: 700;
  }

  .recipe-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
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
    border-radius: 30px;
    border-left: 3px solid #044000;
    display: flex;
    gap: 12px;
  }

  .ingredients-list .unit {
    font-weight: 700;
    color: #044000;
    min-width: 60px;
  }

  .ingredients-list .name {
    color: #333;
  }

  .instructions-list {
    list-style: decimal;
    padding-left: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .instructions-list li {
    padding-left: 8px;
    line-height: 1.6;
  }

  .instructions-text {
    line-height: 1.6;
  }

  .action-buttons {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }

  .save-btn {
    padding: 14px 24px;
    border: none;
    border-radius: 30px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    background: #e8f5e9;
    color: #2e7d32;
    border: 2px solid #4caf50;
    width: 100%;
  }

  .save-btn:hover {
    background: #c8e6c9;
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
    border-radius: 30px;
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
    border-radius: 30px;
    max-width: 80%;
  }

  .message.user {
    align-self: flex-end;
    background: #044000;
    color: white;
    border-bottom-right-radius: 25px;
  }

  .message.assistant {
    align-self: flex-start;
    background: #f0f0f0;
    color: #333;
    border-bottom-left-radius: 25px;
  }

  .message.error {
    align-self: flex-start;
    background: #e8f5e9;
    color: #044000;
    border-bottom-left-radius: 25px;
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
    background: #044000;
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
    padding: 14px 24px;
    border: 2px solid #e0e0e0;
    border-radius: 50px;
    font-family: inherit;
    font-size: 0.95rem;
    resize: none;
    min-height: 54px;
  }

  textarea:focus {
    outline: none;
    border-color: #044000;
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
    border-radius: 50px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
  }

  .chat-input-form button:hover:not(:disabled) {
    background: #6ab96a;
  }

  .chat-input-form button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .success-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 16px 24px;
    background: #4caf50;
    color: white;
    border-radius: 8px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.3s ease-out;
    z-index: 1000;
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
