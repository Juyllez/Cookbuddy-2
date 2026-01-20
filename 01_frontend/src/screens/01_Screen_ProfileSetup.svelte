<script>
  import { flow } from "../stores/flow.js";

  let step = 1; // 1: Name, 2: Skill, 3: Allergies, 4: Diet
  let localProfile = { ...$flow.profile };
  let nameInput = $flow.profile.name || "";
  let allergyInput = "";
  let skillSliderValue = 50; // 0-100 for Noob to Chef
  
  // Initialize skillSliderValue based on existing profile
  if (localProfile.skillLevel === "beginner") {
    skillSliderValue = 16;
  } else if (localProfile.skillLevel === "intermediate") {
    skillSliderValue = 50;
  } else if (localProfile.skillLevel === "advanced") {
    skillSliderValue = 83;
  }
  
  // Initialize skillLevel for new profiles
  updateSkillLevel(skillSliderValue);

  function nextStep() {
    step += 1;
  }

  function prevStep() {
    if (step > 1) step -= 1;
  }

  function nameInputHandler(event) {
    nameInput = event.target.value;
    localProfile.name = nameInput;
  }
  
  function updateSkillLevel(value) {
    skillSliderValue = value;
    if (value < 33) {
      localProfile.skillLevel = "beginner";
    } else if (value < 66) {
      localProfile.skillLevel = "intermediate";
    } else {
      localProfile.skillLevel = "advanced";
    }
  }

  function addAllergy() {
    const name = allergyInput.trim().toLowerCase();
    if (name && !localProfile.allergies.includes(name)) {
      localProfile.allergies = [...localProfile.allergies, name];
    }
    allergyInput = "";
  }

  function removeAllergy(allergy) {
    localProfile.allergies = localProfile.allergies.filter(a => a !== allergy);
  }

  function selectDiet(diet) {
    localProfile.dietType = diet;
    finishProfile();
  }

  function finishProfile() {
    console.log("Saving profile:", localProfile);
    flow.saveProfile(localProfile);
    flow.update(f => {
      const target = f.returnAfterProfile ?? 3; // go to home screen (screen 3) after profile setup
      return { ...f, screen: target, returnAfterProfile: null };
    });
  }

  function handleAllergyKeydown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addAllergy();
    }
  }

  function getSkillLabel(value) {
    if (value < 33) return "Noob";
    if (value < 66) return "Decent Skills";
    return "Chef";
  }

  function canProceed() {
    if (step === 1) return nameInput.trim() !== "";
    if (step === 2) return true;
    if (step === 3) return true;
    if (step === 4) return localProfile.dietType !== "";
    return false;
  }
</script>

<div class="screen">
  <div class="progress-container">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {step === 1 ? '25%' : step === 2 ? '50%' : step === 3 ? '75%' : '100%'}"></div>
    </div>
    <span class="progress-text">{step}/4</span>
  </div>

  {#if step === 1}
    <div class="step">
      <h1>Set up your profile:</h1>

      <div class="form-group">
        <input 
          type="text" 
          bind:value={nameInput} 
          on:input={nameInputHandler} 
          placeholder="Name" 
        />
      </div>

      <div class="nav-buttons">
        <button on:click={nextStep} disabled={!canProceed()}>Next</button>
      </div>
    </div>

  {:else if step === 2}
    <div class="step">
      <h2>How much cooking experience do you have?</h2>
      
      <div class="slider-container">
        <span class="slider-label">−</span>
        <input type="range" min="0" max="100" value={skillSliderValue} on:input={(e) => updateSkillLevel(e.target.value)} class="slider" />
        <span class="slider-label">+</span>
      </div>
      
      <div class="slider-labels">
        <span>Noob</span>
        <span>Decent Skills</span>
        <span>Chef</span>
      </div>

      <div class="nav-buttons">
        <button class="secondary" on:click={prevStep}>Back</button>
        <button on:click={nextStep}>Next</button>
      </div>
    </div>

  {:else if step === 3}
    <div class="step">
      <h2>Do you have any allergies or intolerances?</h2>
      
      <div class="allergies-input">
        <input
          type="text"
          placeholder="e.g. peanuts, gluten, lactose..."
          bind:value={allergyInput}
          on:keydown={handleAllergyKeydown}
          autocomplete="off"
        />
      </div>

      {#if localProfile.allergies.length > 0}
        <div class="allergies-list">
          {#each localProfile.allergies as allergy}
            <div class="allergy-tag">
              <span>{allergy}</span>
              <button
                type="button"
                class="remove"
                on:click={() => removeAllergy(allergy)}
              >
                ✕
              </button>
            </div>
          {/each}
        </div>
      {/if}

      <div class="nav-buttons">
        <button class="secondary" on:click={prevStep}>Back</button>
        <button on:click={nextStep}>Next</button>
      </div>
    </div>

  {:else if step === 4}
    <!-- Dietary Preference -->
    <div class="step">
      <h2>What's your dietary preference?</h2>
      
      <div class="diet-options">
        <button 
          class={localProfile.dietType === "omnivore" ? "selected" : ""}
          on:click={() => { localProfile.dietType = "omnivore"; }}
        >
          I have no preferences
        </button>
        <button 
          class={localProfile.dietType === "pescatarian" ? "selected" : ""}
          on:click={() => { localProfile.dietType = "pescatarian"; }}
        >
          No meat, but fish is fine
        </button>
        <button 
          class={localProfile.dietType === "vegetarian" ? "selected" : ""}
          on:click={() => { localProfile.dietType = "vegetarian"; }}
        >
          No meat or fish
        </button>
        <button 
          class={localProfile.dietType === "vegan" ? "selected" : ""}
          on:click={() => { localProfile.dietType = "vegan"; }}
        >
          No animal products
        </button>
      </div>

      <div class="nav-buttons">
        <button class="secondary" on:click={prevStep}>Back</button>
        <button on:click={() => { if (localProfile.dietType) finishProfile(); }} disabled={!localProfile.dietType}>Finish</button>
      </div>
    </div>
  {/if}
</div>



<style>
  .screen {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: calc(100vh - 140px);
    padding: 16px;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }

  .progress-container {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .progress-bar {
    flex: 1;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #7ec87e;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.9rem;
    color: #666;
    min-width: 30px;
    text-align: right;
  }

  .step {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  h1 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 600;
  }

  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  input[type="text"] {
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
  }

  input[type="text"]:focus {
    outline: none;
    border-color: #7ec87e;
  }

  .slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .slider {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: #7ec87e;
    border-radius: 3px;
    cursor: pointer;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #7ec87e;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #7ec87e;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .slider-label {
    font-size: 1.2rem;
    color: #7ec87e;
    font-weight: bold;
    width: 20px;
    text-align: center;
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #666;
    margin-top: 4px;
  }

  .allergies-input {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .allergies-input input {
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
  }

  .allergies-input input:focus {
    outline: none;
    border-color: #7ec87e;
  }

  .allergies-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .allergy-tag {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #d4f1d4;
    border-radius: 20px;
    font-size: 0.9rem;
  }

  .allergy-tag .remove {
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    font-weight: bold;
    opacity: 0.7;
    width: auto;
    height: auto;
  }

  .allergy-tag .remove:hover {
    opacity: 1;
    box-shadow: none;
    border-color: transparent;
  }

  .diet-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .diet-options button {
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
    font-size: 0.95rem;
  }

  .diet-options button:hover {
    border-color: #7ec87e;
  }

  .diet-options button.selected {
    background: #d4f1d4;
    border-color: #7ec87e;
  }

  .nav-buttons {
    display: flex;
    gap: 12px;
    margin-top: 20px;
  }

  .nav-buttons button {
    flex: 1;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.2s;
  }

  .nav-buttons button:not(.secondary) {
    background: #7ec87e;
    color: white;
    border-color: #7ec87e;
  }

  .nav-buttons button:not(.secondary):hover {
    background: #6ab96a;
  }

  .nav-buttons button.secondary {
    background: #f5f5f5;
    color: #333;
  }

  .nav-buttons button.secondary:hover {
    background: #e0e0e0;
  }

  .nav-buttons button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
