import hre from "hardhat";

import { expect } from "chai";

import Factory from "@rougenetwork/v2-core/Factory.json";
import Rouge from "@rougenetwork/v2-core/Rouge.json";

const {
  commify,
  parseEther,
  parseUnits,
  keccak256,
  defaultAbiCoder,
  toUtf8Bytes,
  solidityPack,
} = ethers.utils;

export const expandToNDecimals = (s, n) =>
  parseUnits((s + "").split(" ").join(""), n);

const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const metaURI = "somewhere on ipfs";

describe("Roadfund", function () {
  let rougelib;

  before(async function () {
    rougelib = await import("@rougenetwork/v2-core/rouge.mjs");
  });

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
  async function deployRoadfund() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const { factory, rouge } = await getRouge();

    const Roadfund = await ethers.getContractFactory("Roadfund");

    const roadfund = await Roadfund.deploy(factory.address, rouge.address);

    return { roadfund, owner, otherAccount, factory, rouge };
  }

  async function deployRoadfundAndCreateProject() {
    const { roadfund, owner, factory, rouge, otherAccount } = await loadFixture(
      deployRoadfund
    );

    const auths = [
      { scope: rouge.interface.getSighash("acquire"), enable: true },
    ].map((a) => rougelib.abiEncodeAuth(a));

    const initCode = rouge.interface.encodeFunctionData("setup", [
      roadfund.address,
      metaURI,
      [],
      auths,
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

    const roadmap = new ethers.Contract(
      decoded.proxy,
      Rouge.abi,
      ethers.provider
    );

    return { roadfund, roadmap, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { roadfund, owner } = await loadFixture(deployRoadfund);

      return expect(await roadfund.owner()).to.equal(owner.address);
    });
  });

  describe("Create a new roadamp", function () {
    let roadmap;

    it("Should create a new roadmap contract", async function () {
      const { roadfund, owner, factory, rouge, otherAccount } =
        await loadFixture(deployRoadfund);

      const initCode = rouge.interface.encodeFunctionData("setup", [
        roadfund.address,
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
  });

  describe("Managing roadmap", function () {
    let roadfund;
    let roadmap;
    let owner;

    it("initialize project", async function () {
      void ({ roadfund, roadmap, owner } = await loadFixture(
        deployRoadfundAndCreateProject
      ));

      return expect(true).to.equal(true);

      //return expect(decoded.singleton).to.equal(rouge.address);
    });

    it("create features", async function () {
      const channel = {
        free: false,
        label: "Having a twin login",
        token: ethers.constants.AddressZero,
        amount: expandToNDecimals(1, 18),
      };

      const [owner, otherAccount] = await ethers.getSigners();

      const tx = await roadfund
        .connect(otherAccount)
        .addFeature(
          roadmap.address,
          "feature A",
          rougelib.abiEncodeChannel(channel)
        );

      const tx2 = await roadfund
        .connect(otherAccount)
        .addFeature(
          roadmap.address,
          "feature B",
          rougelib.abiEncodeChannel(channel)
        );
    });

    it("user X pledge 10 votes for feature B", async function () {
      const [owner, otherAccount, userX, userY, userZ] =
        await ethers.getSigners();

      const channels = [
        { free: false, label: "featureA", amount: expandToNDecimals(1, 18) },
        { free: false, label: "featureB", amount: expandToNDecimals(1, 18) },
      ];

      const params = await rougelib.abiEncodeAcquire({
        channels,
        contract: roadmap,
        signer: userX,
        secret: "test",
        acquisitions: [
          { channelId: 0, qty: 1 },
          { channelId: 1, qty: 10 },
        ],
      });

      // const tx = await roadfund
      //   .connect(userX)
      //       .pledge(roadmap.address, 1, 10, { value: expandToNDecimals(10, 18) });

      params[1].value = expandToNDecimals(11, 18);
      console.log(params);

      void (await roadmap.connect(userX).acquire(...params)).wait();
    });
  });
});
