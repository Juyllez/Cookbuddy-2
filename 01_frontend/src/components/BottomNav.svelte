<script>
  import { flow } from "../stores/flow.js";
</script>

<nav class="bottom-nav">
  <button
    class="nav-btn"
    class:active={$flow.screen === 3}
    on:click={() => flow.update((f) => ({ ...f, screen: 3 }))}
  >
    Home
  </button>

  <button
    class="nav-btn search-btn"
    class:active={$flow.screen === 4}
    on:click={() => flow.update((f) => ({ ...f, screen: 4 }))}
  >
    🔍
  </button>

  <button
    class="nav-btn"
    class:active={$flow.screen === 12}
    on:click={() => flow.update((f) => ({ ...f, screen: 12 }))}
  >
    Profil
  </button>
</nav>

<style>
  .bottom-nav {
    justify-content: space-around;
    align-items: center;
    background: #C1EEBB;
    border-top: none;
    padding: 12px 0 20px 0;
    gap: 10px;
    border-radius: 30px;
    margin: 0 10px 10px 10px;
    position: relative;
    display: flex;
  }

  .nav-btn {
    flex: 1;
    padding: 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    color: #666;
    /* transition: all 0.3s; */
    border-radius: 20px;
  }

  .nav-btn:hover {
    color: #999;
  }

  .search-btn {
    flex: 0;
    position: relative;
    bottom: 40px;
    background: #C1EEBB;
    color: white;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    padding: 5%;
  }

  .search-btn:hover {
    background: #C1EEBB;
    /* transform: translateY(-2px); */
  }

  .nav-btn.active {
    color: #fff;
  }
</style>
