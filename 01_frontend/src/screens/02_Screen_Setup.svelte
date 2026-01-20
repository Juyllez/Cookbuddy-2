<script>
    import { flow } from "../stores/flow.js";
</script>

<div class="container">
    <div class="content">
        <!-- <div class="icon">✓</div> -->
        <h1>Your profile is now complete.</h1>
        <p>You can change your prefrences on your Profile page anytime.</p>
        <br/>
        <button
            class="btn-primary"
            on:click={() => flow.update((f) => ({ ...f, screen: 3 }))}
        >
            Browse Recipes
        </button>
    </div>
</div>

<style>
    .container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 20px;
    }

    .content {
        text-align: center;
        max-width: 400px;
    }

    h1 {
        font-size: 28px;
        margin-bottom: 10px;
        color: #333;
    }

    p {
        color: #666;
        margin-bottom: 30px;
        font-size: 16px;
    }

    .btn-primary {
        background: #C1EEBB;
        color: black;
        border: none;
        padding: 12px 40px;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        transition: background 0.3s;
    }

    .btn-primary:hover {
        background: #A9D6A9;
    }

    /* @keyframes pop {
        0% {
            transform: scale(0);
        }
        100% {
            transform: scale(1);
        }
    } */
</style>
