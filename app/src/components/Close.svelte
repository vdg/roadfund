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

  import TxAction from '$components/TxAction/index.svelte'
  import TxActionButton from '$components/TxAction/TxActionButton.svelte'
  import TxActionFeedback from '$components/TxAction/TxActionFeedback.svelte'


  export let active // contain feature number
  export let address

  let modal
  let action

  $: live = $roadmap[address] || {}
  $: feature = live.features ? live.features[active - 1] || {} : {}

  const control = {
    isWaiting: false,
    isLoading: false,
    error: {}
  }

  const cancel = async () => {
    active = 0
    if (modal) modal.close()
  }

  export const close = () => {

    const roadfund = blockchain.roadfund($chainId)

    return {
      call: roadfund.close,
      params: [ address, active - 1 ],
      onReceipt: (rcpt) => {

        console.log('close done', rcpt)
        roadmap.refresh(address)

        cancel()
      }

    }
  }

</script>


<Modal bind:this={modal} active={!!active} noCloseButton={true}>
  <div class="modal-card is-large" use:gradient data-hashed={active}>
    <section class="modal-card-body" >
      <h2 class="title">{feature.name}</h2>

      <h3 class="subtitle mt-5">Close this feature and get the funds pledged!</h3>

    </section>

    <footer class="modal-card-foot">
      <TxAction
        bind:this={action} let:callId
        submitCtx={close}
      >
        <div class="is-centered">
          {#if Object.keys(control.error).length}<p class="help is-danger pr-3">
          Please fix errors above
          </p>{/if}
          <TxActionFeedback />
        </div>
        <div class="buttons has-addons is-centered ml-5">
          <TxActionButton class="button is-primary"
          >Close</TxActionButton>

          <button class="button is-primary is-inverted ml-5" on:click={cancel}>Cancel</button>
      </TxAction>
   </footer>

  </div>
</Modal>


<style lang="scss">

  @import '../scss/_variables.scss';

  .modal-card-body, .modal-card-foot {
    background: transparent;
  }

</style>
