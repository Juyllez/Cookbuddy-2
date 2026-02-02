import { writable } from "svelte/store";

// Profile wird in localStorage gespeichert
function loadProfile() {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("profile");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error loading profile:", e);
      }
    }
  }
  return null;
}

function loadArray(key) {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
      } catch (e) {
        console.error(`Error loading ${key}:`, e);
      }
    }
  }
  return [];
}

function createFlow() {
  const profile = loadProfile();
  console.log("Loaded profile:", profile);
  console.log("Profile skillLevel:", profile?.skillLevel);
  console.log("Profile name:", profile?.name);
  console.log("Profile name length:", profile?.name?.length);
  const hasProfile = profile && profile.skillLevel && profile.name && profile.name.length > 0;
  console.log("Has valid profile:", hasProfile);
  console.log("Initial screen will be:", hasProfile ? 3 : 0);
  
  const initialState = {
    // Navigation
    screen: hasProfile ? 3 : 0, 
    
    // Profile (wird einmalig am Anfang gespeichert)
    profile: profile || {
      name: "",
      skillLevel: null, // "beginner", "intermediate", "advanced"
      allergies: [], // Array von Allergien/Unverträglichkeiten
      dietType: "omnivore", // "omnivore", "vegetarian", "vegan", "pescatarian"
    },
    
    // Laufende Session
    taste: null, // "savory", "sweet", "any"
    cookingTime: null, // "15", "30", "60"
    difficulty: null, // "easy", "medium", "hard"
    pantry: [], // Array von { name, mustUse }
    results: [], // Array von gefundenen Rezepten
    selectedRecipe: null,
    
    // Gespeicherte und gekochte Rezepte
    savedRecipes: loadArray("savedRecipes"), // Array von Rezepten
    cookedRecipes: loadArray("cookedRecipes"), // Array von Rezepten

    // Navigation helpers
    returnAfterProfile: null, // optional target screen after editing profile
    returnAfterRecipe: null, // optional target screen after viewing a recipe
  };
  
  const store = writable(initialState);
  
  return {
    subscribe: store.subscribe,
    update: store.update,
    reset: () => {
      store.update(f => ({
        ...f,
        taste: null,
        cookingTime: null,
        difficulty: null,
        pantry: [],
        results: [],
        selectedRecipe: null,
        screen: 3, // Zurück zu Taste nach Rezeptsuche
      }));
    },
    saveProfile: (profile) => {
      console.log("saveProfile called with:", profile);
      if (typeof window !== "undefined") {
        localStorage.setItem("profile", JSON.stringify(profile));
        console.log("Saved to localStorage:", localStorage.getItem("profile"));
      }
      store.update(f => ({ ...f, profile }));
    },
    saveRecipe: (recipe) => {
      store.update(f => {
        const updated = [...f.savedRecipes, { ...recipe, savedAt: new Date().toISOString() }];
        if (typeof window !== "undefined") {
          localStorage.setItem("savedRecipes", JSON.stringify(updated));
        }
        return { ...f, savedRecipes: updated };
      });
    },
    cookRecipe: (recipe) => {
      store.update(f => {
        const updated = [...f.cookedRecipes, { ...recipe, cookedAt: new Date().toISOString() }];
        if (typeof window !== "undefined") {
          localStorage.setItem("cookedRecipes", JSON.stringify(updated));
        }
        return { ...f, cookedRecipes: updated };
      });
    },
    removeSavedRecipe: (index) => {
      store.update(f => {
        const updated = f.savedRecipes.filter((_, i) => i !== index);
        if (typeof window !== "undefined") {
          localStorage.setItem("savedRecipes", JSON.stringify(updated));
        }
        return { ...f, savedRecipes: updated };
      });
    },
    removeCookedRecipe: (index) => {
      store.update(f => {
        const updated = f.cookedRecipes.filter((_, i) => i !== index);
        if (typeof window !== "undefined") {
          localStorage.setItem("cookedRecipes", JSON.stringify(updated));
        }
        return { ...f, cookedRecipes: updated };
      });
    }
  };
}

export const flow = createFlow();