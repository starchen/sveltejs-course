<script>
	import ContactCard from "./ContactCard.svelte";
	let name = 'Max';
	let age = 30;

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
<input type="text" value="{name}" on:input="{nameInputChanged}"/>
<input type="text" bind:value="{name}"/>

<ContactCard />