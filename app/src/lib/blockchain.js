import { ethers } from 'ethers'

import { defaultEvmStores as evm } from 'svelte-ethers-store'

// import { dev, browser } from '$app/environment'
import Artifacts from 'contracts/Artifacts.json'

const noop = () => {}

const createBlockchain = () => {
  const connect = () => evm.setProvider()

  const disconnect = () => evm.disconnect()

  const call = async ({
    key,
    method,
    estimateGas,
    params,
    onTx = noop,
    onReceipt = noop,
    onError = noop
  }) => {
    try {
      const overrides = {}
      if (estimateGas && key) {
        const estimate = await estimateGas[key](...params)
        overrides.gasLimit = estimate.add(2000)
        console.log('estimate', key, estimate + '', overrides)
      }
      if (
        params.length > 0 &&
        typeof params[params.length - 1] === 'object' &&
        params[params.length - 1].value
      ) {
        params[params.length - 1] = {
          ...params[params.length - 1],
          ...overrides
        }
      } else {
        params = [...params, overrides]
      }
      const tx = await method(...params)
      onTx(tx)
      onReceipt(await tx.wait())
    } catch (e) {
      console.log('call catch', { e, onError })
      onError(e)
    }
  }

  const builder = (jsonInterface) => (address) =>
    new Proxy(
      {},
      {
        get: function (target, key) {
          if (!evm.$provider) throw new Error(`no provider`)
          const contract = new ethers.Contract(
            address,
            jsonInterface.abi,
            evm.$provider
          )
          try {
            const fragment = contract.interface.getFunction(key)
            if (fragment.type !== 'function')
              throw new Error(
                `unknown function ${jsonInterface.contractName}.${key}`
              )
            if (/^pure|view$/.test(fragment.stateMutability))
              return contract[key]
            return (o) =>
              call({
                ...o,
                key,
                method: contract.connect(evm.$signer)[key],
                estimateGas: contract.connect(evm.$signer).estimateGas
              })
          } catch (e) {
            return contract[key]
          }
        }
      }
    )

  const roadfund = (chainId) => {
    return builder(Artifacts[chainId][0].contracts.Roadfund)(
      Artifacts[chainId][0].contracts.Roadfund.address
    )
  }

  const isSupported = (chainId) => !!Artifacts[chainId]

  return {
    connect,
    disconnect,
    roadfund,
    isSupported
  }
}

const blockchain = createBlockchain()

export default blockchain
