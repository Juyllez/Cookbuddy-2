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
    <Home size={32} />
  </button>

  <button
    class="nav-btn search-btn"
    on:click={() => {
      flow.update((f) => ({ ...f, screen: 4 }));
    }}
  >
    <Search size={32} />
  </button>

  <button
    class="nav-btn"
    class:active={$flow.screen === 12}
    on:click={() => flow.update((f) => ({ ...f, screen: 12 }))}
  >
    <User size={32} />
  </button>
</nav>

<style>
  .bottom-nav {
    justify-content: space-around;
    align-items: center;
    background: #C1EEBB;
    border-top: 1px solid #b5e5a8;
    padding: 12px 0 20px 0;
    border-radius: 0;
    margin: 0;
    position: relative;
    display: flex;
    width: 100%;
    flex-shrink: 0;
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
    transition: color 0.2s ease;
  }

  .nav-btn:hover {
    color: #7ec87e;
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
    transition: transform 0.2s ease;
  }

  .search-btn:hover {
    background: #b5e5a8;
    transform: scale(1.05);
  }

  .nav-btn.active {
    color: #044000;
  }

  /* Desktop: hide bottom nav */
  @media (min-width: 900px) {
    .bottom-nav {
      display: none;
    }
  }
</style>
