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
  import TxAction from '$components/TxAction/index.svelte'
  import TxActionButton from '$components/TxAction/TxActionButton.svelte'
  import TxActionFeedback from '$components/TxAction/TxActionFeedback.svelte'

  export let active // contain feature number
  export let address

  let modal
  let action

  $: live = $roadmap[address] || {}
  $: feature = live.features ? live.features[active - 1] || {} : {}

  let data = {
    qty: 1
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

  export const pledge = () => {
    control.error = {}

    if (!data.qty) {
      control.error.qty = 'This field is required'
    }

    if (Object.keys(control.error).length) return false

    const roadfund = blockchain.roadfund($chainId)

    return {
      call: roadfund.pledge,
      params: [ address, active - 1, data.qty, { value: BigNumber.from(feature.amount).mul(data.qty) } ],
      onReceipt: (rcpt) => {
        console.log('pledge done', rcpt)
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
      <h3 class="subtitle">How many tokens to you want to pledge?</h3>

      <div class="column is-full">
        <div class="field">
          <p class="control">
            <input
              id="qty"
              class="input"
              class:is-danger={control.error.qty}
              type="number"
              bind:value={data.qty} />
          </p>
          {#if control.error.qty}<p class="help is-danger">
            {control.error.qty}
          </p>{/if}
          <label for="qty" class="label mt-3">{fromWei(feature.amount)} e / token</label>
          <h3 class="subtitle"><em>Price to pay : { fromWei(BigNumber.from(feature.amount).mul(data.qty)) } e</em></h3>
        </div>
      </div>

    </section>
    <footer class="modal-card-foot">
      <TxAction
        bind:this={action} let:callId
        submitCtx={pledge}
      >
        <div class="is-centered">
          {#if Object.keys(control.error).length}<p class="help is-danger pr-3">
          Please fix errors above
          </p>{/if}
          <TxActionFeedback />
        </div>
        <div class="buttons has-addons is-centered ml-5">
          <TxActionButton class="button is-primary"
          >Pledge</TxActionButton>

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
