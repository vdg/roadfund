<script>
  import { onMount } from 'svelte'

  import {
    signerAddress,
    chainId,
  } from 'svelte-ethers-store'

  import { toWei } from '$lib/utils.js'
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
      params: [ address, active - 1, data.qty, { value: '10000000000000000000' } ],
      onReceipt: (rcpt) => {

        console.log('pledge done', rcpt)

        cancel()
      }

    }
  }

</script>


<Modal bind:this={modal} active={!!active} noCloseButton={true}>
  <div class="modal-card is-large" use:gradient data-gradient={active}>
    <section class="modal-card-body" >
      <h2 class="title">Pledge for feature {feature.name}</h2>

      <div class="column is-one-quarter">
        <div class="field">
          <label for="qty" class="label">How many tokens to you want to pledge (cost is 0.1 per token)</label>
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
        </div>
      </div>

    </section>
    <footer class="modal-card-foot">
      {#if Object.keys(control.error).length}<p class="help is-danger pr-3">
        Please fix errors above
      </p>{/if}

      <TxButton disabled={!$signerAddress} class="mt-4 button is-primary is-block is-alt" submitCtx={pledge}
      >Pledge</TxButton>
      <button class="button is-black" on:click={cancel}>Cancel</button>

    </footer>
  </div>
</Modal>



<style lang="scss">

  @import '../scss/_variables.scss';

  .modal-card-body, .modal-card-foot {
    background: transparent;
  }

</style>
