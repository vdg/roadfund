import dotenv from "dotenv";

import hre from "hardhat";

import { writeEnv } from "../scripts/deploy-helpers.js";

const deploy = async ({ getChainId }) => {
  const chainId = await getChainId();

  await writeEnv(`.env`, {
    ...dotenv.config().parsed,
    [`VITE_FALLBACK_PROVIDER_${chainId}`]: hre.network.config.url,
  });
};

export default deploy;

export const tags = [];
