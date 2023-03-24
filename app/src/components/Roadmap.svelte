<script>

  import { Identicon } from 'svelte-ethers-store/components'

  import { formatAddress } from '$lib/utils.js'

  export let address

</script>

<div class="box">
  <div class="card" on:click>
    <div class="card-image">
      <figure class="image is-4by3">
        <img src="https://unsplash.it/1200/960" alt="Placeholder image">
      </figure>
    </div>
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <figure class="image is-48x48">
            <Identicon {address} />
          </figure>
        </div>
        <div class="media-content">
          {formatAddress( address )}
        </div>
      </div>
      <div class="content">
        Lorem ipsum dolor
        Phasellus nec iaculis mauris. <a>@bulmaio</a>.
        <a href="#">#css</a> <a href="#">#responsive</a>
        <br>
        <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
      </div>
    </div>
  </div>
</div>
