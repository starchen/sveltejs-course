<script>
    import { each, prevent_default } from 'svelte/internal'
    import MeetupGrid from './Meetups/MeetupGrid.svelte'
    import Header from './UI/Header.svelte'

    let title = '';
    let subtitle = '';
    let contact = '';
    let description = '';
    let address ='';

    let meetups = [
        {
            id:"m1",
            title:"The first meetup",
            subtitle: "Yeee",
            description:"First mmeetup desc",
            address: "130 avenue de la resistance. 93340. LE RAINCY",
            contact:"email@test.com"
        },
        {
            id:"m2",
            title:"The second meetup",
            subtitle: "Yeee 2",
            description:"Second mmeetup desc",
            address: "2 avenue de la resistance. 93340. LE RAINCY",
            contact:"email2@test.com"
        }
    ]

    function addMeetup() {
        const newMeetup = {
            id:Math.random().toString(),
            title:title,
            subtitle: subtitle,
            description: description,
            address: address,
            contact: contact
        }

        meetups = [...meetups, newMeetup]
    }
</script>

<style>
    main {
        margin-top: 5rem;
    }
</style>

<Header />

<main>
    <form on:submit|preventDefault="{addMeetup}">
        <div class="form-control">
            <label for="title">Title</label>
            <input type="text" id="title" bind:value="{title}"/>
        </div>
        <div class="form-control">
            <label for="subtitle">Subtitle</label>
            <input type="text" id="subtitle" bind:value="{subtitle}"/>
        </div>
        <div class="form-control">
            <label for="contact">Contact</label>
            <input type="text" id="contact" bind:value="{contact}"/>
        </div>
        <div class="form-control">
            <label for="address">Address</label>
            <input type="text" id="address" bind:value="{address}"/>
        </div>
        <div class="form-control">
            <label for="description">Description</label>
            <textarea rows=3 id="description" bind:value="{description}"></textarea>
        </div>
        <button type="submit">Add meetup</button>
    </form>
    <MeetupGrid {meetups} />
</main>

