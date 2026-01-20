<script>
	import { flow } from "../stores/flow.js";

	$: hasProfile = Boolean($flow.profile?.skillLevel);

	function start() {
		flow.update(f => ({ ...f, screen: hasProfile ? 2 : 1 }));
	}
</script>

<div class="start">

	<div class="tagline">
		<h1>COOKBUDDY</h1>
	</div>
		<h2>Waste less. Taste more.</h2>
		<!-- <p>Find the perfect meal for today.</p> -->

	<button class="start-btn" on:click={start}> Get started</button>
</div>

<style>
	.start {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 48px;
		padding: 24px 20px 100px;
		text-align: center;
	}

	.tagline {
		color: #111;
		font-size: 2rem;
		line-height: 1.2;
	}

	.start-btn {
		width: 140px;
		height: 50px;
		border-radius: 25px;
		border: none;
		background: #C1EEBB;
		color: #111;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		/* transition: transform 0.15s ease, box-shadow 0.15s ease; */
	}

	.start-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
	}
</style>
