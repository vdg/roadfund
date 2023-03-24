<script>
  import { goto } from '$app/navigation'

  import {
    chainId
  } from 'svelte-ethers-store'

  import { Identicon } from 'svelte-ethers-store/components'

  import { formatAddress } from '$lib/utils.js'

  import Roadmap from '$components/Roadmap.svelte'

  export let title

  export let addresses = []

  const open = a => {
    goto(`/${$chainId}:${a}/`)
  }

</script>

<section class="hero is-primary mb-6">
  <div class="hero-body has-text-centered">
    <p class="title">
      {title}
    </p>

    {#if addresses.length}

      <div class="columns is-multiline">
        {#each addresses as address}
          <div class="column is-one-third">
            <Roadmap {address} on:click={() => open(address)}  />
          </div>
        {/each}
      </div>
    {:else}

      <p class="subtitle mt-4">
        well, nothing yet!
      </p>

    {/if}

    <slot />

  </div>
</section>


<style lang="scss">
  @import '../scss/_variables.scss';

  .column {

    &:hover {
      background-color: #eee;
      cursor: pointer;
      transform: scale(1.01);
    }

  }

</style>
