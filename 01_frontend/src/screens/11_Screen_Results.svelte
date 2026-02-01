<script>
  import { flow } from "../stores/flow.js";
  import { onMount } from "svelte";

  let loading = false;
  let error = null;
  let results = [];
  let fallbackMessage = null;
  $: displayedResults = results.slice(0, 3);

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
  <button class="back-btn" on:click={back}> ← </button>
  <h2>Recommended recipes</h2>
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
  {#if results.length === 1}
    <div class="alt-heading">Recipes you might also like</div>
  {/if}
  <div class="results-container">
    {#each displayedResults as r, i (r.id)}
      <div
        class="recipe-card"
        class:rank-1={i === 0}
        class:rank-2={i === 1}
        class:rank-3={i === 2}
      >
        <div class="rank-badge">#{i + 1}</div>

        <div class="top-row">
          {#if r.thumb}
            <div class="thumb-wrap">
              <img class="recipe-thumb" src={r.thumb} alt={r.title} />
            </div>
          {/if}

          <div class="recipe-info">
            <h3>{r.title}</h3>

            <div class="recipe-tags">
              <span class="tag">{$flow.profile?.dietType || "omnivore"}</span>
              <span class="tag">{r.minutes} min</span>
              {#if $flow.taste && $flow.taste !== "any"}
                <span class="tag">{$flow.taste}</span>
              {/if}
            </div>

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
          </div>
        </div>

        <div class="bottom-row">
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

          <button class="details-btn" on:click={() => openDetails(r)}
            >See recipe</button
          >
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

  .alt-heading {
    background: white;
    padding: 12px 16px;
    border-radius: 12px;
    font-weight: 600;
    margin-bottom: 16px;
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
    flex-direction: column;
    padding: 0;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    background: white;
    overflow: hidden;
    transition: all 0.3s;
  }

  .recipe-card:hover {
    border-color: #cfcfcf;
  }

  .recipe-card.rank-1 .rank-badge {
    background: #7ec87e;
    color: #022000;
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
    background: #e0e0e0;
    color: #555;
  }

  .top-row {
    display: flex;
    gap: 16px;
    align-items: stretch;
  }

  .thumb-wrap {
    width: 160px;
    align-self: stretch;
    display: flex;
  }

  .recipe-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0;
    flex-shrink: 0;
  }

  .recipe-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px 16px 16px 0;
  }

  .bottom-row {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0 16px 16px 16px;
  }

  .recipe-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
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
    padding: 10px;
    background: #f9f9f9;
    border-radius: 25px;
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
    padding: 10px;
    background: #f2f4f7;
    border-radius: 20px;
    margin-top: 8px;
    /* margin-left: 8px; */
  }

  .matched-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #2f6b2f;
    border-radius: 20px;
  }

  .matched-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    border-radius: 20px;
  }

  .tag {
    display: inline-block;
    padding: 4px 10px;
    background: #e3f2fd;
    color: #1976d2;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
  }
</style>
