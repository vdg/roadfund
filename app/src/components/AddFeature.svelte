<script>
  import { onMount } from 'svelte'

  import {     signerAddress,
         chainId, chainData } from 'svelte-ethers-store'

  import { toWei } from '$lib/utils.js'
  import blockchain from '$lib/blockchain.js'

  import Modal from '$components/Modal.svelte'
  import TxButton from '$components/TxAction/Button.svelte'

  export let active
  export let address

  let modal

  let data = {}

  const control = {
    isWaiting: false,
    isLoading: false,
    error: {}
  }

  const cancel = async () => {
    if (modal) modal.close()
  }

  export const add = () => {
    control.error = {}

    if (!data.pledge) {
      control.error.pledge = 'This field is required'
    }

    if (!data.description) {
      control.error.description = 'This field is required'
    }

    if (Object.keys(control.error).length) return false

    const roadfund = blockchain.roadfund($chainId)

    return {
      call: roadfund.addFeature,
      params: [ address, data.description, toWei(data.pledge), 60 * 10 ],
      onReceipt: (rcpt) => {

        console.log('found roadmap creation event', rcpt)

        cancel()
      }

    }
  }

</script>



<Modal bind:this={modal} bind:active noCloseButton={true}>
  <div class="modal-card is-large">
    <section class="modal-card-body has-background-light">
      <h2 class="title">Add a feature</h2>

      <div class="column is-one-quarter">
        <div class="field">
          <label for="pledge" class="label">Pledge (in ETH)</label>
          <p class="control">
            <input
              id="pledge"
              class="input"
              class:is-danger={control.error.pledge}
              type="number"
              placeholder="pledge"
              bind:value={data.pledge} />
          </p>
          {#if control.error.pledge}<p class="help is-danger">
            {control.error.pledge}
          </p>{/if}
        </div>
      </div>

      <div class="column is-two-thirds">
        <div class="field">
          <label for="label" class="label">Description</label>
          <p class="control">
            <input
              id="description"
              class="input"
              class:is-danger={control.error.description}
                  type="text"
              placeholder="A feature that need to be implemented"
              bind:value={data.description} />
          </p>
          {#if control.error.description}<p class="help is-danger">
            {control.error.description}
          </p>{/if}
        </div>
      </div>

    </section>
    <footer class="modal-card-foot">
      {#if Object.keys(control.error).length}<p class="help is-danger pr-3">
        Please fix errors above
      </p>{/if}

      <TxButton disabled={!$signerAddress} class="mt-4 button is-primary is-block is-alt" submitCtx={add}
      >Add feature</TxButton>
      <button class="button is-black" on:click={cancel}>Cancel</button>

    </footer>
  </div>
</Modal>

