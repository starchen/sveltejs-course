<script>
	import ContactCard from "./ContactCard.svelte";
	let name = 'Lon';
	let age = 36;
	let imageSrc = "";
	let jobTitle = "";
	let shortDesc= "";

	function incrementAge() {
		age += 1;
	}

	$: doubleAge = age * 2;
	$: console.log(age);
	$: if(age > 50) {
		age = 20;
	}

	function nameInputChanged(event) {
		name = event.target.value;
	}
</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>Hello {name}, my age is {age}, my double age is {doubleAge}!</h1>
<button on:click="{incrementAge}">Change Age</button>
<label for="name">Name</label>
<input id="name" type="text" value="{name}" on:input="{nameInputChanged}"/>
<label for="2-way-binding-name">Two-way binding Name</label>
<input id="2-way-binding-name" type="text" bind:value="{name}"/>
<label for="jobTitle">Job Title</label>
<input id="jobTitle" type="text" bind:value="{jobTitle}"/>
<label for="shortDesc">Short Description</label>
<textarea id="shortDesc" bind:value="{shortDesc}" rows=3></textarea>
<label for="imageSource">Image Source Url</label>
<input id="imageSource" type="url" bind:value="{imageSrc}"/>

<ContactCard userName="{name}" imageSrc="{imageSrc}" jobTitle="{jobTitle}" shortDesc="{shortDesc}"/>