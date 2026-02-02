#CookBuddy – Waste less. Taste more.
1. Kurzbeschreibung
CookBuddy ist eine intelligente Rezept-App, die ich entwickelt habe, um Lebensmittelverschwendung im Alltag aktiv zu reduzieren. Meine App hilft Nutzern dabei, aus den Zutaten, die sie bereits zu Hause haben, kreative Gerichte zu kochen.

Warum das sinnvoll ist: Viele Lebensmittel landen im Müll, weil die Inspiration fehlt, wie man unvollständige Vorräte kombinieren kann. CookBuddy schließt diese Lücke.

Mein Fokus: Ich habe den Schwerpunkt auf eine intuitive User Experience (UX) und die nahtlose KI-Integration gelegt. Bei der Priorisierung der Features war mir wichtig, dass Nutzer nicht nur Rezepte finden, sondern durch einen integrierten Assistenten auch direkt beim Kochen unterstützt werden (z. B. bei der Frage nach Ersatzbeutaten).

2. Installationsanleitung
Das Projekt habe ich mit SvelteKit umgesetzt.

Voraussetzungen
Node.js (v18+)

Ein laufender Ollama-Server (für den lokalen KI-Assistenten)

Setup
Repository klonen und Abhängigkeiten installieren:

Bash
npm install
Umgebungsvariablen: Erstelle eine .env Datei im Root-Verzeichnis:

Code-Snippet
# API-Key für die Rezept-Datenbank (z.B. Spoonacular)
RECIPE_API_KEY=in google drive
# URL zum lokalen Ollama Server (Standard: Port 11434)
OLLAMA_URL=http://localhost:11434
KI-Modell vorbereiten: Ich nutze Ollama lokal. Stelle sicher, dass das gewünschte Modell (z.B. mistral oder llama3) installiert ist:

Bash
ollama run mistral
Anwendung starten:

Bash
npm run dev
3. Feature-Umfang & Technische Komplexität
Bei der Entwicklung habe ich mich bewusst an komplexe Aufgaben herangewagt, um eine wirklich smarte Anwendung zu schaffen:

Dynamischer Matching-Algorithmus: Anstatt einer simplen Suche habe ich eine Logik implementiert, die eine prozentuale Übereinstimmung berechnet. Dabei werden die vorhandenen Vorräte mit den Rezeptanforderungen abgeglichen und gleichzeitig globale Nutzerpräferenzen (Allergien, Diäten) in Echtzeit beachtet.

Kontextsensitiver KI-Chat: Ein Kernstück ist die Einbindung von Ollama. Die Schwierigkeit hierbei war, der KI nicht nur eine Frage zu senden, sondern den gesamten Kontext des aktuellen Rezepts als "System Prompt" mitzugeben. Dadurch weiß der Chatbot genau, welche Zutaten im Rezept stehen, wenn der Nutzer fragt: "Was kann ich statt der Maisstärke nehmen?"

Globales State-Management mit Svelte Stores: Ich habe ein reaktives System aufgebaut, bei dem Änderungen im Profil (z. B. das Entfernen einer Laktose-Intoleranz) sofort alle anderen Komponenten der App triggern und die Rezeptvorschläge ohne Page-Reload aktualisieren.

4. Findings & Prozessverlauf
Herausforderung Datenkonsistenz: Die größte Hürde war die Synchronisation meiner "Pantry-Liste" mit den Suchfiltern. Ich habe mich hier für den anspruchsvolleren Weg über zentrale Svelte-Stores entschieden, um eine saubere Datenhaltung (Single Source of Truth) zu garantieren.

Gescheiterte Vorhaben / Pivots: Ursprünglich wollte ich eine Bilderkennung für den Kühlschrank per Kamera einbauen. In meinen Tests war die Latenz bei lokalen LLMs jedoch zu hoch für eine gute User Experience. Deshalb habe ich mich umentschieden und den Fokus stattdessen auf das KI-gestützte Substitutions-System innerhalb der Rezepte gelegt, da dies dem Nutzer einen echten Mehrwert bietet, ohne ihn warten zu lassen.