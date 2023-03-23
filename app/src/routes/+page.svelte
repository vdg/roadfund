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
  import Rouge from "@rougenetwork/v2-core/Rouge.json";

  import blockchain from '$lib/blockchain.js'

  import TxButton from '$components/TxAction/Button.svelte'
  import RoadmapList from '$components/RoadmapList.svelte'

  import roadmap from '$stores/roadmap.js'

  const createCtx = async () => {

    // XXX in env ...
    const rouge = new ethers.Contract(
      '0x376438641eB95A31b3AA9BD5bAe4b635577BBE74',
      Rouge.abi,
      ethers.provider
    )
    const roadfund = blockchain.roadfund($chainId)

    const auths = [
      { scope: rouge.interface.getSighash("acquire"), enable: true },
    ].map((a) => abiEncodeAuth(a));

    const initCode = rouge.interface.encodeFunctionData("setup", [
      roadfund.address,
      'test',
      [],
      auths,
    ]);

    console.log( roadfund.address, auths,  rouge.interface, initCode, $signerAddress)

    let saltNonce = await $provider.getTransactionCount(
      $signerAddress
    )

    console.log( roadfund.address, [ initCode, saltNonce   ])

    const ifactory = new ethers.utils.Interface(Factory.abi)
    const topic = ifactory.getEventTopic("ProxyCreation")

    return {
      call: roadfund.createRoadmap,
      params: [ initCode, saltNonce ],
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

</script>

{#if $signerAddress && supported}

  <RoadmapList title="Your roadmaps" addresses={myRoadmaps} />

  <RoadmapList title="Roadmap saved" addresses={savedRoadmaps} />

  {#key $signerAddress}
    <TxButton disabled={!$signerAddress} class="mt-4 button is-primary is-block is-alt is-large" submitCtx={createCtx}
    >Create a roadmap</TxButton>
  {/key}

{:else}

  <section class="hero is-medium is-primary">
    <div class="hero-body has-text-centered">

      {#if $signerAddress}
        <p class="title">
          Sorry, non supported network
        </p>
      {:else}
        <p class="title">
          Please connect to your wallet
        </p>
      {/if}

    </div>
  </section>

{/if}
