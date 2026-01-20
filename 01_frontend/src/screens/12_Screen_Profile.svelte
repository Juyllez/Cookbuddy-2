<script>
  import { flow } from "../stores/flow.js";

  let tab = "saved"; // "saved", "cooked"

  function back() {
    flow.update((f) => ({ ...f, screen: 2 }));
  }

  function resetProfile() {
    if (confirm("Do you really want to reset your profile and start over?")) {
      localStorage.removeItem("profile");
      flow.update((f) => ({
        ...f,
        profile: {
          name: "",
          skillLevel: null,
          allergies: [],
          dietType: "omnivore",
        },
        returnAfterProfile: null,
        screen: 0,
      }));
    }
  }

  function editProfile() {
    flow.update((f) => ({ ...f, returnAfterProfile: 12, screen: 1 }));
  }

  function removeRecipe(list, index) {
    if (list === "saved") {
      flow.removeSavedRecipe(index);
    } else {
      flow.removeCookedRecipe(index);
    }
  }

  function viewRecipe(recipe) {
    flow.update((f) => ({
      ...f,
      selectedRecipe: recipe,
      screen: 6
    }));
  }
</script>

<div class="profile-container">
  <div class="profile-header">
    <h1>{$flow.profile?.name ? `${$flow.profile.name}'s Profile` : "Your Profile"}</h1>
  </div>

  <div class="tabs">
    <button
      class="tab"
      class:active={tab === "saved"}
      on:click={() => (tab = "saved")}
    >
      Saved Recipes ({$flow.savedRecipes.length})
    </button>
    <button
      class="tab"
      class:active={tab === "cooked"}
      on:click={() => (tab = "cooked")}
    >
      Cooked Recipes ({$flow.cookedRecipes.length})
    </button>
  </div>

  <div class="tab-content">
    {#if tab === "saved"}
      <section class="recipes-section">
        <h2>Saved Recipes</h2>

        {#if $flow.savedRecipes.length === 0}
          <div class="empty-state">
            <p>No saved recipes yet.</p>
            <p class="hint">
              Save your favorite recipes to find them here later!
            </p>
          </div>
        {:else}
          <div class="recipes-list">
            {#each $flow.savedRecipes as recipe, index}
              <div class="recipe-item">
                <div class="recipe-info">
                  <h3>{recipe.title}</h3>
                  <p class="recipe-meta">
                    {recipe.minutes} min · {recipe.match}% match
                  </p>
                  <p class="saved-date">
                    Saved: {new Date(recipe.savedAt).toLocaleDateString()}
                  </p>
                </div>
                <div class="recipe-actions">
                  <button class="view-btn" on:click={() => viewRecipe(recipe)}>
                    View
                  </button>
                  <button
                    class="remove-btn"
                    on:click={() => removeRecipe("saved", index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </section>
    {:else if tab === "cooked"}
      <section class="recipes-section">
        <h2>Cooked Recipes</h2>

        {#if $flow.cookedRecipes.length === 0}
          <div class="empty-state">
            <p>No cooked recipes yet.</p>
            <p class="hint">
              Cook and save recipes to track your culinary journey!
            </p>
          </div>
        {:else}
          <div class="recipes-list">
            {#each $flow.cookedRecipes as recipe, index}
              <div class="recipe-item cooked">
                <div class="cooked-badge">Cooked</div>
                <div class="recipe-info">
                  <h3>{recipe.title}</h3>
                  <p class="recipe-meta">
                    {recipe.minutes} min · {recipe.match}% match
                  </p>
                  <p class="cooked-date">
                    Cooked: {new Date(recipe.cookedAt).toLocaleDateString()}
                  </p>
                </div>
                <div class="recipe-actions">
                  <button class="view-btn" on:click={() => viewRecipe(recipe)}>
                    View
                  </button>
                  <button
                    class="remove-btn"
                    on:click={() => removeRecipe("cooked", index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </section>
    {/if}
  </div>

  <section class="profile-section">
    <div class="preferences-header">
      <h2>Your Preferences</h2>
      <button class="edit-inline" on:click={editProfile}>
        Edit profile
      </button>
    </div>

    {#if $flow.profile}
      <div class="profile-grid">
        <div class="profile-item">
          <label>Name</label>
          <div class="value">{$flow.profile.name || "Not set"}</div>
        </div>

        <div class="profile-item">
          <label>Kitchen Skill Level</label>
          <div class="value">
            {#if $flow.profile.skillLevel === "beginner"}
              Beginner
            {:else if $flow.profile.skillLevel === "intermediate"}
              Comfortable in the kitchen
            {:else if $flow.profile.skillLevel === "advanced"}
              Feeling adventurous
            {:else}
              Not set
            {/if}
          </div>
        </div>

        <div class="profile-item">
          <label>Dietary Preference</label>
          <div class="value">
            {#if $flow.profile.dietType === "omnivore"}
              Omnivore
            {:else if $flow.profile.dietType === "pescatarian"}
              Pescatarian
            {:else if $flow.profile.dietType === "vegetarian"}
              Vegetarian
            {:else if $flow.profile.dietType === "vegan"}
              Vegan
            {:else}
              Not set
            {/if}
          </div>
        </div>

        <div class="profile-item full-width">
          <label>Allergies & Intolerances</label>
          <div class="value">
            {#if $flow.profile.allergies.length === 0}
              <span class="none">None specified</span>
            {:else}
              <div class="allergies-tags">
                {#each $flow.profile.allergies as allergy}
                  <span class="tag">{allergy}</span>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <div class="reset-row">
        <button class="reset-btn" on:click={resetProfile}>
          Reset Profile
        </button>
      </div>
    {/if}
  </section>
</div>

<style>
  .profile-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
  }

  .back-btn {
    background: none;
    border: none;
    color: #ff6b6b;
    cursor: pointer;
    font-size: 1rem;
    padding: 0;
    font-weight: 600;
  }

  .back-btn:hover {
    text-decoration: underline;
  }

  h1 {
    margin: 0;
    font-size: 2rem;
  }

  .tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 32px;
    border-bottom: 2px solid #e0e0e0;
  }

  .tab {
    padding: 12px 16px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    color: #999;
    transition: all 0.2s;
  }

  .tab:hover {
    color: #ff6b6b;
  }

  .tab.active {
    color: #ff6b6b;
    border-bottom-color: #ff6b6b;
  }

  .tab-content {
    animation: fadeIn 0.2s ease-in;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .profile-section,
  .recipes-section {
    padding: 24px;
    background: #f9f9f9;
    border-radius: 12px;
  }

  .preferences-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  h2 {
    margin: 0 0 24px 0;
    font-size: 1.6rem;
    color: #333;
  }

  .edit-inline {
    border: 1px solid #ddd;
    background: white;
    color: #555;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.2s;
  }

  .edit-inline:hover {
    border-color: #ff6b6b;
    color: #ff6b6b;
    background: #fff7f7;
  }

  .profile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .profile-item {
    background: white;
    padding: 16px;
    border-radius: 8px;
    border-left: 4px solid #ff6b6b;
  }

  .profile-item.full-width {
    grid-column: 1 / -1;
  }

  .profile-item label {
    display: block;
    font-weight: 600;
    color: #666;
    margin-bottom: 8px;
    font-size: 0.9rem;
  }

  .value {
    font-size: 1.1rem;
    color: #333;
  }

  .none {
    opacity: 0.7;
  }

  .allergies-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    display: inline-block;
    padding: 6px 12px;
    background: #ffe0e0;
    border-radius: 20px;
    font-size: 0.9rem;
    color: #d32f2f;
  }

  .profile-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }

  .edit-btn,
  .reset-btn {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
  }

  .edit-btn {
    background: #e8f5e9;
    color: #2e7d32;
    border: 2px solid #4caf50;
  }

  .edit-btn:hover {
    background: #c8e6c9;
  }

  .reset-btn {
    background: #ffebee;
    color: #c62828;
    border: 2px solid #f44336;
  }

  .reset-btn:hover {
    background: #ffcdd2;
  }

  .reset-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
  }

  .empty-state p {
    margin: 8px 0;
    color: #666;
  }

  .empty-state .hint {
    opacity: 0.7;
    font-size: 0.95rem;
  }

  .recipes-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .recipe-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: white;
    border-radius: 8px;
    border-left: 4px solid #ff6b6b;
    position: relative;
  }

  .recipe-item.cooked {
    border-left-color: #4caf50;
    background: #fafff9;
  }

  .cooked-badge {
    position: absolute;
    top: -12px;
    right: 12px;
    padding: 4px 12px;
    background: #4caf50;
    color: white;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .recipe-info {
    flex: 1;
  }

  .recipe-info h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .recipe-meta {
    margin: 4px 0;
    opacity: 0.7;
    font-size: 0.9rem;
  }

  .saved-date,
  .cooked-date {
    margin: 4px 0 0 0;
    opacity: 0.6;
    font-size: 0.85rem;
  }

  .recipe-actions {
    display: flex;
    gap: 8px;
  }

  .view-btn,
  .remove-btn {
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
  }

  .view-btn {
    background: #e3f2fd;
    color: #1976d2;
  }

  .view-btn:hover {
    background: #bbdefb;
  }

  .remove-btn {
    background: #ffebee;
    color: #c62828;
  }

  .remove-btn:hover {
    background: #ffcdd2;
  }
</style>
