<script>
  import { onMount } from 'svelte'

  import {     signerAddress,
         chainId, chainData } from 'svelte-ethers-store'

  import { toWei } from '$lib/utils.js'
  import blockchain from '$lib/blockchain.js'

  import { gradient } from '$lib/actions/gradient.js'

  import Modal from '$components/Modal.svelte'

  import TxAction from '$components/TxAction/index.svelte'
  import TxActionButton from '$components/TxAction/TxActionButton.svelte'
  import TxActionFeedback from '$components/TxAction/TxActionFeedback.svelte'

  export let active
  export let address

  let modal
  let action

  let data = {
    pledge: 0.001,
    challenge: 5
  }

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

    if (!data.title) {
      control.error.title = 'This field is required'
    }

    if (Object.keys(control.error).length) return false

    const roadfund = blockchain.roadfund($chainId)

    return {
      call: roadfund.addFeature,
      params: [ address, data.title, 'ipfs://', toWei(data.pledge), 60 * data.challenge ],
      onReceipt: (rcpt) => {

        console.log('found roadmap creation event', rcpt)

        cancel()
      }

    }
  }

</script>



<Modal bind:this={modal} bind:active noCloseButton={true}>
  <div class="modal-card is-large" use:gradient data-hashed={999} xdata-endColor={200}>
    <section class="modal-card-body">
      <h2 class="title">Add a feature</h2>

      <h3 class="subtitle mt-4">Briefly describe the feature for user consideration</h3>

      <div class="column is-full">
        <div class="field">
          <label for="label" class="label">Feature title</label>
          <p class="control">
            <input
              id="title"
              class="input"
              class:is-danger={control.error.title}
                  type="text"
              placeholder="title"
              bind:value={data.title} />
          </p>
          {#if control.error.title}<p class="help is-danger">
            {control.error.title}
          </p>{/if}
        </div>
      </div>

      <h3 class="subtitle mt-4">IPFS URI for detailed feature metadata (see help)</h3>

      <div class="column is-full">
        <div class="field">
          <label for="label" class="label">IPFS URI</label>
          <p class="control">
            <input
              id="uri"
              class="input"
              class:is-danger={control.error.uri}
                  type="text"
              placeholder="ipfs://"
              bind:value={data.uri} />
          </p>
          {#if control.error.uri}<p class="help is-danger">
            {control.error.uri}
          </p>{/if}
        </div>
      </div>

      <h3 class="subtitle mt-4">Minimum pledge amount for voting or challenging (in ETH)</h3>

      <div class="column is-half">
        <div class="field">
          <label for="pledge" class="label">Pledge price (in ETH)</label>
          <p class="control">
            <input
              id="pledge"
              class="input"
              class:is-danger={control.error.pledge}
              type="number"
              placeholder=""
              bind:value={data.pledge} />
          </p>
          {#if control.error.pledge}<p class="help is-danger">
            {control.error.pledge}
          </p>{/if}
        </div>
      </div>

      <h3 class="subtitle mt-4">Minimum challenge duration before funds can be withdrawn</h3>

      <div class="column is-half">
        <div class="field">
          <label for="challenge" class="label">Challenge duration (in minutes)</label>
          <p class="control">
            <input
              id="challenge"
              class="input"
              class:is-danger={control.error.challenge}
              type="number"
              placeholder="challenge"
              bind:value={data.challenge} />
          </p>
          {#if control.error.challenge}<p class="help is-danger">
            {control.error.challenge}
          </p>{/if}
        </div>
      </div>

    </section>

    <footer class="modal-card-foot">
      <TxAction
        bind:this={action} let:callId
        submitCtx={add}
      >
        <div class="is-centered">
          {#if Object.keys(control.error).length}<p class="help is-danger pr-3">
          Please fix errors above
          </p>{/if}
          <TxActionFeedback />
        </div>
        <div class="buttons has-addons is-centered ml-5">
          <TxActionButton class="button is-primary"
          >Add feature</TxActionButton>
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
