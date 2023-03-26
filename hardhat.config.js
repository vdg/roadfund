require('@babel/register')({
  ignore: [
    function (filepath) {
      // don't let babel translate mjs
      return /@rougenetwork\/v2-core\/rouge/.test(filepath)
    }
  ]
})

const dotenv = require('dotenv')

require('@nomiclabs/hardhat-ethers')
require('hardhat-deploy')
require('@nomiclabs/hardhat-waffle')
//require('hardhat-gas-reporter')

dotenv.config()
dotenv.config({ path: '.server.env' })

const fs = require('fs')

const mnemonic = fs.readFileSync('env/.mnemonic').toString().trim()
const deployer = fs.readFileSync('env/.deployer').toString().trim()

module.exports = {
  solidity: {
    version: '0.8.18',
    settings: {
      optimizer: {
        enabled: true,
        runs: 3000
      }
    }
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      oeth: `privatekey://${deployer}`
    },
    RougeSingleton: {
      default: '0x376438641eB95A31b3AA9BD5bAe4b635577BBE74',
      oeth: '0x0a7f68446D0360ff1132d967C371a6DF08169bd5',
      'scr-alpha': '0x90713Dd7F05361317b2aBb5E5998b819099dDFaf'
    },
    RougeProxyFactory: {
      default: '0x9dA37D0256c0d0fEBD7C7bc677af301E4e960daB',
      oeth: '0xA0D17b2b99bB9BE256c6091526a627B7bB1b6f25',
      'scr-alpha': '0xA6e904D88370D25e8Af3c6Eec7ecdD23a8d8BC83'
    }
  },
  networks: {
    hardhat: {},
    geth: {
      url: 'http://127.0.0.1:8545/',
      accounts: { mnemonic }
    },
    'scr-alpha': {
      // 534353
      url: `https://alpha-rpc.scroll.io/l2`,
      accounts: { mnemonic }
    },
    // main nets
    oeth: {
      // 10
      url: `${process.env.OPTIMISM_RPC}`
    }
  }
}
