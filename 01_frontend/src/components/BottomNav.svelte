<script>
  import { flow } from "../stores/flow.js";
  import { Home, Search, User } from 'lucide-svelte';
</script>

<nav class="bottom-nav">
  <button
    class="nav-btn"
    class:active={$flow.screen === 3}
    on:click={() => flow.update((f) => ({ ...f, screen: 3 }))}
  >
    <Home size={24} />
  </button>

  <button
    class="nav-btn search-btn"
    on:click={() => {
      // Next button - go to next screen based on current screen
      const nextScreens = { 3: 4, 4: 5, 5: 6, 6: 11, 11: 12, 12: 3 };
      const nextScreen = nextScreens[$flow.screen] || $flow.screen + 1;
      flow.update((f) => ({ ...f, screen: nextScreen }));
    }}
  >
    <Search size={24} />
  </button>

  <button
    class="nav-btn"
    class:active={$flow.screen === 12}
    on:click={() => flow.update((f) => ({ ...f, screen: 12 }))}
  >
    <User size={24} />
  </button>
</nav>

<style>
  .bottom-nav {
    justify-content: space-around;
    align-items: center;
    background: #C1EEBB;
    border-top: none;
    padding: 12px 0 20px 0;
    border-radius: 50px;
    margin: 0 10px 10px 10px;
    position: relative;
    display: flex;
  }

  .nav-btn {
    padding: 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #888888;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search-btn {
    flex: 0 0 auto;
    position: relative;
    bottom: 30px;
    background: #C1EEBB;
    color: #888888;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    min-width: 80px;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .search-btn:hover {
    background: #C1EEBB;
  }

  .nav-btn.active {
    color: #044000;
  }

  /* Mobile-first: hide bottom nav once we hit desktop widths */
  @media (min-width: 900px) {
    .bottom-nav {
      display: none;
    }
  }
</style>
