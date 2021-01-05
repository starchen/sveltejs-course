<script>
    export let meetup;

    const {id, title, subtitle, description, contact} = meetup
</script>

<style>
    article {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
        border-radius: 5px;
        background: white;
        margin: 1rem;
    }

    header, .content, footer {
        padding: 1rem;
    }

    p {
        font-size: 1.25rem;
        margin: 0;
    }

    div {
        text-align:  right;
    }
</style>

<article>
    <header>
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
    </header>
    <div class="content">
        <p>Welcome to the {title}: {description}</p>
    </div>
    <footer>
        <a href="mailto:{contact}">Mail</a>
        <button>Show details</button>
        <button>Favorite</button>
    </footer>
</article>