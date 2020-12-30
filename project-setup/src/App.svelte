<script>
	let name = 'Lon';
	let age = 36;

	function incrementAge() {
		age++
		if(age > 50) {
			age = 20
		}
	}
</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>Hello {name}, my age is {age}!</h1>
<button on:click="{incrementAge}">Click on me</button>
