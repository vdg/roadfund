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
  import { fromWei } from '$lib/utils.js'

  import { gradient } from '$lib/actions/gradient.js'

  import roadmap from '$stores/roadmap.js'

  import Unsupported from '$components/Unsupported.svelte'
  import Roadmap from '$components/Roadmap.svelte'
  import AddFeature from '$components/AddFeature.svelte'
  import Pledge from '$components/Pledge.svelte'
  import Claim from '$components/Claim.svelte'

  export let data
  $: ({ chain, address } = data)

  $: live = $roadmap[address] || {}

  $: supported = $signerAddress && blockchain.isSupported($chainId)

  let addActive = false
  let pledgeActive = 0
  let claimActive = 0

</script>

{#if $signerAddress && supported && address}

  <AddFeature bind:active={addActive} {address} />
  <Pledge bind:active={pledgeActive} {address} />
  <Claim bind:active={claimActive} {address} />

  <div class="columns">
    <div class="column is-4">

      <Roadmap {address}   />

      <button class="mt-4 button is-primary is-block is-alt is-large" on:click={() => {addActive = !addActive}}>Add feature</button>

      <aside class="menu mt-6">
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

    <div class="column is-8">

      {#if live.features && live.features.length}
        {#each live.features as feature}

          <div class="box content mb-3">
            <article class="post ">
              <h4>{feature.name}</h4>
              <div class="media">
                <div class="square-left mr-5" use:gradient data-gradient={feature.nr}>
                  <span class="number">{feature.nr}</span>
                </div>
                <div class="media-content">
                  <div class="content">
                    <p>
                      {fromWei(feature.amount)} eth per pledge
                      <span class="tag">feature</span>
                    </p>
                  </div>
                </div>
                <div class="media-right is-size-3" >
                  <span class="has-text-grey"
                  >{feature.pledges} pledges <i class="fa fa-area-chart ml-3" /></span>
                </div>
              </div>

              <nav class="level">
                <div class="level-right">
                  <div class="level-item">
                    <button class="mt-4 button is-primary is-outlined is-block is-medium" on:click={() => {pledgeActive = feature.nr}}>Pledge</button>
                  </div>
                  <div class="level-item">
                    <button class="mt-4 button is-primary is-outlined is-block is-medium" on:click={() => {claimActive = feature.nr}}>Claim</button>
                  </div>
                </div>
              </nav>


            </article>
          </div>

        {/each}
      {/if}


    </div>
  </div>


{:else}

  <section class="hero is-medium is-primary">
    <div class="hero-body has-text-centered">

      <Unsupported />

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
