<script>
  import { flow } from "../stores/flow.js";
  import { onMount } from "svelte";

  let loading = false;
  let error = null;
  let results = [];
  let fallbackMessage = null;

  function buildQuery(f) {
    const dietType = f.profile?.dietType ?? "omnivore";
    const taste = f.taste ?? "any";
    const pantry = (f.pantry ?? []).map((x) => x.name).join(",");
    const cookingTime = f.cookingTime ?? "30";
    const allergies = (f.profile?.allergies ?? []).join(",");

    const params = new URLSearchParams();
    params.set("dietType", dietType);
    params.set("taste", taste);
    params.set("cookingTime", cookingTime);
    if (pantry) params.set("pantry", pantry);
    if (allergies) params.set("allergies", allergies);

    return params.toString();
  }

  async function load() {
    loading = true;
    error = null;
    fallbackMessage = null;

    try {
      const qs = buildQuery($flow);
      const res = await fetch(`http://localhost:3000/recipes?${qs}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data = await res.json();
      results = data.recipes ?? [];
      fallbackMessage = data.message ?? null;
    } catch (e) {
      error = e.message;
      results = [];
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    load();
  });

  $: if ($flow.screen === 4) {
    load();
  }

  function back() {
    flow.update((f) => ({ ...f, screen: 5 }));
  }

  function openDetails(recipe) {
    flow.update((f) => ({
      ...f,
      selectedRecipe: recipe,
      screen: 6,
    }));
  }
</script>

<div class="header-section">
  <button class="back-btn" on:click={back}>
    ←
  </button>
  <h2>Recommended Recipes</h2>
</div>

{#if fallbackMessage}
  <div class="info-box warning">
    ⚠️ {fallbackMessage}
  </div>
{/if}

{#if loading}
  <p class="loading">Loading recipes…</p>
{:else if error}
  <p class="error">Error: {error}</p>
  <button on:click={load}>Try again</button>
{:else if results.length === 0}
  <p>No matching recipes found. Try adjusting your preferences.</p>
{:else}
  <div class="results-container">
    {#each results as r, i (r.id)}
      <div class="recipe-card" class:rank-1={i === 0} class:rank-2={i === 1} class:rank-3={i === 2}>
        <div class="rank-badge">#{i + 1}</div>
        
        {#if r.thumb}
          <img src={r.thumb} alt={r.title} />
        {/if}

        <div class="recipe-info">
          <h3>{r.title}</h3>
          
          <div class="stats">
            <div class="stat">
              <span class="label">Match:</span>
              <span class="value">{r.match}%</span>
            </div>
            <div class="stat">
              <span class="label">Time:</span>
              <span class="value">{r.minutes} min</span>
            </div>
          </div>

          {#if r.matchedPantryItems && r.matchedPantryItems.length > 0}
            <div class="matched-items">
              <span class="matched-label">Uses from pantry:</span>
              <span class="matched-tags">
                {#each r.matchedPantryItems as item}
                  <span class="tag">{item}</span>
                {/each}
              </span>
            </div>
          {/if}

          <button class="details-btn" on:click={() => openDetails(r)}>View Details →</button>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .header-section {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  h2 {
    margin: 0;
    flex: 1;
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
    margin-bottom: 8px;
    width: 40px;
    height: 40px;
  }

  .back-btn:hover {
    opacity: 0.7;
  }

  .info-box {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .info-box.warning {
    background: #fff3cd;
    border-left: 4px solid #ffc107;
    color: #856404;
  }

  .loading,
  .error {
    text-align: center;
    padding: 24px;
  }

  .results-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 60px;
  }

  .recipe-card {
    position: relative;
    display: flex;
    gap: 16px;
    padding: 16px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    background: white;
    overflow: hidden;
    transition: all 0.3s;
  }

  .recipe-card:hover {
    border-color: #ff6b6b;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.15);
  }

  .recipe-card.rank-1 {
    border: 2px solid #ffd700;
    background: #fffef5;
  }

  .recipe-card.rank-1 .rank-badge {
    background: #ffd700;
    color: #333;
  }

  .recipe-card.rank-2 {
    border: 2px solid #c0c0c0;
    background: #fafafa;
  }

  .recipe-card.rank-2 .rank-badge {
    background: #c0c0c0;
    color: #333;
  }

  .recipe-card.rank-3 {
    border: 2px solid #cd7f32;
  }

  .recipe-card.rank-3 .rank-badge {
    background: #cd7f32;
    color: white;
  }

  .rank-badge {
    position: absolute;
    top: -8px;
    left: 16px;
    padding: 4px 12px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.85rem;
    z-index: 1;
  }

  img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .recipe-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  h3 {
    margin: 0;
    font-size: 1.2rem;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    background: #f9f9f9;
    border-radius: 6px;
  }


  .label {
    font-size: 0.8rem;
    opacity: 0.7;
    font-weight: 600;
  }

  .value {
    font-size: 1rem;
    font-weight: 700;
  }

  .details-btn {
    padding: 10px 20px;
    background: #7ec87e;
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
  }

  .details-btn:hover {
    background: #ff5252;
  }

  button {
    display: inline-block;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
  }

  .matched-items {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    background: #e8f5e9;
    border-radius: 6px;
    margin-top: 8px;
  }

  .matched-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #2e7d32;
  }

  .matched-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tag {
    display: inline-block;
    padding: 4px 10px;
    background: #4caf50;
    color: white;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }
</style>

