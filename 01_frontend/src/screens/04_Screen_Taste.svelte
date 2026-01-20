<script>
  import { flow } from "../stores/flow.js";

  let taste = $flow.taste || null;
  let timeIndex = 2; // default to middle option

    const timeOptions = [
      { label: "Quick · 10 min", value: "10" },
      { label: "Fast · 20 min", value: "20" },
      { label: "Standard · 30 min", value: "30" },
      { label: "Leisurely · 45 min", value: "45" },
      { label: "60+ min", value: "60" }
    ];

  function selectTaste(t) {
    taste = t;
  }

  function next() {
    const cookingTime = timeOptions[timeIndex].value;
    if (!taste) return; // require a craving selection
    flow.update(f => ({
      ...f,
      taste,
      cookingTime,
      screen: 5
    }));
    // Navigate to the next screen
  }
</script>

<div class="screen">
  <h2>What are you craving today?</h2>

  <div class="options">
    <button class:selected={taste === "savory"} on:click={() => selectTaste("savory")}>
      <strong>Savory</strong>
    </button>

    <button class:selected={taste === "sweet"} on:click={() => selectTaste("sweet")}>
      <strong>Sweet</strong>
    </button>

    <button class:selected={taste === "any"} on:click={() => selectTaste("any")}>
      <strong>Can't decide</strong>
    </button>
  </div>

  {#if taste}
    <div class="time-section">
      <h3>How much time do you have?</h3>

      <div class="slider-row">
        <input type="range" min="0" max="4" step="1" bind:value={timeIndex} />
      </div>
      <div class="ticks">
        {#each timeOptions as opt}
          <span>{opt.value}m</span>
        {/each}
      </div>
    </div>

    <div class="footer">
      <button class="next" on:click={next}>Next</button>
      
    </div>
  {/if}
</div>

<style>
  .screen {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .options {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, 1fr);
    gap: 12px;
  }

  button {
    width: 100%;
    height: 100%;
    font-size: 1.2rem;
    padding: 14px;
    border: 1px solid #ddd;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    cursor: pointer;
  }

  button.selected {
    border-color: #ff6b6b;
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
  }

  .time-section {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .slider-row input[type="range"] {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: #7ec87e;
    border-radius: 3px;
    cursor: pointer;
  }

  .slider-row input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #7ec87e;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .slider-row input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #7ec87e;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }


  .ticks {
    display: flex;
    justify-content: space-between;
    opacity: 0.7;
    font-size: 0.85rem;
  }

  .footer {
    display: flex;
    gap: 12px;
    margin-top: auto;
    position: fixed;
    left: 50%;
    bottom: 90px; /* keep buttons above bottom nav */
    transform: translateX(-50%);
    width: calc(100% - 40px);
    max-width: 1200px;
    padding: 0 4px;
  }

  .next {
    flex: 1;
    padding: 12px;
    border: 2px solid #7ec87e;
    border-radius: 8px;
    background: #7ec87e;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .next:hover:not(:disabled) {
    background: #6ab96a;
  }

  .next:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
