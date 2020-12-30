<script>
  import ContactCard from "./ContactCard.svelte";

  let name = "Max";
  let title = "";
  let image = "";
  let description = "";

  let formStatus = 'empty';
  let createdContacts = [];
  function addContact() {
	  if(name.trim().length == 0 
	  || title.trim().length == 0
	  || image.trim().length == 0
	  || description.trim().length ==0) {
		  formStatus = 'invalid';
		  return;
	  }
	  createdContacts=  [...createdContacts, {
		  name: name,
		  title: title,
		  image: image,
		  description: description
	  }];
	  formStatus = 'done';
  }
</script>

<style>
  #form {
    width: 30rem;
    max-width: 100%;
  }
</style>

<div id="form">
  <div class="form-control">
    <label for="userName">UserName</label>
    <input type="text" bind:value={name} id="userName" />
  </div>
  <div class="form-control">
    <label for="jobTitle">Job Title</label>
    <input type="text" bind:value={title} id="jobTitle" />
  </div>
  <div class="form-control">
    <label for="image">Image URL</label>
    <input type="text" bind:value={image} id="image" />
  </div>
  <div class="form-control">
    <label for="desc">Description</label>
    <textarea rows="3" bind:value={description} id="desc" />
  </div>
</div>
<button on:click="{addContact}">Add contact card</button>

{#if formStatus === 'invalid'}
<p>Invalid form</p>
{:else}
<p>No contact card yet</p>
{/if}

{#each createdContacts as card, i }
<h2>{i + 1}</h2>
<ContactCard userName={card.name} jobTitle={card.title} description={card.description} userImage={card.image} />
{:else}
<p>No contact card</p>
{/each }