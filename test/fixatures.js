import hre from "hardhat";

import Factory from "@rougenetwork/v2-core/Factory.json";
import Rouge from "@rougenetwork/v2-core/Rouge.json";

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const metaURI = "somewhere on ipfs";

export const getRouge = async () => {
  let factory, rouge;

  if (hre.network.name === "hardhat") {
    // deploy new version of rouge for hardhat test

    const [, , signer] = await ethers.getSigners();

    const df = new ethers.ContractFactory(
      Factory.abi,
      Factory.bytecode,
      signer
    );
    factory = await df.deploy();
    await factory.deployed();

    const dr = new ethers.ContractFactory(Rouge.abi, Rouge.bytecode, signer);
    rouge = await dr.deploy();
    await rouge.deployed();
  }

  if (hre.network.config.RougeProxyFactory) {
    factory = new ethers.Contract(
      hre.network.config.RougeProxyFactory,
      Factory.abi,
      ethers.provider
    );
  }

  if (hre.network.config.RougeSingleton) {
    rouge = new ethers.Contract(
      hre.network.config.RougeSingleton,
      Rouge.abi,
      ethers.provider
    );
  }

  const rougelib = await import("@rougenetwork/v2-core/rouge.mjs");

  return { factory, rouge, rougelib };
};

export const deployRoadfund = async () => {
  // Contracts are deployed using the first signer/account by default
  const [owner, creator] = await ethers.getSigners();

  const { factory, rouge, rougelib } = await getRouge();

  const Roadfund = await ethers.getContractFactory("Roadfund");

  const roadfund = await Roadfund.deploy(factory.address, rouge.address);

  return { roadfund, owner, creator, factory, rouge, rougelib };
};

export const deployRoadfundAndCreateProject = async () => {
  const { roadfund, owner, factory, rouge, rougelib, creator } =
    await loadFixture(deployRoadfund);

  const auths = [
    { scope: rouge.interface.getSighash("acquire"), enable: true },
  ].map((a) => rougelib.abiEncodeAuth(a));

  const tx = await roadfund
    .connect(creator)
    .createRoadmap(metaURI, owner.address);
  const rcpt = await tx.wait();

  const topic = factory.interface.getEventTopic("ProxyCreation");
  const event = rcpt.events.filter((e) => e.topics[0] === topic)[0];

  const decoded = factory.interface.decodeEventLog("ProxyCreation", event.data);

  const roadmap = new ethers.Contract(
    decoded.proxy,
    Rouge.abi,
    ethers.provider
  );

  return { roadfund, roadmap, owner, rougelib, creator };
};
