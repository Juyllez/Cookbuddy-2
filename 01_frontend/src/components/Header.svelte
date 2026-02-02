<script>
  import { flow } from "../stores/flow.js";
  import { Home, Search, User } from "lucide-svelte";

  function goHome() {
    flow.update((f) => ({ ...f, screen: 3 }));
  }

  function goNext() {
    const nextScreens = { 3: 4, 4: 5, 5: 6, 6: 11, 11: 12, 12: 3 };
    flow.update((f) => {
      const nextScreen = nextScreens[f.screen] || f.screen + 1;
      return { ...f, screen: nextScreen };
    });
  }

  function goProfile() {
    flow.update((f) => ({ ...f, screen: 12 }));
  }

  function goBack() {
    flow.update((f) => {
      const prevMap = {
        1: 0, // Profile setup -> Start
        2: 1, // Taste -> Profile setup
        5: 2, // (legacy) CookingTime -> Taste
        6: 2, // Pantry -> combined Taste+Time
        7: 6, // Results -> Pantry
        8: 7, // Recipe -> Results
        9: 2, // Profile overview -> Taste
      };
      const prev = prevMap[f.screen] ?? Math.max(0, f.screen - 1);
      return { ...f, screen: prev };
    });
  }
</script>

<header>
  <div class="header-content">
    <div class="title-section" on:click={goHome} role="button" tabindex="0">
      <h1>COOKBUDDY</h1>
      <h2>Waste less, cook more.</h2>
    </div>

    <nav class="header-nav" aria-label="Primary">
      <button class="nav-btn" on:click={goHome} aria-label="Home">
        <Home size={32} />
      </button>
      <button class="nav-btn" on:click={goNext} aria-label="Next">
        <Search size={32} />
      </button>
      <button class="nav-btn" on:click={goProfile} aria-label="Profile">
        <User size={32} />
      </button>
    </nav>
  </div>
</header>

<style>
  header {
    background: #c1eebb;
    color: black;
    padding: 20px 26px;
    border-bottom-right-radius: 60px;
    margin-bottom: 16px;
    position: sticky;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    top: 0;
    z-index: 100; /* Ensure header is above other content */
  }

  .header-content {
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .title-section {
    cursor: pointer;
    user-select: none;
  }

  .title-section:hover {
    opacity: 0.8;
  }

  .header-nav {
    display: none;
    align-items: center;
    gap: 12px;
  }

  .nav-btn {
    padding: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #044000;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease, color 0.2s ease;
    width: 40px;
    height: 40px;
  }

  .nav-btn:hover {
    background: #7ec87e;
    color: #022000;
  }

  @media (min-width: 900px) {
    .header-nav {
      display: flex;
    }
  }
</style>
