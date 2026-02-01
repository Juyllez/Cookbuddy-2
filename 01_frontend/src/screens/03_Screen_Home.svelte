<script>
  import { flow } from '../stores/flow.js';
  import { onMount } from 'svelte';

  let recommendedRecipes = [];
  let loading = false;
  let dietType = "omnivore";

  onMount(async () => {
    await loadRecommendedRecipes();
  });

  async function loadRecommendedRecipes() {
    loading = true;
    try {
      // Read diet preference from profile (omnivore/vegetarian/vegan/pescatarian)
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
    } catch (e) {
      console.error("Fehler beim Laden empfohlener Rezepte:", e);
      recommendedRecipes = [];
    } finally {
      loading = false;
    }
  }

  function selectRecipe(recipe) {
    flow.update(f => ({
      ...f,
      selectedRecipe: recipe,
        screen: 6 // Zu Screen_Recipe
    }));
  }
</script>

<div class="container">
  <!-- Empfohlene Rezepte -->
  <div class="recommendations-section">
    <h2>Current trends</h2>
    
    {#if loading}
      <p>Loading...</p>
    {:else if recommendedRecipes.length > 0}
      <div class="recipes-grid">
        {#each recommendedRecipes.slice(0, 4) as recipe (recipe.id)}
          <div class="recipe-card" on:click={() => selectRecipe(recipe)}>
            {#if recipe.image}
              <img src={recipe.image} alt={recipe.name} class="recipe-image" />
            {:else}
              <div class="recipe-image placeholder">🍽️</div>
            {/if}
            <h3>{recipe.name}</h3>
          </div>
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
    margin-top: -30px;
  }

  .recommendations-section h2 {
    /* font-size: 20px; */
    /* margin-bottom: 16px; */
    color: #333;
  }

  .recipes-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .recipe-card {
    background: #f9f9f9;
    border-radius: 12px;
    padding: 12px;
    text-align: left;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid #e0e0e0;
  }

  .recipe-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .recipe-image {
    width: 100%;
    height: 120px;
    border-radius: 10px;
    object-fit: cover;
    background: #eee;
    margin-bottom: 10px;
    display: block;
  }

  .recipe-image.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
  }

  .recipe-card h3 {
    /* font-size: 15px; */
    margin: 0;
    color: #333;
  }

</style>
