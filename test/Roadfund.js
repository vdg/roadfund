import hre from "hardhat";

import { expect } from "chai";

import Factory from "@rougenetwork/v2-core/Factory.json";
import Rouge from "@rougenetwork/v2-core/Rouge.json";

import {
  getRouge,
  deployRoadfund,
  deployRoadfundAndCreateProject,
} from "./fixatures";

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

      const tx = await roadfund.connect(otherAccount).createRoadmap(metaURI);
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

  describe("Using roadmap", function () {
    let roadfund;
    let roadmap;
    let owner;
    let rougelib;

    it("initialize project", async function () {
      void ({ roadfund, roadmap, owner, rougelib } = await loadFixture(
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

      const tx = await roadfund.connect(otherAccount).addFeature(
        roadmap.address,
        "feature A",
        60 * 10, // 10 minutes cooling period
        rougelib.abiEncodeChannel(channel)
      );

      const tx2 = await roadfund.connect(otherAccount).addFeature(
        roadmap.address,
        "feature B",
        60 * 10, // 10 minutes cooling period
        rougelib.abiEncodeChannel(channel)
      );
    });

    it("user X acquire 10 (direct)", async function () {
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

    it("user X pledge 10 votes for feature A", async function () {
      const [owner, otherAccount, userX, userY, userZ] =
        await ethers.getSigners();

      const tx = await roadfund
        .connect(userX)
        .pledge(roadmap.address, 0, 10, { value: expandToNDecimals(11, 18) });

      const rcpt = await tx.wait();
    });
  });
});
