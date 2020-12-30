<script>
    export let userName;
    export let imageSrc;
    export let jobTitle;
    export let shortDesc;
</script>
<style>
	h1 {
		color: blue;
	}

    .thumb {
        height: 10rem;
        width: 25rem;
        overflow:hidden;
        box-sizing: border-box;
    }

    .thumb-placeholder {
        background-color: aquamarine;
    }
</style>

<div>
    <header>
        <div class="thumb" class:thumb-placeholder="{!imageSrc}">
        <img src="{imageSrc}" alt=""/>
        </div>
        <div>
            <h1>{userName}</h1>
            <h2>{jobTitle}</h2>
        </div>
    </header>
    <div>
        <p>{shortDesc}</p>
    </div>
</div>