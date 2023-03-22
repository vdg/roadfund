<script>
  import { getContext } from 'svelte'
  import { ethers } from 'ethers'

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

  const createCtx = async () => {

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

    return {
      call: roadfund.createRoadmap,
      params: [ initCode, saltNonce   ],
      onReceipt: (rcpt) => {
        console.log('success')
      }
    }

  }


</script>

{#key $signerAddress}
<TxButton disabled={!$signerAddress} class="button is-primary is-block is-alt is-large" submitCtx={createCtx}
  >Create a roadmap</TxButton>
{/key}
