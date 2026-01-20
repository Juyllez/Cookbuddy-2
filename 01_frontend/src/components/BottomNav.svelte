<script>
  import { flow } from "../stores/flow.js";
  import { onMount } from "svelte";
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
    class:active={$flow.screen === 4}
    on:click={() => flow.update((f) => ({ ...f, screen: 4 }))}
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
    /* gap: 10px; */
    border-radius: 50px;
    margin: 0 10px 10px 10px;
    position: relative;
    display: flex;
  }

  .nav-btn {
    /* flex: 1; */
    padding: 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    /* font-size: 14px; */
    color: #888888;
    /* transition: all 0.3s; */
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* .nav-btn:hover {
    color: #999;
  } */

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
    /* transform: translateY(-2px); */
  }

  .nav-btn.active {
    color: #044000;
  }
</style>
