<script>
  import { flow } from "../stores/flow.js";

  let input = "";

  function normalize(s) {
    return (s ?? "").trim().replace(/\s+/g, " ");
  }

  function addIngredient() {
    const name = normalize(input);
    if (!name) return;

    flow.update((f) => {
      const exists = f.pantry.some((x) => x.name.toLowerCase() === name.toLowerCase());
      if (exists) return { ...f };

      return {
        ...f,
        pantry: [...f.pantry, { name, mustUse: true }]
      };
    });

    input = "";
  }

  function removeIngredient(name) {
    flow.update((f) => ({
      ...f,
      pantry: f.pantry.filter((x) => x.name !== name)
    }));
  }

  function next() {
    flow.update((f) => ({ ...f, screen: 11 })); // Zu Screen_Results
  }

  function skip() {
    input = "";
    flow.update((f) => ({ ...f, screen: 11 })); // Zu Screen_Results
  }

  function back() {
    flow.update((f) => ({ ...f, screen: 4 })); // Zurück zu Screen_Taste Step 2
  }
</script>

<div class="progress-container">
  <div class="progress-bar">
    <div class="progress-fill" style="width: 90%"></div>
  </div>
  <div class="progress-text">3/3</div>
</div>

<div class="header-section">
  <button class="back-btn" on:click={back}>
    ←
  </button>
</div>
  <h2>Which ingredients need to be used up?</h2>
<form class="addBar" on:submit|preventDefault={addIngredient}>
  <input
    type="text"
    placeholder="Add ingredient…"
    bind:value={input}
    autocomplete="off"
  />
  <button type="submit">Add</button>
</form>

{#if $flow.pantry.length === 0}
  <p class="hint">No ingredients yet.</p>
{:else}
  <div class="tags-container">
    {#each $flow.pantry as item (item.name)}
      <div class="tag-item">
        <span class="tag-name">{item.name}</span>
        <button type="button" class="remove-x" on:click={() => removeIngredient(item.name)}>
          ×
        </button>
      </div>
    {/each}
  </div>
{/if}

<div class="footer">
  <button class="next" on:click={next}>Next</button>
</div>

<style>  
.progress-container {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .progress-bar {
    flex: 1;
    height: 8px;
    background: #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #7ec87e;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.9rem;
    font-weight: 600;
    color: #666;
    min-width: 40px;
    text-align: right;
  }
  /* .header-section {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 4px;
  } */

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
    margin-bottom: 8px;
    width: 40px;
    height: 40px;
  }

  .back-btn:hover {
    opacity: 0.7;
  }

  /* h2 {
    margin: 0;
    flex: 1;
  } */

  .addBar {
    display: flex;
    gap: 8px;
    /* max-width: 420px; */
    margin: 10px 0 16px;
  }

  input {
    flex: 1;
    min-width: 0;
    padding: 12px 20px;
    border: 2px solid #e0e0e0;
    border-radius: 25px;
    font-size: 1rem;
  }

  input:focus {
    outline: none;
    border-color: #044000;
  }

  .addBar button {
    padding: 12px 20px;
    background: #7ec87e;
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
  }

  .addBar button:hover {
    background: #6ab96a;
  }

  /* .subtitle {
    opacity: 0.7;
    margin-top: -8px;
  } */

  .hint {
    opacity: 0.7;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 16px 0;
  }

  .tag-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #e3f2fd;
    border-radius: 25px;
    border: 1px solid #1976d2;
  }

  .tag-name {
    font-weight: 600;
    color: #1976d2;
    font-size: 0.85rem;
  }

  .remove-x {
    background: none;
    border: none;
    color: #1976d2;
    cursor: pointer;
    font-size: 20px;
    line-height: 1;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .remove-x:hover {
    color: #c62828;
    transform: scale(1.2);
  }

  .footer {
    display: flex;
    gap: 12px;
    margin-top: auto;
    position: fixed;
    left: 50%;
    bottom: 180px;
    transform: translateX(-50%);
    width: calc(100% - 40px);
    max-width: 1200px;
    padding: 0 4px;
  }

  .next {
    flex: 1;
    background: #7ec87e;
    color: white;
    border: none;
    border-radius: 30px;
    padding: 12px 24px;
  }

  .next:hover {
    background: #6ab96a;
  }

  button {
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
  }
</style>