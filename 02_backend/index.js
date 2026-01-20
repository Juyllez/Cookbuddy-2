require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Welcome to the Recipe Master Backend!");
});

app.get("/status", (req, res) => {
    res.json({ status: "Recipe Master Backend is running!" });
});

app.get("/recipes/recommended", async (req, res) => {
    console.log("Received recommended recipes request", req.query);
    try {
        const { dietType = "omnivore" } = req.query;

        // Build base URL for popular recipes
        let apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=&number=20&sort=popularity&addRecipeInformation=true`;

        // Map diet preferences
        if (dietType === "vegetarian") apiUrl += "&diet=vegetarian";
        if (dietType === "vegan") apiUrl += "&diet=vegan";
        if (dietType === "pescatarian") apiUrl += "&diet=pescatarian";

        apiUrl += `&apiKey=${process.env.SPOONACULAR_API_KEY}`;

        console.log("Recommended API URL:", apiUrl.replace(process.env.SPOONACULAR_API_KEY, "***"));
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === "failure" || data.code === 401) {
            console.error("API Error:", data.message);
            return res.json({ recipes: [] });
        }

        let results = data.results || [];

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
            cookingTime = "30"
        } = req.query;
        
        console.log("Parameters:", { dietType, taste, difficulty, cookingTime, pantry });
        
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

        const pantryArray = pantry ? pantry.split(",").map(i => i.trim().toLowerCase()) : [];
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
            const matchScore = pantryArray.length ? Math.round((matchCount / pantryArray.length) * 100) : 0;
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
                // Sort by match count first (higher is better) - recipes with pantry matches go to top
                if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
                // Then by cooking time (shorter is better)
                return (a.recipeTime || 999) - (b.recipeTime || 999);
            })
            .slice(0, 10);
        
        const withMatchesCount = topRecipes.filter(r => r.matchCount > 0).length;
        console.log(`After filtering: ${topRecipes.length} recipes total${pantryArray.length ? ` (${withMatchesCount} with pantry matches)` : ''}`);

        // Transform to frontend format
        const recipes = await Promise.all(topRecipes.map(async (r) => {
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

app.post("/chat", async (req, res) => {
    console.log("Received chat request:", req.body);
    const { message, context = "general", recipe = "" } = req.body;

    try {
        // Unterschiedliche Prompts je nach Kontext
        let systemPrompt = "";
        
        if (context === "ingredient") {
            // Kontext: Fragen zu Zutatenersetzen
            systemPrompt = `Du bist ein freundlicher und hilfreicher Kochassistent.
Der Benutzer hat ein Rezept ausgewählt und fragt nach Alternativen zu bestimmten Zutaten oder anderen Kochfragen.
Gib kurze, praktische Vorschläge (2-3 Alternativen) mit kurzer Erklärung.
Sei kurz und prägnant. Antworte auf Deutsch.
${recipe ? `Das aktuelle Rezept ist: ${recipe}` : ''}`;
        } else {
            systemPrompt = `Du bist ein freundlicher und hilfreicher Kochassistent. 
Antworte kurz und prägnant auf Deutsch.`;
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
            throw new Error(`Ollama API error: ${ollamaResponse.status}`);
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
