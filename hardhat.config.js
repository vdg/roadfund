require("@babel/register")({
  ignore: [
    function (filepath) {
      // don't let babel translate mjs
      return /@rougenetwork\/v2-core\/rouge/.test(filepath);
    },
  ],
});

const dotenv = require("dotenv");

require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
//require('@nomiclabs/hardhat-waffle')
//require('hardhat-gas-reporter')

dotenv.config();
dotenv.config({ path: ".server.env" });

const fs = require("fs");

const mnemonic = fs.readFileSync("env/.mnemonic").toString().trim();
//const deployer = fs.readFileSync(".deployer").toString().trim()

module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 3000,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    RougeSingleton: {
      default: "0x376438641eB95A31b3AA9BD5bAe4b635577BBE74",
    },
    RougeProxyFactory: {
      default: "0x9dA37D0256c0d0fEBD7C7bc677af301E4e960daB",
    },
  },
  networks: {
    hardhat: {},
    geth: {
      url: "http://127.0.0.1:8545/",
      accounts: { mnemonic },
    },
  },
};
