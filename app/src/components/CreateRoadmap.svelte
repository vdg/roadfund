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
  import ipfs, { authed } from '$lib/ipfs.js'

  import roadmap from '$stores/roadmap.js'

  import { gradient } from '$lib/actions/gradient.js'

  import Modal from '$components/Modal.svelte'
  import Authed from '$components/Authed.svelte'

  import TxAction from '$components/TxAction/index.svelte'
  import TxActionButton from '$components/TxAction/TxActionButton.svelte'
  import TxActionFeedback from '$components/TxAction/TxActionFeedback.svelte'


  export let active

  let modal
  let action

  let data = {
  }

  // test case shortcuts
  data = {
    // "name": "Gnosis Chain",
    // "description": "Gnosis Chain is a scalable, EVM-compatible, layer 2 blockchain built on top of Ethereum.",
    // "image": "https://techstory.in/wp-content/uploads/2021/08/Binance-announces-Gnosis-Listing-GNO-1024x640-1.jpg",
    // "home": "https://www.gnosis.io/",
    // "repository": "https://github.com/gnosis",
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

  export const create = async () => {
    control.error = {}

    if (Object.keys(control.error).length) return false

    const { success, cids } = await ipfs.uploadData(data)

    if (!success || !cids || cids.length !== 1)
      throw new Error('springbok error')

    console.log ( { success, cids } );

    const roadfund = blockchain.roadfund($chainId)

    const ifactory = new ethers.utils.Interface(Factory.abi)
    const topic = ifactory.getEventTopic("ProxyCreation")

    return {
      call: roadfund.createRoadmap,
      params: [ `ipfs://${cids[0].cid}`, penaltyRecipient ],
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

{#if active}
<Authed
  on:close={() => {
           if (!$authed) active = false
           }}>



<Modal bind:this={modal} bind:active noCloseButton={true}>
  <div class="modal-card is-large" use:gradient data-hashed={999} xdata-endColor={200}>
    <section class="modal-card-body">
      <h2 class="title">Create a new roadmap</h2>

      <h3 class="subtitle obscured mt-4">Your project's bold name</h3>

      <div class="column is-full">
        <div class="field">
          <label for="label" class="label">Name</label>
          <p class="control">
            <input
              id="name"
              class="input"
              class:is-danger={control.error.name}
                  type="text"
              placeholder=""
              bind:value={data.name} />
          </p>
          {#if control.error.name}<p class="help is-danger">
            {control.error.name}
          </p>{/if}
        </div>
      </div>

      <h3 class="subtitle obscured mt-4">
        The quick and catchy project one liner<br />
        (best is ~ 60 characters)</h3>

      <div class="column is-full">
        <div class="field">
          <label for="label" class="label">Description</label>
          <p class="control">
            <input
              id="description"
              class="input"
              class:is-danger={control.error.description}
                  type="text"
              placeholder=""
              bind:value={data.description} />
          </p>
          {#if control.error.description}<p class="help is-danger">
            {control.error.description}
          </p>{/if}
        </div>
      </div>

      <h3 class="subtitle obscured mt-4">Online destination to know more about the project</h3>

      <div class="column is-full">
        <div class="field">
          <label for="label" class="label">Home URL</label>
          <p class="control">
            <input
              id="home"
              class="input"
              class:is-danger={control.error.home}
                  type="text"
              placeholder=""
              bind:value={data.home} />
          </p>
          {#if control.error.home}<p class="help is-danger">
            {control.error.home}
          </p>{/if}
        </div>
      </div>

      <h3 class="subtitle obscured mt-4">Your captivating cover/logo art image
        <br />(best 4:3 ratio)</h3>

      <div class="column is-full">
        <div class="field">
          <label for="label" class="label">Image URL</label>
          <p class="control">
            <input
              id="image"
              class="input"
              class:is-danger={control.error.image}
                  type="text"
              placeholder=""
              bind:value={data.image} />
          </p>
          {#if control.error.image}<p class="help is-danger">
            {control.error.image}
          </p>{/if}
        </div>
      </div>

      <h3 class="subtitle obscured mt-4">Want to link with your project's source code hideout?</h3>

      <div class="column is-full">
        <div class="field">
          <label for="label" class="label">Repository URL</label>
          <p class="control">
            <input
              id="repository"
              class="input"
              class:is-danger={control.error.repository}
                  type="text"
              placeholder=""
              bind:value={data.repository} />
          </p>
          {#if control.error.repository}<p class="help is-danger">
            {control.error.repository}
          </p>{/if}
        </div>
      </div>

    </section>

    <footer class="modal-card-foot">
      <TxAction
        bind:this={action} let:callId
        submitCtx={create}
      >
        <div class="is-centered">
          {#if Object.keys(control.error).length}<p class="help is-danger pr-3">
          Please fix errors above
          </p>{/if}
          <TxActionFeedback />
        </div>
        <div class="buttons has-addons is-centered ml-5">
          <TxActionButton class="button is-primary"
          >Create a new roadmap</TxActionButton>
          <button class="button is-primary is-inverted ml-5" on:click={cancel}>Cancel</button>
      </TxAction>
   </footer>

  </div>
</Modal>
  </Authed>
{/if}


<style lang="scss">

  @import '../scss/_variables.scss';

  .modal-card-body, .modal-card-foot {
    background: transparent;
  }

  h3 {
    margin-bottom: 0rem !important;

  }

</style>
