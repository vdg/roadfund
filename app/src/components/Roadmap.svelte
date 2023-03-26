<script>

  import { Identicon } from 'svelte-ethers-store/components'

  import { formatAddress } from '$lib/utils.js'

  import roadmap from '$stores/roadmap.js'

  export let address

  $: live = $roadmap[address] || {}

</script>

<div class="box">
  <div class="card" on:click>
    <div class="card-image">
      <figure class="image is-fullwidth is-4by3">
        <img src={live.image} alt={live.name}>
      </figure>
    </div>
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <figure class="image is-48x48">
            <Identicon {address} />
          </figure>
        </div>
        <div class="media-content is-clipped">
          <a>{formatAddress( address )}</a>
          {#if live.repository}
          <a target="_blank" href={live.repository}><em>{live.repository}</em></a>
          {/if}
        </div>
      </div>
      <div class="content">
        <h3><a target="_blank" href={live.home}>{live.name}</a></h3>

        {live.description}
        <br>
        <a>by {formatAddress(live.creator)}</a>.
        <br>
        <time datetime="2016-1-1" class="is-hidden">11:09 PM - 1 Jan 2016</time>
      </div>
    </div>
  </div>
</div>
