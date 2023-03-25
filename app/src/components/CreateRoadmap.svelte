<script>
  import { onMount } from 'svelte'

  import { ethers } from 'ethers'
  import { goto } from '$app/navigation'

  import {
    signerAddress,
    chainId, chainData } from 'svelte-ethers-store'

  import Factory from "@rougenetwork/v2-core/Factory.json";

  import { toWei } from '$lib/utils.js'
  import blockchain from '$lib/blockchain.js'

  import roadmap from '$stores/roadmap.js'

  import { gradient } from '$lib/actions/gradient.js'

  import Modal from '$components/Modal.svelte'
  import TxButton from '$components/TxAction/Button.svelte'

  export let active

  let modal

  let data = {
  }

  const control = {
    isWaiting: false,
    isLoading: false,
    error: {}
  }

  const cancel = async () => {
    if (modal) modal.close()
  }

  const penaltyRecipient = '0xEb439EED5642641968f9D8b52F2788e0F19B443B'
  const penaltyRecipientLabel= 'Eth Global'

  export const create = () => {
    control.error = {}

    if (Object.keys(control.error).length) return false

    const roadfund = blockchain.roadfund($chainId)

    const ifactory = new ethers.utils.Interface(Factory.abi)
    const topic = ifactory.getEventTopic("ProxyCreation")

    return {
      call: roadfund.createRoadmap,
      params: [ data.uri || '', penaltyRecipient ],
      onReceipt: (rcpt) => {

        const event = rcpt.events.filter((e) => e.topics[0] === topic)[0];
        const decoded = ifactory.decodeEventLog(
          "ProxyCreation",
          event.data
        )

        console.log('found roadmap creation event', event, decoded)

        roadmap.addRoadmap(decoded.proxy)

        cancel()

        goto(`/${$chainId}:${decoded.proxy}/`)

      }

    }
  }

</script>



<Modal bind:this={modal} bind:active noCloseButton={true}>
  <div class="modal-card is-large" use:gradient data-hashed={999} xdata-endColor={200}>
    <section class="modal-card-body">
      <h2 class="title">Create a new roadmap</h2>

      <h3 class="subtitle mt-4">Add an IPFS URI for customizing your roadmap metadata (see help)</h3>

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

    </section>
    <footer class="modal-card-foot">
      {#if Object.keys(control.error).length}<p class="help is-danger pr-3">
        Please fix errors above
      </p>{/if}

      <TxButton disabled={!$signerAddress} class="mt-4 button is-primary is-block is-alt" submitCtx={create}
      >Create roadmap</TxButton>
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
