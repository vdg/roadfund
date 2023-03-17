require("@babel/register")({
  ignore: [
    function (filepath) {
      // don't let babel translate mjs
      return /@rougenetwork\/v2-core\/rouge/.test(filepath);
    },
  ],
});

const dotenv = require("dotenv");

require("@nomicfoundation/hardhat-toolbox");

dotenv.config();

module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {},
    geth: {
      url: "http://127.0.0.1:8545/",
      RougeSingleton: "0x376438641eB95A31b3AA9BD5bAe4b635577BBE74",
      RougeProxyFactory: "0x9dA37D0256c0d0fEBD7C7bc677af301E4e960daB",
    },
  },
};
