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
  import Close from '$components/Close.svelte'
  import Timer from '$components/Timer.svelte'

  export let data
  $: ({ chain, address } = data)

  $: live = $roadmap[address] || {}

  $: supported = $signerAddress && blockchain.isSupported($chainId)

  let addActive = false
  let pledgeActive = 0
  let claimActive = 0
  let closeActive = 0

  const ended = {}

</script>

{#if $signerAddress && supported && address}

  <AddFeature bind:active={addActive} {address} />
  <Pledge bind:active={pledgeActive} {address} />
  <Claim bind:active={claimActive} {address} />
  <Close bind:active={closeActive} {address} />

  <div class="columns">
    <div class="column is-4">

      <Roadmap {address}   />

      {#if $signerAddress === live.creator}
        <button class="mt-4 button is-primary is-block is-alt is-large" on:click={() => {addActive = !addActive}}>Add feature</button>
      {/if}

      <aside class="menu mt-6 is-hidden">
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
                <div class="square-left mr-5" use:gradient data-hashed={feature.nr}>
                  <span class="number">#{feature.nr}2222</span>
                </div>
                <div class="media-content">
                  <div class="content">
                    <p>
                      {#if feature.claimedAt && false}
                        <span>{ended ? 'closeable since' : ''}</span>
                      {:else}
                        {feature.challenge}s challenge
                      {/if}

                      {#if feature.contestedPercent > 0.12}
                        <span class="tag is-danger">contested</span>
                      {:else if feature.claimedAt && feature.challengeUntil}
                        <span class="tag px-3" class:is-primary={ended[feature.nr]} class:is-warning={ended[feature.nr] === false}>
                          <span  class="pr-1" >{ended[feature.nr] ? 'closeable since' : 'claimed, challenge end in'}</span>
                          <Timer bind:ended={ended[feature.nr]} end={feature.challengeUntil * 1000} />
                        </span>
                      {:else if feature.claimedAt}
                        <span class="tag is-warning">claimed</span>
                      {:else}
                        <span class="tag is-success">open</span>
                      {/if}

                    </p>
                  </div>
                </div>
                <div class="media-right is-size-4" >
                  <span class="has-text-grey"
                  >{feature.pledges}{#if feature.challengingPledge > 0 }
                    <span class="has-text-red">/{feature.challengingPledge}</span>
                  {/if}
                  pledges <i class="fa fa-heart" /></span>
                </div>
              </div>
            </article>

            <nav class="level">
              <div class="level-right">
                {#if $signerAddress === live.creator}
                  <div class="level-item">
                    <button class="mt-4 button is-primary is-outlined is-block is-medium" on:click={() => {pledgeActive = feature.nr}}>
                     {#if feature.claimedAt}Challenge {/if}Pledge <span class="is-size-7">({fromWei(feature.amount)} eth/p)</span>
                    </button>
                  </div>
                  <div class="level-item">
                    <button disabled={ended[feature.nr]} class="mt-4 button is-primary is-outlined is-block is-medium" on:click={() => {claimActive = feature.nr}}>Claim</button>
                  </div>
                  <div class="level-item">
                    <button disabled={!ended[feature.nr]} class="mt-4 button is-primary is-outlined is-block is-medium" on:click={() => {closeActive = feature.nr}}>Close</button>
                  </div>
                {:else}
                  <div class="level-item">
                    <button class="mt-4 button is-primary is-outlined is-block is-medium" on:click={() => {pledgeActive = feature.nr}}>
                     {#if feature.claimedAt}Challenge {/if}Pledge <span class="is-size-7">({fromWei(feature.amount)} eth/p)</span>
                    </button>
                  </div>
                {/if}
              </div>
            </nav>

            <div class="mt-5 has-text-centered">
               x{feature.contestedPercent}x
              y{feature.challengingPledge}y
              {ended[feature.nr]}
              </div>


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

  .has-text-red {
    color: #f00;

  }


  .media {

    .square-left {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 48px;

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
