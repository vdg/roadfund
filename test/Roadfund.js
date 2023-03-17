import hre from "hardhat";

import { expect } from "chai";

import Factory from "@rougenetwork/v2-core/Factory.json";
import Rouge from "@rougenetwork/v2-core/Rouge.json";

const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const metaURI = "somewhere on ipfs";

describe("Roadfund", function () {
  const getRouge = async () => {
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

    return { factory, rouge };
  };

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployStdFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const { factory, rouge } = await getRouge();

    const Roadfund = await ethers.getContractFactory("Roadfund");

    const roadfund = await Roadfund.deploy(factory.address, rouge.address);

    return { roadfund, owner, otherAccount, factory, rouge };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { roadfund, owner } = await loadFixture(deployStdFixture);

      return expect(await roadfund.owner()).to.equal(owner.address);
    });
  });

  describe("Basic functions", function () {
    let roadmap;

    it("Should create a new roadmap contract", async function () {
      const { roadfund, owner, factory, rouge, otherAccount } =
        await loadFixture(deployStdFixture);

      const initCode = rouge.interface.encodeFunctionData("setup", [
        otherAccount.address,
        metaURI,
        [],
        [],
      ]);

      let saltNonce = await ethers.provider.getTransactionCount(
        otherAccount.address
      );
      const tx = await roadfund
        .connect(otherAccount)
        .createRoadmap(initCode, saltNonce);
      const rcpt = await tx.wait();

      const topic = factory.interface.getEventTopic("ProxyCreation");
      const event = rcpt.events.filter((e) => e.topics[0] === topic)[0];

      const decoded = factory.interface.decodeEventLog(
        "ProxyCreation",
        event.data
      );

      roadmap = new ethers.Contract(decoded.proxy, Rouge.abi, ethers.provider);

      return expect(decoded.singleton).to.equal(rouge.address);
    });

    it("Can call URI on the ERC721", async function () {
      return expect(await roadmap.URI()).to.equal(metaURI);
    });

    it("create a feature as a channel", async function () {
      //const x = await roadmap.URI()
    });
  });
});
