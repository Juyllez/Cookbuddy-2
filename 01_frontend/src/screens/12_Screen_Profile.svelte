<script>
  import { Pencil } from "lucide-svelte";
  import { flow } from "../stores/flow.js";

  let tab = "saved"; // "saved", "cooked"
  let editMode = false;
  let editableProfile = null;

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
    editMode = true;
    editableProfile = {
      name: $flow.profile?.name || "",
      skillLevel: $flow.profile?.skillLevel || null,
      allergies: [...($flow.profile?.allergies || [])],
      allergiesText: ($flow.profile?.allergies || []).join(", "),
      dietType: $flow.profile?.dietType || "omnivore",
    };
  }

  function cancelEdit() {
    editMode = false;
    editableProfile = null;
  }

  function saveProfileEdits() {
    if (!editableProfile) return;
    const allergies = (editableProfile.allergiesText || "")
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    flow.saveProfile({
      ...$flow.profile,
      name: editableProfile.name,
      skillLevel: editableProfile.skillLevel || null,
      dietType: editableProfile.dietType || "omnivore",
      allergies,
    });
    editMode = false;
    editableProfile = null;
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
      screen: 6,
    }));
  }
</script>

<div class="profile-container">
  <div class="profile-header">
    <h2>
      {$flow.profile?.name ? `${$flow.profile.name}'s Profile` : "Your Profile"}
    </h2>
  </div>

  <!-- <div class="tabs">
    <button
      class="tab"
      class:active={tab === "saved"}
      on:click={() => (tab = "saved")}
    >
      Saved Recipes ({$flow.savedRecipes.length})
    </button>
  </div> -->

  <div class="tab-content">
    <section class="recipes-section">
      <h3>Saved Recipes</h3>

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
            <div
              class="recipe-item"
              role="button"
              tabindex="0"
              on:click={() => viewRecipe(recipe)}
              on:keydown={(e) => (e.key === "Enter" || e.key === " ") && viewRecipe(recipe)}
            >
              {#if recipe.image}
                <img class="recipe-thumb" src={recipe.image} alt={recipe.title} />
              {/if}
              <div class="recipe-info">
                <h3>{recipe.title}</h3>
                <div class="recipe-tags">
                  <span class="tag">{recipe.dietType || "omnivore"}</span>
                  <span class="tag">{recipe.minutes} min</span>
                </div>
              </div>
              <button
                class="remove-btn"
                on:click|stopPropagation={() => removeRecipe("saved", index)}
              >
                ×
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </section>
  </div>

  <section class="profile-section">
    <div class="preferences-header">
      <h3>Preferences</h3>
      <button class="icon-btn" on:click={editProfile} aria-label="Edit profile">
        <Pencil size={18} />
      </button>
    </div>

    {#if $flow.profile}
      <div class="profile-grid">
        <div class="profile-item">
          <label>Name</label>
          {#if editMode}
            <input class="input" type="text" bind:value={editableProfile.name} placeholder="Name" />
          {:else}
            <div class="value">{$flow.profile.name || "Not set"}</div>
          {/if}
        </div>

        <div class="profile-item">
          <label>Kitchen Skill Level</label>
          {#if editMode}
            <select class="input" bind:value={editableProfile.skillLevel}>
              <option value="" disabled>Select skill level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Comfortable</option>
              <option value="advanced">Advanced</option>
            </select>
          {:else}
            <div class="value">
              {#if $flow.profile.skillLevel === "beginner"}
                Beginner
              {:else if $flow.profile.skillLevel === "intermediate"}
                Comfortable
              {:else if $flow.profile.skillLevel === "advanced"}
                Advanced
              {:else}
                Not set
              {/if}
            </div>
          {/if}
        </div>

        <div class="profile-item">
          <label>Dietary Preference</label>
          {#if editMode}
            <select class="input" bind:value={editableProfile.dietType}>
              <option value="omnivore">Omnivore</option>
              <option value="pescatarian">Pescatarian</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>
          {:else}
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
          {/if}
        </div>

        <div class="profile-item full-width">
          <label>Allergies & Intolerances</label>
          {#if editMode}
            <input
              class="input"
              type="text"
              placeholder="Comma separated (e.g. nuts, milk)"
              bind:value={editableProfile.allergiesText}
            />
          {:else}
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
          {/if}
        </div>
      </div>

      {#if editMode}
        <div class="reset-row">
          <button class="reset-btn" on:click={resetProfile}>Reset Profile</button>
          <button class="reset-btn" on:click={cancelEdit}>Cancel</button>
          <button class="save-btn" on:click={saveProfileEdits}>Save</button>
        </div>
      {/if}
    {/if}
  </section>
</div>

<style>
  .profile-container {
    /* max-width: 900px; */
    margin: 0 auto;
    padding: 20px;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
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
    padding: 12px;
    /* background: #f9f9f9; */
    /* border-radius: 12px; */
  }

  .preferences-header {
    display: flex;
    align-items: center;
      justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  /* h2 {
    margin: 0 0 24px 0;
    font-size: 1.6rem;
    color: #333;
  } */

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

  .icon-btn {
    border: 1px solid #ddd;
    background: white;
    color: #555;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .icon-btn:hover {
    border-color: #7ec87e;
    color: #2f6b2f;
    background: #e9f7e7;
  }

  /* .edit-inline:hover {
    border-color: #ff6b6b;
    color: #ff6b6b;
    background: #fff7f7;
  } */

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
    border-left: 4px solid #044000;
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

  .input {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-size: 1rem;
    font-family: inherit;
  }

  .input:focus {
    outline: none;
    border-color: #7ec87e;
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
    gap: 12px;
  }

  .save-btn {
    background: #e8f5e9;
    color: #2e7d32;
    border: 2px solid #4caf50;
    padding: 12px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    flex: 1;
  }

  .save-btn:hover {
    background: #c8e6c9;
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
    position: relative;
    cursor: pointer;
  }

  .recipe-thumb {
    width: 72px;
    height: 72px;
    object-fit: cover;
    border-radius: 12px;
    flex-shrink: 0;
  }

  .recipe-info {
    flex: 1;
  }

  .recipe-info h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .recipe-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 6px;
  }

  .tag {
    display: inline-block;
    padding: 6px 12px;
    background: #e3f2fd;
    border-radius: 20px;
    font-size: 0.85rem;
    color: #1976d2;
    font-weight: 600;
  }

  .remove-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 50%;
    background: #ffebee;
    color: #c62828;
    cursor: pointer;
    font-size: 20px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    padding: 0;
  }

  .remove-btn:hover {
    background: #ffcdd2;
    transform: scale(1.1);
  }
</style>
