<script>

  import {
      getChainDataByChainId,
      signerAddress,
  } from 'svelte-ethers-store'

  import blockchain from '$lib/blockchain.js'

  const baseChainIds = JSON.parse(import.meta.env.VITE_MAINCHAIN_IDS)
  const baseTestnetChainIds = JSON.parse(import.meta.env.VITE_TESTCHAIN_IDS)
  const supportedChainIds = baseChainIds

</script>

{#if $signerAddress}
  <p class="title">
    No dice! This network's a mystery to us!
  </p>

  {#each supportedChainIds as id}
    <button
        class="button is-inverted mb-1 mr-3"
        on:click={() => blockchain.switchChain(id)}
    >Switch to {getChainDataByChainId(id).name}</button>
  {/each}

{:else}
  <p class="title">
    Fancy linking up with your wallet to start?
  </p>
{/if}
