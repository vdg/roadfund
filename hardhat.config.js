require("@babel/register")();

const dotenv = require("dotenv");

require("@nomicfoundation/hardhat-toolbox");

dotenv.config();

module.exports = {
  solidity: "0.8.18",
};
