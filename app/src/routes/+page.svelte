<script>
  import { getContext } from 'svelte'
  import { ethers } from 'ethers'
  import { goto } from '$app/navigation'

  import {
    getChainDataByChainId,
    signerAddress,
    provider,
    chainId,
    chainData
  } from 'svelte-ethers-store'

  import { abiEncodeAuth } from "@rougenetwork/v2-core/rouge"

  import Factory from "@rougenetwork/v2-core/Factory.json";

  import blockchain from '$lib/blockchain.js'

  import TxButton from '$components/TxAction/Button.svelte'
  import RoadmapList from '$components/RoadmapList.svelte'
  import Unsupported from '$components/Unsupported.svelte'
  import Roadmap from '$components/Roadmap.svelte'
  import CreateRoadmap from '$components/CreateRoadmap.svelte'

  import roadmap from '$stores/roadmap.js'

  const createCtx = async () => {

    const roadfund = blockchain.roadfund($chainId)

    const ifactory = new ethers.utils.Interface(Factory.abi)
    const topic = ifactory.getEventTopic("ProxyCreation")

    return {
      call: roadfund.createRoadmap,
      params: [ 'ipfs://', await roadfund.owner() ],
      onReceipt: (rcpt) => {

        const event = rcpt.events.filter((e) => e.topics[0] === topic)[0];
        const decoded = ifactory.decodeEventLog(
          "ProxyCreation",
          event.data
        )

        console.log('found roadmap creation event', event, decoded)

        roadmap.addRoadmap(decoded.proxy)
        goto(`/${$chainId}:${decoded.proxy}/`)

      }
    }

  }

  $: myRoadmaps = $roadmap.roadmapAddresses || []

  $: savedRoadmaps = $roadmap.userRoadmapAddresses || []

  $: supported = $signerAddress && blockchain.isSupported($chainId)

  let createActive = false

</script>

{#if $signerAddress && supported}

  <CreateRoadmap bind:active={createActive} />

  <RoadmapList title="Your very own roadmaps!" addresses={myRoadmaps}>

    <nav class="level mt-5">
      <div class="level-item has-text-centered">
        <button disabled={!$signerAddress} class="button mt-4 is-primary is-block is-large" on:click={() => { createActive = true }}
        >Create a roadmap</button>
      </div>
    </nav>

  </RoadmapList>

  <RoadmapList title="Saved roadmaps of your peers!" addresses={savedRoadmaps} />

{:else}

  <section class="hero is-medium is-primary">
    <div class="hero-body has-text-centered">

      <Unsupported />

    </div>
  </section>

{/if}
