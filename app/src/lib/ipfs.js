import { writable } from 'svelte/store'
import { decode } from 'jsonwebtoken-esm'

import { utils } from 'ethers'

import { defaultEvmStores as evm, chainId } from 'svelte-ethers-store'

import { eip712DomainByChain } from '@rougenetwork/v2-core/config'

const endpoint = import.meta.env.VITE_SPRINGBOK_ENDPOINT

const IPFS_GATEWAYS = [
  'localStorage',
  endpoint + '/ipfs/'
  // 'https://nftstorage.link/ipfs/',
  // 'https://ipfs.fleek.co/ipfs/',
  // 'https://gateway.ipfs.io/ipfs/',
  // 'https://dweb.link/ipfs/',
  // 'https://ipfs.io/ipfs/'
]

// don't share jwt between address but share between chainId
const jwtKey = (address) => `roadfund:jwt:${address}`

export const authed = writable(false)

export const createService = () => {
  const request = async (method, url, data) => {
    try {
      const headers =
        data && !(data instanceof FormData)
          ? { 'content-type': 'application/json' }
          : {}
      const response = await fetch(`${endpoint}${url}`, {
        method,
        headers: {
          Authorization: localStorage.getItem(jwtKey(evm.$signerAddress)),
          ...headers
        },
        body: data
          ? data instanceof FormData
            ? data
            : JSON.stringify(data)
          : undefined
      })
      return response.json()
    } catch (e) {
      console.log(e)
    }
  }

  //const get = (url) => request('GET', url)
  //const put = (url) => request('PUT', url)
  const post = (url, data) => request('POST', url, data)

  const signedRequest = async (path, types, content) => {
    const domain = eip712DomainByChain(evm.$chainId)

    let signature
    // XXX TMP workaround wallet connect incompatibility with ethers.js
    if (/^wc/.test(evm.$provider.provider.connector?.protocol)) {
      const payload = utils._TypedDataEncoder.getPayload(domain, types, content)
      signature = await evm.$provider.send('eth_signTypedData', [
        evm.$signerAddress.toLowerCase(),
        JSON.stringify(payload)
      ])
    } else {
      signature = await evm.$signer._signTypedData(domain, types, content)
    }

    const response = await fetch(`${endpoint}${path}`, {
      method: 'POST',
      headers: {
        'EIP712-Signature': signature,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ domain, types, content })
    })
    return response.json()
  }

  const signIn = async () => {
    const res = await signedRequest(
      '/v1/eip712/token',
      {
        Content: [
          { name: 'app', type: 'string' },
          { name: 'apiKey', type: 'string' },
          { name: 'address', type: 'string' },
          { name: 'scope', type: 'string' },
          { name: 'message', type: 'string' }
        ]
      },
      {
        app: 'Roadfund',
        apiKey: '2a034fb93c10077538c6df0955bd529f',
        scope: 'ipfs',
        address: evm.$signerAddress,
        message: `Sign to confirm that you own this address. This request will not trigger a blockchain transaction or cost any gas fees.`
      }
    )
    console.log('signIn', res, evm.$chainId)
    //if (res.success && res.chainId === evm.$chainId) {
    if (res.success) {
      localStorage.setItem(jwtKey(evm.$signerAddress), res.jwt)
      authed.set(true)
    } else {
      // todo handle error msg
      throw new Error('backend failure')
    }
  }

  const signOff = () => {
    localStorage.removeItem(jwtKey(evm.$signerAddress))
    authed.set(false)
  }

  const loadAuth = () => {
    const key = localStorage.getItem(jwtKey(evm.$signerAddress))
    if (key) {
      const decoded = decode(key, { complete: true })
      if (!decoded.payload.aud === 'ipfs') {
        console.log('REMOVE ODL JWT', decoded)
        localStorage.removeItem(jwtKey(evm.$signerAddress))
      } else {
        authed.set(true)
      }
    }
    // TODO check expiration ?
  }

  const unloadAuth = () => {
    authed.set(false)
  }

  const uploadData = async (data) => {
    console.log('[uploadData]', data)

    const formData = new FormData()

    const blob = new Blob([JSON.stringify(data)], {
      type: 'application/json'
    })
    formData.append('metadata', blob)

    //const url = '/v1/ipfs/add?macro=1'

    return post('/v1/ipfs/add', formData)
  }

  chainId.subscribe(($chainId) => {
    if (!$chainId) return unloadAuth()
    // console.log('backend => new chainId', $chainId)
    loadAuth()
  })

  const getJSONURL = (uri, gateway = IPFS_GATEWAYS[0]) =>
    uri.replace('ipfs://', gateway)

  const getJSONFrom = async (uri, gateway) => {
    try {
      if (gateway === 'localStorage') {
        return JSON.parse(localStorage.getItem(uri))
      }
      // #if (/^ipfs\:\/\//.test(uri)) {
      const response = await fetch(getJSONURL(uri, gateway), {
        method: 'GET',
        //mode: 'no-cors', // cors, *cors, same-origin
        headers: {
          //'Content-Type': 'application/json', // most ipfs gateway won't support it
        }
      })
      console.log(response)
      if (response.ok) {
        return response.json()
      }
    } catch (e) {
      console.warn(`gateway ${gateway} for ${uri}`, e)
    }
  }

  const getJSON = async (uri) => {
    // TODO test hash format
    if (!/^ipfs:\/\//.test(uri)) uri = 'ipfs://' + uri
    for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
      const json = await getJSONFrom(uri, IPFS_GATEWAYS[i])
      if (json) {
        localStorage.setItem(uri, JSON.stringify(json))
        return json
      }
    }
    throw new Error('no gateway answer')
  }

  return {
    signIn,
    signOff,
    loadAuth,
    getJSON,
    unloadAuth,
    uploadData
  }
}

const service = createService()

export default service
