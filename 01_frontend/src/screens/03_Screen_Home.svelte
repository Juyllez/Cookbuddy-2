<script>
  import { flow } from '../stores/flow.js';
  import { onMount, onDestroy } from 'svelte';

  let recommendedRecipes = [];
  let loading = false;
  let dietType = "omnivore";
  let currentIndex = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let isAnimating = false;
  let autoPlayInterval;

  function getRecipeTags(recipe) {
    const tags = [];
    const diet = $flow?.profile?.dietType || "omnivore";
    const taste = $flow?.taste || "";

    tags.push(`${diet}`);
    
    if (recipe?.minutes) {
      tags.push(`${recipe.minutes} min`);
    }
    
    if (taste && taste !== "any") {
      tags.push(taste);
    }

    return tags;
  }

  onMount(async () => {
    await loadRecommendedRecipes();
    startAutoPlay();
  });

  onDestroy(() => {
    stopAutoPlay();
  });

  async function loadRecommendedRecipes() {
    loading = true;
    try {
      dietType = $flow?.profile?.dietType || "omnivore";
      const allergies = ($flow?.profile?.allergies || []).join(",");
      
      let url = `http://localhost:3000/recipes/recommended?dietType=${encodeURIComponent(dietType)}`;
      if (allergies) {
        url += `&allergies=${encodeURIComponent(allergies)}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      
      const data = await res.json();
      recommendedRecipes = data.recipes || [];
      currentIndex = 0;
    } catch (e) {
      console.error("Fehler beim Laden empfohlener Rezepte:", e);
      recommendedRecipes = [];
    } finally {
      loading = false;
    }
  }

  function startAutoPlay() {
    stopAutoPlay(); // Clear existing interval
    if (recommendedRecipes.length > 0) {
      autoPlayInterval = setInterval(() => {
        nextRecipe();
      }, 5000); // Wechsel alle 5 Sekunden
    }
  }

  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = undefined;
    }
  }

  async function selectRecipe(recipe) {
    try {
      const res = await fetch(`http://localhost:3000/recipes/details/${recipe.id}`);
      if (res.ok) {
        const detailed = await res.json();
        flow.update((f) => ({
          ...f,
          selectedRecipe: { ...recipe, ...detailed },
          returnAfterRecipe: 3,
          screen: 6
        }));
        return;
      }
    } catch (e) {
      console.error("Failed to load recipe details:", e);
    }

    flow.update((f) => ({
      ...f,
      selectedRecipe: recipe,
      returnAfterRecipe: 3,
      screen: 6
    }));
  }

  function handleTouchStart(e) {
    if (isAnimating) return;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    stopAutoPlay(); // Pause beim Interagieren
  }

  function handleTouchEnd(e) {
    if (isAnimating) return;
    
    const diff = touchStartX - e.changedTouches[0].screenX;
    const verticalDiff = Math.abs(touchStartY - e.changedTouches[0].screenY);
    const horizontalDiff = Math.abs(diff);
    
    // Only swipe if horizontal movement is larger than vertical
    if (horizontalDiff > verticalDiff && horizontalDiff > 50) {
      isAnimating = true;
      
      if (diff > 0) {
        // Swiped left - next recipe
        nextRecipe();
      } else {
        // Swiped right - previous recipe
        prevRecipe();
      }
      
      setTimeout(() => {
        isAnimating = false;
        startAutoPlay(); // Fortsetzen nach Interaktion
      }, 300);
    } else {
      startAutoPlay(); // Fortsetzen wenn kein Swipe
    }
  }

  function nextRecipe() {
    currentIndex = (currentIndex + 1) % recommendedRecipes.length;
  }

  function prevRecipe() {
    currentIndex = (currentIndex - 1 + recommendedRecipes.length) % recommendedRecipes.length;
  }

  function getCardStyle(index) {
    const position = (index - currentIndex + recommendedRecipes.length) % recommendedRecipes.length;
    const isActive = position === 0;
    const display = isActive ? 'flex' : 'none';
    
    return `
      display: ${display};
      pointer-events: ${isActive ? 'auto' : 'none'};
    `;
  }

  function goToSlide(index) {
    currentIndex = index;
    stopAutoPlay();
    setTimeout(() => {
      startAutoPlay();
    }, 300);
  }
</script>

<div class="container">
  <!-- Empfohlene Rezepte -->
  <div class="recommendations-section">
    <h2>Current trends</h2>
    
    {#if loading}
      <p>Loading...</p>
    {:else if recommendedRecipes.length > 0}
      <div 
        class="stack-container"
        on:touchstart={handleTouchStart}
        on:touchend={handleTouchEnd}
      >
        {#each recommendedRecipes as recipe, index (index)}
          <div 
            class="recipe-card"
            style={getCardStyle(index)}
            on:click={() => selectRecipe(recipe)}
          >
            {#if recipe.image}
              <img src={recipe.image} alt={recipe.name} class="recipe-image" />
            {:else}
              <div class="recipe-image placeholder">🍽️</div>
            {/if}
            <div class="recipe-info">
              <h3>{recipe.name}</h3>
              <div class="tag-row">
                {#each getRecipeTags(recipe) as tag}
                  <span class="tag">{tag}</span>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Dot Indicators -->
      <div class="indicators">
        {#each recommendedRecipes as _, index}
          <button 
            class="dot"
            class:active={index === currentIndex}
            on:click={() => goToSlide(index)}
            aria-label="Go to slide {index + 1}"
          />
        {/each}
      </div>
    {:else}
      <p>Julia is too poor for API</p>
    {/if}
  </div>

  <!-- Navigation Buttons -->
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding: 20px;
  }

  .recommendations-section {
    margin-top: 10px;
  }

  .recommendations-section h2 {
    color: #333;
    margin-bottom: 24px;
  }

  .stack-container {
    position: relative;
    width: 100%;
    min-height: auto;
    perspective: 1000px;
    user-select: none;
    margin-bottom: 20px;
  }

  .recipe-card {
    position: relative;
    width: 100%;
    background: #f9f9f9;
    border-radius: 20px;
    padding: 0;
    text-align: left;
    cursor: grab;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border: 1px solid #e0e0e0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow: hidden;
  }

  .recipe-card:active {
    cursor: grabbing;
  }

  .recipe-image {
    width: calc(100% + 32px);
    margin: -16px -16px 0 -16px;
    height: 300px;
    border-radius: 20px 20px 0 0;
    object-fit: cover;
    background: #eee;
    display: block;
  }

  .recipe-image.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 64px;
  }

  .recipe-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    padding: 16px;
  }

  .recipe-info h3 {
    margin: 0;
    color: #333;
    font-size: 1.2rem;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }

  .recipe-info .tag-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .recipe-info .tag {
    padding: 6px 12px;
    background: #e3f2fd;
    color: #1976d2;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid #1976d2;
  }

  /* Dot Indicators */
  .indicators {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding-top: 16px;
    margin-top: 0;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: none;
    background: #ddd;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
  }

  .dot:hover {
    background: #aaa;
  }

  .dot.active {
    background: #7ec87e;
    width: 24px;
    border-radius: 4px;
  }

</style>
