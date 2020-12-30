<script>
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
</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>Hello {name}, my age is {age}, my double age is {doubleAge}!</h1>
<button on:click="{incrementAge}">Change Age</button>
