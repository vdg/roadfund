<script>
  import { ethers } from 'ethers'

  import {
    signerAddress,
    provider,
    chainId,
    chainData
  } from 'svelte-ethers-store'

  import { abiEncodeAuth } from "@rougenetwork/v2-core/rouge"

  import Factory from "@rougenetwork/v2-core/Factory.json";
  import Rouge from "@rougenetwork/v2-core/Rouge.json";

  import blockchain from '$lib/blockchain.js'

  import { gradient } from '$lib/actions/gradient.js'

  import AddFeature from '$components/AddFeature.svelte'

  import roadmap from '$stores/roadmap.js'

  export let data
  $: ({ chain, address } = data)

  $: live = $roadmap[address] || {}

  $: supported = $signerAddress && blockchain.isSupported($chainId)

  let addActive = false

  let voteActive = 0

</script>

{#if $signerAddress && supported && address}

  <AddFeature bind:active={addActive} {address} />

  <div class="columns">
    <div class="column is-3">

      <div class="card" on:click={() => open(address)}>
        <div class="card-image">
          <figure class="image is-4by3">
            <img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image">
          </figure>
        </div>
        <div class="card-content">
          <div class="media">
            <div class="media-left">
              <figure class="image is-48x48">
                <img src="https://bulma.io/images/placeholders/96x96.png" alt="Placeholder image">
              </figure>
            </div>
            <div class="media-content">
              <p class="title is-4">John Smith</p>
              <p class="subtitle is-6">@johnsmith</p>
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

      <button class="mt-4 button is-primary is-block is-alt is-large" on:click={() => {addActive = !addActive}}>Add feature</button>

      <aside class="menu">
        <p class="menu-label">Tags</p>
        <ul class="menu-list">
          <li><span class="tag is-primary is-medium ">Dashboard</span></li>
          <li><span class="tag is-link is-medium ">Customers</span></li>
          <li>
            <span class="tag is-light is-danger is-medium ">Authentication</span>
          </li>
          <li><span class="tag is-dark is-medium ">Payments</span></li>
          <li><span class="tag is-success is-medium ">Transfers</span></li>
          <li><span class="tag is-warning is-medium ">Balance</span></li>
          <li><span class="tag is-medium ">Question</span></li>
        </ul>
      </aside>
    </div>
    <div class="column is-9">
      <div class="box content">

        {#if live.features && live.features.length}
          {#each live.features as feature}

        <article class="post mt-3">
          <h4>{feature.name}</h4>
          <div class="media">
            <div class="square-left mr-5" use:gradient data-gradient={feature.nr}>
              <span class="number">{feature.nr}</span>
            </div>
            <div class="media-content">
              <div class="content">
                <p>
                  0.01 eth per pledge
                  <span class="tag">feature</span>
                </p>
              </div>
            </div>
            <div class="media-right is-size-3" >
              <span class="has-text-grey"
              ><i class="fa fa-area-chart mr-3" />{feature.pledges}</span>
            </div>
          </div>

          <button class="mt-4 button is-primary is-outlined is-block is-small" on:click={() => {pledgeActive = !pledgeActive}}>Pledge for that feature</button>
          <button class="mt-4 button is-primary is-outlined is-block is-small" on:click={() => {pledgeActive = !pledgeActive}}>Pledge for that feature</button>

        </article>

        {/each}
        {/if}


      </div>
    </div>
  </div>


{:else}

  <section class="hero is-medium is-primary">
    <div class="hero-body has-text-centered">

      {#if $signerAddress}
        <p class="title">
          Sorry, non supported network
        </p>
      {:else}
        <p class="title">
          Please connect to your wallet
        </p>
      {/if}

    </div>
  </section>

{/if}



<style lang="scss">

  @import '../../scss/_variables.scss';


  .media {

    .square-left {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 48px;
      height: 100%;

      .number {
        display: block;
        font-size: 24px;
        margin: 0;
        background: transparent;
        color: #fff;
        text-shadow: 3px 3px 3px rgba(0, 0, 0, 0.5);
      }

    }

  }


</style>
