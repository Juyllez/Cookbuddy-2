<script>
  import { flow } from "../stores/flow.js";

  function goHome() {
    flow.update((f) => ({ ...f, screen: 3 }));
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
  </div>
</header>

<style>
  header {
    background: #c1eebb;
    color: black;
    padding: 10px 16px;
    border-bottom-left-radius: 40px;
    border-bottom-right-radius: 40px;
    margin-bottom: 16px;
    position: sticky;
    /* top: 0; */
    /* z-index: 100; */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  }

  .header-content {
    /* max-width: 1200px; */
    margin: 0 auto;
    /* font-size: 24px; */
    /* display: flex; */
    /* justify-content: flex-start; */
    align-items: center;
  }

  .title-section {
    cursor: pointer;
    user-select: none;
  }

  .title-section:hover {
    opacity: 0.8;
  }
</style>
