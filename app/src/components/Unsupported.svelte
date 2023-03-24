<script>

  import {
      getChainDataByChainId,
      signerAddress,
  } from 'svelte-ethers-store'

</script>

{#if $signerAddress}
  <p class="title">
    No dice! This network's a mystery to us!
  </p>
{:else}
  <p class="title">
    Fancy linking up with your wallet to start?
  </p>
{/if}
