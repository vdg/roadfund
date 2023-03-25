import { ethers } from 'ethers'

import { defaultEvmStores as evm } from 'svelte-ethers-store'

// import { dev, browser } from '$app/environment'

import Artifacts from 'contracts/Artifacts.json'
import Rouge from '@rougenetwork/v2-core/Rouge.json'

import roadmap from '$stores/roadmap.js'

const noop = () => {}

const createBlockchain = () => {
  const connect = () => evm.setProvider()

  const disconnect = () => evm.disconnect()

  const iRouge = new ethers.utils.Interface(Rouge.abi)

  const handlers = {
    AddedChannel: (address, fragment, event) => {
      console.log('*** AddedChannel ***', address, fragment, event)
      roadmap.refresh(address)
    }
    // UpdateAuthorization: (address, fragment, event) => {
    //   roadmap.refresh(address)
    // }
  }

  const handleRougeEvent =
    (address) =>
    async ({ topics, data }) => {
      const fragment = iRouge.getEvent(topics[0])
      console.log('event', address, fragment)
      if (!handlers[fragment.name]) return
      const event = iRouge.decodeEventLog(fragment, data, topics)
      console.log('** DEBUG event **', fragment.name, {
        address,
        fragment,
        event
      })
      return handlers[fragment.name](address, fragment, event)
    }

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
        // const estimate = await estimateGas[key](...params)
        // overrides.gasLimit = estimate.add(2000)
        // console.log('estimate', key, estimate + '', overrides)
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
                method: contract.connect(evm.$signer)[key]
                // estimateGas: contract.connect(evm.$signer).estimateGas
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

  const rouge = (address) => builder(Rouge)(address)

  const isSupported = (chainId) => !!Artifacts[chainId]

  return {
    connect,
    disconnect,
    handleRougeEvent,
    roadfund,
    rouge,
    isSupported
  }
}

const blockchain = createBlockchain()

export default blockchain
