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
</style>

<div>
    <header>
        <img src="{imageSrc}" alt=""/>
        <div>
            <h1>{userName}</h1>
            <h2>{jobTitle}</h2>
        </div>
    </header>
    <div>
        <p>{shortDesc}</p>
    </div>
</div>