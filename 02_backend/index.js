require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors());

function normalizeAllergies(allergiesParam = "") {
    const raw = (allergiesParam || "")
        .split(",")
        .map(a => a.trim().toLowerCase())
        .filter(Boolean);

    const map = new Map([
        ["lactose", "dairy"],
        ["laktose", "dairy"],
        ["milk", "dairy"],
        ["cheese", "dairy"],
        ["butter", "dairy"],
        ["eggs", "egg"],
        ["egg", "egg"],
        ["nuts", "tree nut"],
        ["nut", "tree nut"],
        ["peanut", "peanut"],
        ["gluten", "gluten"],
        ["wheat", "wheat"],
        ["soy", "soy"],
        ["fish", "fish"],
        ["shellfish", "shellfish"],
        ["sesame", "sesame"]
    ]);

    const normalized = raw.map(a => map.get(a) || a);
    return Array.from(new Set(normalized));
}

app.get("/", (req, res) => {
    res.send("Welcome to the Recipe Master Backend!");
});

app.get("/status", (req, res) => {
    res.json({ status: "Recipe Master Backend is running!" });
});

app.get("/recipes/recommended", async (req, res) => {
    console.log("Received recommended recipes request", req.query);
    try {
        const { dietType = "omnivore", allergies: allergiesParam = "" } = req.query;
        const allergies = normalizeAllergies(allergiesParam);
        
        console.log("Filtering for allergies:", allergies);

        // Build base URL for popular recipes
        let apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=&number=20&sort=popularity&addRecipeInformation=true`;

        // Map diet preferences
        if (dietType === "vegetarian") apiUrl += "&diet=vegetarian";
        if (dietType === "vegan") apiUrl += "&diet=vegan";
        if (dietType === "pescatarian") apiUrl += "&diet=pescatarian";
        
        // Add intolerances to API call if provided
        if (allergies.length > 0) {
            apiUrl += `&intolerances=${encodeURIComponent(allergies.join(","))}`;
        }

        apiUrl += `&apiKey=${process.env.SPOONACULAR_API_KEY}`;

        console.log("Recommended API URL:", apiUrl.replace(process.env.SPOONACULAR_API_KEY, "***"));
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === "failure" || data.code === 401) {
            console.error("API Error:", data.message);
            return res.json({ recipes: [] });
        }

        let results = data.results || [];
        
        // Additional client-side allergy filtering for safety
        if (allergies.length > 0) {
            // Create a reverse map of common allergen keywords
            const allergyKeywords = {
                "dairy": ["milk", "cheese", "butter", "cream", "yogurt", "lactose", "whey", "casein"],
                "egg": ["egg", "eggs", "eggy"],
                "gluten": ["gluten", "wheat", "flour", "bread", "pasta"],
                "tree nut": ["almond", "walnut", "pecan", "cashew", "pistachio", "macadamia", "hazelnut", "chestnut"],
                "peanut": ["peanut", "groundnut"],
                "soy": ["soy", "soybean", "tofu", "edamame"],
                "fish": ["fish", "salmon", "tuna", "cod", "bass", "trout", "anchovy"],
                "shellfish": ["shellfish", "shrimp", "prawn", "crab", "lobster", "clam", "mussel", "oyster", "scallop"],
                "sesame": ["sesame", "tahini"]
            };
            
            results = results.filter(recipe => {
                const ingredientNames = [];
                if (Array.isArray(recipe.extendedIngredients)) {
                    for (const ing of recipe.extendedIngredients) {
                        const name = (ing?.name || ing?.original || "").toLowerCase();
                        if (name) ingredientNames.push(name);
                    }
                }
                if (recipe.title) ingredientNames.push(recipe.title.toLowerCase());
                
                // Check if any allergen is found in ingredients
                const hasAllergy = allergies.some(allergy => {
                    const keywords = allergyKeywords[allergy] || [allergy];
                    return keywords.some(keyword => 
                        ingredientNames.some(name => name.includes(keyword))
                    );
                });
                
                if (hasAllergy) {
                    console.log(`🚫 Filtered out "${recipe.title}" - contains allergy: ${allergies.join(", ")}`);
                }
                
                return !hasAllergy;
            });
        }

        // Defensive filtering for animal products if dietType=vegan
        if (dietType === "vegan") {
            const animalKeywords = [
                "beef", "pork", "chicken", "turkey", "lamb", "veal",
                "fish", "salmon", "tuna", "cod", "shrimp", "prawn", "crab",
                "egg", "eggs", "milk", "cheese", "yogurt", "butter", "cream",
                "honey", "gelatin", "lard"
            ];
            const containsAnimalProduct = (recipe) => {
                const names = [];
                if (Array.isArray(recipe.extendedIngredients)) {
                    for (const ing of recipe.extendedIngredients) {
                        const name = (ing?.name || ing?.original || "").toLowerCase();
                        if (name) names.push(name);
                    }
                }
                // Check title/summary as a fallback
                if (recipe.title) names.push(recipe.title.toLowerCase());
                if (recipe.summary) names.push(recipe.summary.toLowerCase());
                return animalKeywords.some(k => names.some(n => n.includes(k)));
            };
            results = results.filter(r => !containsAnimalProduct(r));
        }

        const recipes = results.slice(0, 4).map(r => ({
            id: r.id,
            name: r.title,
            title: r.title,
            image: r.image,
            thumb: r.image,
            description: r.summary ? r.summary.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'Delicious recipe',
            minutes: r.readyInMinutes || 30
        }));

        console.log(`Found ${recipes.length} recommended recipes after filtering`);
        res.json({ recipes });
    } catch (error) {
        console.error("Error fetching recommended recipes:", error);
        res.json({ recipes: [], error: error.message });
    }
});

app.get("/recipes", async (req, res) => {
    console.log("Received recipes request:", req.query);
    try {
        const { 
            dietType = "omnivore", 
            taste = "any", 
            pantry = "",
            difficulty = "medium",
            cookingTime = "30",
            allergies: allergiesParam = ""
        } = req.query;
        
        const allergies = normalizeAllergies(allergiesParam);
        
        console.log("Parameters:", { dietType, taste, difficulty, cookingTime, pantry, allergies });
        
        // Define pantry array BEFORE using it in buildQueryTerm
        const pantryArray = pantry ? pantry.split(",").map(i => i.trim().toLowerCase()) : [];
        
        // Build query term by taste and pantry items
        function buildQueryTerm() {
            // If pantry items exist, use them in the query for better targeting
            if (pantryArray.length > 0) {
                return pantryArray.slice(0, 2).join(" ");
            }
            // Otherwise use taste-based search
            if (taste === "sweet") return "cake";
            if (taste === "savory") return "pasta";
            return "chicken";
        }
        const timeRange = {
          "10": { min: 0, max: 15 },
          "20": { min: 10, max: 25 },
          "30": { min: 20, max: 40 },
          "45": { min: 35, max: 55 },
          "60": { min: 50, max: 120 },
          "any": { min: 0, max: 180 }
        }[cookingTime] || { min: 0, max: 180 };
        
        async function fetchRecipes(includeIngredients = null) {
            let apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${buildQueryTerm()}&number=100&addRecipeInformation=true&fillIngredients=true`;
            
            // Map dietType to Spoonacular diet parameter
            if (dietType === "vegetarian") apiUrl += "&diet=vegetarian";
            if (dietType === "vegan") apiUrl += "&diet=vegan";
            if (dietType === "pescatarian") apiUrl += "&diet=pescatarian";
            
            // Add time range filter
            apiUrl += `&maxReadyTime=${timeRange.max}`;
            
            // Add intolerances/allergies filter
            if (allergies.length > 0) {
                apiUrl += `&intolerances=${encodeURIComponent(allergies.join(","))}`;
            }
            
            if (includeIngredients) {
                apiUrl += `&includeIngredients=${encodeURIComponent(includeIngredients)}`;
            }
            
            apiUrl += `&apiKey=${process.env.SPOONACULAR_API_KEY}`;
            
            console.log("Calling Spoonacular API...");
            console.log("API URL:", apiUrl.replace(process.env.SPOONACULAR_API_KEY, "***"));
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            console.log("API Response status:", response.status);
            console.log("API Response data:", JSON.stringify(data).substring(0, 500));
            
            if (data.status === "failure" || data.code === 401) {
                console.error("API Error:", data.message);
                return { results: [] };
            }
            
            return data;
        }

        // Fetch using pantry filter (if provided)
        // Strategy: Fetch broadly WITHOUT includeIngredients to get more results,
        // then match pantry items in backend using extendedIngredients
        const primaryData = await fetchRecipes(null);
        const primaryResults = Array.isArray(primaryData) ? primaryData : (primaryData.results || []);
        console.log(`API returned ${primaryResults.length} recipes`);

        function computeMatchCount(recipe) {
            const names = [];
            // Check extendedIngredients (main source)
            if (Array.isArray(recipe.extendedIngredients) && recipe.extendedIngredients.length) {
                for (const ing of recipe.extendedIngredients) {
                    if (ing) {
                        const name = (ing.name || ing.original || "").toLowerCase();
                        if (name) names.push(name);
                    }
                }
            }
            // Also check usedIngredients if available
            if (Array.isArray(recipe.usedIngredients) && recipe.usedIngredients.length) {
                for (const ing of recipe.usedIngredients) {
                    if (ing) {
                        const name = (ing.name || "").toLowerCase();
                        if (name) names.push(name);
                    }
                }
            }
            
            // Debug: log ingredient names for first recipe
            if (names.length > 0 && recipe === primaryResults[0]) {
                console.log(`Sample recipe ingredients: [${names.slice(0, 5).join(', ')}...]`);
            }
            
            let count = 0;
            const matched = [];
            for (const p of pantryArray) {
                // Flexible matching: ingredient contains pantry item OR vice versa
                const found = names.some(n => {
                    return n.includes(p) || p.includes(n);
                });
                if (found) {
                    count++;
                    matched.push(p);
                }
            }
            return { count, matched };
        }

        const scored = primaryResults.map(r => {
            const recipeTime = r.readyInMinutes || 30;
            const timeMatch = recipeTime >= timeRange.min && recipeTime <= timeRange.max;
            const matchResult = pantryArray.length ? computeMatchCount(r) : { count: 0, matched: [] };
            const matchCount = matchResult.count;
            const matchedItems = matchResult.matched;
            
            // Calculate match score: prioritize pantry matches, then time proximity
            let matchScore = 0;
            if (pantryArray.length > 0) {
                // Pantry match score (0-100): how many pantry items are in the recipe
                const pantryScore = (matchCount / pantryArray.length) * 100;
                
                // Time score (0-100): how close to target time (max 100 points)
                const targetTime = (timeRange.min + timeRange.max) / 2;
                const timeDeviation = Math.abs(recipeTime - targetTime);
                const maxDeviation = (timeRange.max - timeRange.min) / 2;
                const timeScore = Math.max(0, 100 - (timeDeviation / maxDeviation) * 100);
                
                // Total: pantry (50%) + time (50%)
                matchScore = Math.round((pantryScore * 0.5) + (timeScore * 0.5));
            }
            
            return { ...r, recipeTime, timeMatch, matchCount, matchScore, matchedItems };
        });

        console.log(`After scoring: ${scored.length} recipes`);
        console.log(`Time range: ${timeRange.min}-${timeRange.max} min`);
        console.log(`Pantry items (searching for): [${pantryArray.join(', ')}]`);
        
        // Count matches per recipe for debugging
        const withMatches = scored.filter(r => r.matchCount > 0);
        console.log(`Recipes with matches: ${withMatches.length}`);
        withMatches.slice(0, 10).forEach(r => {
            console.log(`  ✓ ${r.title}: ${r.matchCount} matches [${r.matchedItems.join(', ')}] - ${r.recipeTime}min`);
        });
        
        if (withMatches.length === 0 && pantryArray.length > 0) {
            console.log(`⚠️  No matches found! Checking first 3 recipe ingredients...`);
            scored.slice(0, 3).forEach(r => {
                const names = [];
                if (r.extendedIngredients) {
                    r.extendedIngredients.slice(0, 5).forEach(ing => {
                        names.push(ing.name || ing.original);
                    });
                }
                console.log(`  Recipe "${r.title}": [${names.join(', ')}]`);
            });
        }

        const topRecipes = scored
            .filter(r => {
                // Filter only by time - pantry items are just for ranking/sorting
                return r.timeMatch;
            })
            .sort((a, b) => {
                // Priority 1: Sort by pantry match count first (higher is better)
                if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
                // Priority 2: Then by cooking time (closer to target is better)
                const targetTime = (timeRange.min + timeRange.max) / 2;
                const deviationA = Math.abs(a.recipeTime - targetTime);
                const deviationB = Math.abs(b.recipeTime - targetTime);
                return deviationA - deviationB;
            })
            .slice(0, 10);
        
        const withMatchesCount = topRecipes.filter(r => r.matchCount > 0).length;
        console.log(`After filtering: ${topRecipes.length} recipes total${pantryArray.length ? ` (${withMatchesCount} with pantry matches)` : ''}`);

        // If we have less than 3 recipes, fetch alternatives with looser matching
        let finalRecipes = topRecipes;
        if (finalRecipes.length < 3 && pantryArray.length > 0) {
            console.log(`⚠️  Found only ${finalRecipes.length} recipe(s)! Fetching alternative recipes to reach 3...`);
            try {
                // Fetch recipes with just the first pantry item
                const firstItem = pantryArray[0];
                let altUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(firstItem)}&number=20&addRecipeInformation=true&fillIngredients=true`;
                if (dietType === "vegetarian") altUrl += "&diet=vegetarian";
                if (dietType === "vegan") altUrl += "&diet=vegan";
                if (dietType === "pescatarian") altUrl += "&diet=pescatarian";
                altUrl += `&maxReadyTime=${timeRange.max}`;
                if (allergies.length > 0) {
                    altUrl += `&intolerances=${encodeURIComponent(allergies.join(","))}`;
                }
                altUrl += `&apiKey=${process.env.SPOONACULAR_API_KEY}`;
                
                const altRes = await fetch(altUrl);
                const altData = await altRes.json();
                const altResults = Array.isArray(altData) ? altData : (altData.results || []);
                
                // Score alternatives with simple approach
                const altScored = altResults.map(r => {
                    const recipeTime = r.readyInMinutes || 30;
                    const timeMatch = recipeTime >= timeRange.min && recipeTime <= timeRange.max;
                    
                    // For alternatives, assume they have at least the pantry item they were searched for
                    return { 
                        ...r, 
                        recipeTime, 
                        timeMatch, 
                        matchCount: 1,
                        matchScore: 50, // Middle score for alternatives
                        matchedItems: [firstItem] 
                    };
                });
                
                // Filter by time and sort
                const filteredAlt = altScored
                    .filter(r => r.timeMatch)
                    .sort((a, b) => (a.recipeTime || 999) - (b.recipeTime || 999));
                
                // Combine: keep existing recipes + add alternatives up to 3 total
                finalRecipes = [...finalRecipes, ...filteredAlt].slice(0, 3);
                    
                console.log(`Found ${finalRecipes.length} total recipes (${topRecipes.length} strict + ${filteredAlt.length} alternatives)`);
            } catch (e) {
                console.error(`Error fetching alternatives: ${e.message}`);
                // If fetching alternatives fails, just use what we have
            }
        }

        // Transform to frontend format
        const recipes = await Promise.all(finalRecipes.map(async (r) => {
            let ingredients = [];
            
            // Try to get extended ingredients first
            if (r.extendedIngredients && Array.isArray(r.extendedIngredients) && r.extendedIngredients.length > 0) {
                ingredients = r.extendedIngredients.map(ing => ing.original || ing.name);
            } else if (r.usedIngredients && Array.isArray(r.usedIngredients) && r.usedIngredients.length > 0) {
                ingredients = r.usedIngredients.map(ing => ing.name);
            } else {
                // If no ingredients found, fetch recipe details
                try {
                    const detailUrl = `https://api.spoonacular.com/recipes/${r.id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`;
                    const detailRes = await fetch(detailUrl);
                    if (detailRes.ok) {
                        const detail = await detailRes.json();
                        if (detail.extendedIngredients && Array.isArray(detail.extendedIngredients)) {
                            ingredients = detail.extendedIngredients.map(ing => ing.original || ing.name);
                        }
                    }
                } catch (e) {
                    console.error(`Error fetching details for recipe ${r.id}:`, e.message);
                }
            }
            
            return {
                id: r.id,
                title: r.title,
                thumb: r.thumb || r.image,
                match: typeof r.matchScore === "number" ? r.matchScore : 0,
                missing: r.missedIngredients ? r.missedIngredients.length : 0,
                minutes: r.readyInMinutes || r.minutes || 30,
                ingredients: ingredients,
                matchedPantryItems: r.matchedItems || []
            };
        }));

        console.log(`Found ${recipes.length} recipes total`);
        
        res.json({ 
            recipes,
            message: null  // No warning message - pantry is just for ranking
        });
    } catch (error) {
        console.error("Error fetching recipes:", error);
        res.json({ recipes: [], error: error.message });
    }
});

app.get("/random", async (req, res) => {
    console.log("Received random recipe request");
    try {
        const response = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
        const data = await response.json();
        const meal = data.meals[0];
        console.log("Fetched random recipe:", meal);
        res.json(meal);
    }
    catch (error) {
        console.error("Error fetching random recipe:", error);
        res.json({ error: error.message });
    }
});

app.get("/recipes/details/:id", async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing recipe id" });

    try {
        const detailUrl = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`;
        const detailRes = await fetch(detailUrl);
        if (!detailRes.ok) {
            return res.status(detailRes.status).json({ error: "Failed to fetch recipe details" });
        }
        const detail = await detailRes.json();
        const diets = Array.isArray(detail.diets) ? detail.diets : [];
        const dietType = diets.includes("vegan")
            ? "vegan"
            : diets.includes("vegetarian")
            ? "vegetarian"
            : diets.includes("pescatarian")
            ? "pescatarian"
            : "omnivore";

        const ingredients = Array.isArray(detail.extendedIngredients)
            ? detail.extendedIngredients.map((ing) => ing.original || ing.name).filter(Boolean)
            : [];

        res.json({
            id: detail.id,
            title: detail.title,
            image: detail.image,
            thumb: detail.image,
            minutes: detail.readyInMinutes || 30,
            dietType,
            ingredients,
            instructions: detail.instructions || "",
            analyzedInstructions: detail.analyzedInstructions || [],
            summary: detail.summary || ""
        });
    } catch (error) {
        console.error("Error fetching recipe details:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/chat", async (req, res) => {
    console.log("Received chat request:", req.body);
    const { message, context = "general", recipe = "" } = req.body;

    try {
        // Different prompts based on context
        let systemPrompt = "";
        
        if (context === "ingredient") {
            // Context: Questions about ingredient substitutes
            systemPrompt = `You are a friendly and helpful cooking assistant.
The user has selected a recipe and is asking about alternatives to specific ingredients or other cooking questions.
Give short, practical suggestions (2-3 alternatives) with brief explanations.
Be concise and to the point. Answer in English.
${recipe ? `The current recipe is: ${recipe}` : ''}`;
        } else {
            systemPrompt = `You are a friendly and helpful cooking assistant. 
Answer concisely and to the point in English.`;
        }

        const fullPrompt = `${systemPrompt}\n\nFrage: ${message}\n\nAntwort:`;

        const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: fullPrompt,
                model: "llama3.2",
                stream: false,
                temperature: 0.7,
                top_p: 0.9
            })
        });
        
        if (!ollamaResponse.ok) {
            throw new Error(`Ollama API            cd "/Users/juylla/hfg/IG3/PS3/Cookbuddy/Cookbuddy 2/02_backend"
            npm run dev error: ${ollamaResponse.status}`);
        }

        const ollamaJson = await ollamaResponse.json();
        console.log("Ollama response:", ollamaJson.response);
        res.json({ answer: ollamaJson.response });
    } catch (error) {
        console.error("Error with Ollama:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
