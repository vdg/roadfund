<script>
  import { onMount } from 'svelte'

  import { constants, utils, BigNumber } from 'ethers'

  import {
    signerAddress,
    chainId,
  } from 'svelte-ethers-store'

  import { toWei, fromWei } from '$lib/utils.js'
  import blockchain from '$lib/blockchain.js'

  import { gradient } from '$lib/actions/gradient.js'

  import roadmap from '$stores/roadmap.js'

  import Modal from '$components/Modal.svelte'
  import TxButton from '$components/TxAction/Button.svelte'

  export let active // contain feature number
  export let address

  let modal

  $: live = $roadmap[address] || {}
  $: feature = live.features ? live.features[active - 1] || {} : {}

  let data = {

  }

  const control = {
    isWaiting: false,
    isLoading: false,
    error: {}
  }

  const cancel = async () => {
    active = 0
    if (modal) modal.close()
  }

  export const claim = () => {
    control.error = {}


    const roadfund = blockchain.roadfund($chainId)

    return {
      call: roadfund.claim,
      params: [ address, active - 1 ],
      onReceipt: (rcpt) => {

        console.log('claim done', rcpt)
        roadmap.refresh(address)

        cancel()
      }

    }
  }

</script>


<Modal bind:this={modal} active={!!active} noCloseButton={true}>
  <div class="modal-card is-large" use:gradient data-gradient={active}>
    <section class="modal-card-body" >
      <h2 class="title">{feature.name}</h2>
      <h3 class="subtitle">Friendly warning: Make sure you're in sync with pledgers before claiming, or you might watch your funds slip away!</h3>

    </section>
    <footer class="modal-card-foot">
      {#if Object.keys(control.error).length}<p class="help is-danger pr-3">
        Please fix errors above
      </p>{/if}

      <TxButton disabled={!$signerAddress} class="mt-4 button is-primary is-block is-alt" submitCtx={claim}
      >Claim</TxButton>
      <button class="button is-primary is-inverted" on:click={cancel}>Cancel</button>

    </footer>
  </div>
</Modal>


<style lang="scss">

  @import '../scss/_variables.scss';

  .modal-card-body, .modal-card-foot {
    background: transparent;
  }

</style>
