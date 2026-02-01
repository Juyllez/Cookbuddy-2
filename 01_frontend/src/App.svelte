<script>
  import Header from "./components/Header.svelte";
  import BottomNav from "./components/BottomNav.svelte";
  import { flow } from "./stores/flow.js";
  // import { onMount } from "svelte";

  // Screen initialization is handled in flow.js store

  import Screen0 from "./screens/00_Screen_ProfileSetup.svelte";
  import Screen1 from "./screens/01_Screen_ProfileSetup.svelte";
  import Screen2 from "./screens/02_Screen_Setup.svelte";
  import Screen3 from "./screens/03_Screen_Home.svelte";
  import Screen4 from "./screens/04_Screen_Taste.svelte";
  import Screen5 from "./screens/05_Screen_Pantry.svelte";
  import Screen6 from "./screens/06_Screen_Recipe.svelte";

  import Screen11 from "./screens/11_Screen_Results.svelte";
  import Screen12 from "./screens/12_Screen_Profile.svelte";

  $: showNavigation = $flow.screen >= 1;
  $: showBottomNav = $flow.screen >= 3;
</script>

<div id="wrapper">
  {#if showNavigation}
    <Header />
  {/if}

  <main>
    {#if $flow.screen === 0}
      <Screen0 />
    {:else if $flow.screen === 1}
      <Screen1 />
    {:else if $flow.screen === 2}
      <Screen2 />
    {:else if $flow.screen === 3}
      <Screen3 />
    {:else if $flow.screen === 4}
      <Screen4 />
    {:else if $flow.screen === 5}
      <Screen5 />
    {:else if $flow.screen === 6}
      <Screen6 />
    {:else if $flow.screen === 11}
      <Screen11 />
    {:else if $flow.screen === 12}
      <Screen12 />
    {:else}
      <p>Unknown screen: {$flow.screen}</p>
    {/if}
  </main>

  {#if showBottomNav}
    <BottomNav />
  {/if}
</div>

<style>
  #wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 1200px;
    margin: 0 auto;
  }

  main {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }
</style>
