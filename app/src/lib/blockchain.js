// import { ethers, utils, constants } from 'ethers'

import { defaultEvmStores as evm } from 'svelte-ethers-store'

// import { dev, browser } from '$app/environment'

const createBlockchain = () => {
  const connect = () => evm.setProvider()

  const disconnect = () => evm.disconnect()

  return {
    connect,
    disconnect
  }
}

const blockchain = createBlockchain()

export default blockchain
