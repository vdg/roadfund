import hre from 'hardhat'

import { expect } from 'chai'

import Factory from '@rougenetwork/v2-core/Factory.json'
import Rouge from '@rougenetwork/v2-core/Rouge.json'

import {
  getRouge,
  deployRoadfund,
  deployRoadfundAndCreateProject
} from './fixatures'

import { increaseTime } from './utils.js'

const {
  commify,
  parseEther,
  parseUnits,
  keccak256,
  defaultAbiCoder,
  toUtf8Bytes,
  solidityPack
} = ethers.utils

export const expandToNDecimals = (s, n) =>
  parseUnits((s + '').split(' ').join(''), n)

const {
  time,
  loadFixture
} = require('@nomicfoundation/hardhat-network-helpers')

const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs')

const metaURI = 'somewhere on ipfs'

describe('Roadfund', function () {
  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const { roadfund, owner } = await loadFixture(deployRoadfund)

      return expect(await roadfund.owner()).to.equal(owner.address)
    })
  })

  describe('Create a new roadmap', function () {
    let roadmap

    it('Should create a new roadmap contract', async function () {
      const { roadfund, owner, factory, rouge, creator } = await loadFixture(
        deployRoadfund
      )

      const tx = await roadfund
        .connect(creator)
        .createRoadmap(metaURI, owner.address)
      const rcpt = await tx.wait()

      const topic = factory.interface.getEventTopic('ProxyCreation')
      const event = rcpt.events.filter((e) => e.topics[0] === topic)[0]

      const decoded = factory.interface.decodeEventLog(
        'ProxyCreation',
        event.data
      )

      roadmap = new ethers.Contract(decoded.proxy, Rouge.abi, ethers.provider)

      return expect(decoded.singleton).to.equal(rouge.address)
    })

    it('Can call URI on the ERC721', async function () {
      return expect(await roadmap.URI()).to.equal(metaURI)
    })
  })

  // *********** *********** *********** *********** *********** ***********

  describe('Using roadmap (claim not contested)', function () {
    let roadfund
    let roadmap
    let owner

    it('initialize project', async function () {
      void ({ roadfund, roadmap, owner } = await loadFixture(
        deployRoadfundAndCreateProject
      ))

      return expect(true).to.equal(true)

      //return expect(decoded.singleton).to.equal(rouge.address);
    })

    it('add features A & B', async function () {
      const [owner, creator] = await ethers.getSigners()

      const tx1 = await roadfund.connect(creator).addFeature(
        roadmap.address,
        'feature A',
        'ipfs://',
        expandToNDecimals(1, 15), // 1 finney
        60 * 10 // 10 minutes challenge duration
      )
      await tx1.wait()

      const tx2 = await roadfund.connect(creator).addFeature(
        roadmap.address,
        'feature A',
        'ipfs://',
        expandToNDecimals(1, 15), // 1 finney
        60 * 10 // 10 minutes challenge duration
      )
      await tx2.wait()

      const { channels } = await roadfund.getInfos(roadmap.address)
      expect(channels.length).to.equal(2)
    })

    it('user X pledge 10 tokens for feature A', async function () {
      const [owner, creator, userX, userY, userZ] = await ethers.getSigners()

      const tx = await roadfund
        .connect(userX)
        .pledge(roadmap.address, 0, 10, { value: expandToNDecimals(10, 15) })

      const rcpt = await tx.wait()
      const { channels } = await roadfund.getInfos(roadmap.address)
      expect(channels[0].totalAcquired).to.equal(10)
    })

    it('user Y pledge 60 tokens for feature A (revert/without enough funding)', async function () {
      const [owner, creator, userX, userY, userZ] = await ethers.getSigners()

      await expect(
        roadfund
          .connect(userY)
          .pledge(roadmap.address, 0, 60, { value: expandToNDecimals(59, 15) })
      ).reverted
    })

    it('user Y pledge 60 tokens for feature A', async function () {
      const [owner, creator, userX, userY, userZ] = await ethers.getSigners()

      const tx = await roadfund
        .connect(userY)
        .pledge(roadmap.address, 0, 60, { value: expandToNDecimals(60, 15) })

      const rcpt = await tx.wait()
      const { channels } = await roadfund.getInfos(roadmap.address)

      expect(channels[0].totalAcquired).to.equal(70)
    })

    it('user claim feature A (revert, not creator)', async function () {
      const [owner, creator, userX, userY, userZ] = await ethers.getSigners()

      await expect(
        roadfund.connect(userZ).claim(roadmap.address, 0)
      ).to.be.revertedWith('not creator')
    })

    it('creator claim feature A', async function () {
      const [owner, creator] = await ethers.getSigners()

      const tx = await roadfund.connect(creator).claim(roadmap.address, 0)
      const rcpt = await tx.wait()
    })

    it('creator close feature A (revert, challenge duration)', async function () {
      const [owner, creator] = await ethers.getSigners()

      await increaseTime('9m')

      await expect(
        roadfund.connect(creator).close(roadmap.address, 0)
      ).to.be.revertedWith('not time')
    })

    it('creator close feature A (not challenged)', async function () {
      const [owner, creator] = await ethers.getSigners()

      await increaseTime('1m')

      expect((await roadfund.getInfos(roadmap.address)).open[0]).to.equal(true)

      await expect(() =>
        roadfund.connect(creator).close(roadmap.address, 0)
      ).to.changeEtherBalance(creator, expandToNDecimals(70, 15))

      expect((await roadfund.getInfos(roadmap.address)).open[0]).to.equal(false)
    })

    it('user Y cannot pledge tokens anymore (revert)', async function () {
      const [owner, creator, userX, userY, userZ] = await ethers.getSigners()

      await expect(
        roadfund
          .connect(userY)
          .pledge(roadmap.address, 0, 1, { value: expandToNDecimals(2, 15) })
      ).reverted
    })
  })

  // *********** *********** *********** *********** *********** ***********

  describe('Using roadmap (claim challenged but not successfully contested)', function () {
    let roadfund
    let roadmap
    let owner

    it('initialize project & add features A & B', async function () {
      void ({ roadfund, roadmap } = await loadFixture(
        deployRoadfundAndCreateProject
      ))

      const [owner, creator] = await ethers.getSigners()

      const tx1 = await roadfund.connect(creator).addFeature(
        roadmap.address,
        'feature A',
        'ipfs://',
        expandToNDecimals(1, 15), // 1 finney
        60 * 10 // 10 minutes challenge duration
      )
      await tx1.wait()

      const tx2 = await roadfund.connect(creator).addFeature(
        roadmap.address,
        'feature B',
        'ipfs://',
        expandToNDecimals(1, 15), // 1 finney
        60 * 10 // 10 minutes challenge duration
      )
      await tx2.wait()

      return expect(true).to.equal(true)

      //return expect(decoded.singleton).to.equal(rouge.address);
    })

    it('user X pledge 10 tokens for feature B', async function () {
      const [owner, creator, userX, userY, userZ] = await ethers.getSigners()

      const tx = await roadfund
        .connect(userX)
        .pledge(roadmap.address, 1, 10, { value: expandToNDecimals(10, 15) })

      const rcpt = await tx.wait()
      const { channels } = await roadfund.getInfos(roadmap.address)
      expect(channels[1].totalAcquired).to.equal(10)
    })

    it('user Y pledge 60 tokens for feature B', async function () {
      const [owner, creator, userX, userY, userZ] = await ethers.getSigners()

      const tx = await roadfund
        .connect(userY)
        .pledge(roadmap.address, 1, 60, { value: expandToNDecimals(60, 15) })

      const rcpt = await tx.wait()
      const { channels } = await roadfund.getInfos(roadmap.address)

      expect(channels[1].totalAcquired).to.equal(70)
    })

    it('user Z pledge 30 tokens for feature B', async function () {
      const [owner, creator, userX, userY, userZ] = await ethers.getSigners()

      const tx = await roadfund
        .connect(userX)
        .pledge(roadmap.address, 1, 30, { value: expandToNDecimals(30, 15) })

      const rcpt = await tx.wait()
      const { channels } = await roadfund.getInfos(roadmap.address)
      expect(channels[1].totalAcquired).to.equal(100)
    })

    it('creator claim feature B', async function () {
      const [owner, creator] = await ethers.getSigners()

      const tx = await roadfund.connect(creator).claim(roadmap.address, 1)
      const rcpt = await tx.wait()
    })

    it('creator cannot re-claim before end of challenge duration', async function () {
      const [owner, creator] = await ethers.getSigners()

      await expect(
        roadfund.connect(creator).claim(roadmap.address, 1)
      ).to.be.revertedWith('not claimable')
    })

    it('user Z pledge 2 tokens for feature B', async function () {
      const [owner, creator, userX, userY, userZ] = await ethers.getSigners()

      const tx = await roadfund
        .connect(userX)
        .pledge(roadmap.address, 1, 2, { value: expandToNDecimals(2, 15) })

      const rcpt = await tx.wait()
      const { channels } = await roadfund.getInfos(roadmap.address)
      expect(channels[1].totalAcquired).to.equal(102)
    })

    it('creator close feature B (revert, not paying penalties)', async function () {
      const [owner, creator] = await ethers.getSigners()

      await increaseTime('10m')

      await expect(
        roadfund
          .connect(creator)
          .close(roadmap.address, 1, { value: expandToNDecimals(2.99, 15) })
      ).to.be.revertedWith('penalty unpaid')
    })

    it('creator close feature B (ok paid, 3 tokens penalties)', async function () {
      const [owner, creator] = await ethers.getSigners()

      await increaseTime('10m')

      // expect penalties to be paid
      await expect(() =>
        roadfund
          .connect(creator)
          .close(roadmap.address, 1, { value: expandToNDecimals(3, 15) })
      ).to.changeEtherBalance(owner, expandToNDecimals(3, 15))
    })
  })

  // *********** *********** *********** *********** *********** ***********

  describe('Using roadmap (claim successfully contested)', function () {
    let roadfund
    let roadmap
    let owner

    it('initialize project & add features A & B', async function () {
      void ({ roadfund, roadmap } = await loadFixture(
        deployRoadfundAndCreateProject
      ))

      const [owner, creator] = await ethers.getSigners()

      const tx1 = await roadfund.connect(creator).addFeature(
        roadmap.address,
        'feature A',
        'ipfs://',
        expandToNDecimals(1, 15), // 1 finney
        60 * 10 // 10 minutes challenge duration
      )
      await tx1.wait()

      const tx2 = await roadfund.connect(creator).addFeature(
        roadmap.address,
        'feature B',
        'ipfs://',
        expandToNDecimals(1, 15), // 1 finney
        60 * 10 // 10 minutes challenge duration
      )
      await tx2.wait()

      return expect(true).to.equal(true)

      //return expect(decoded.singleton).to.equal(rouge.address);
    })

    it('user X pledge 10 tokens for feature B', async function () {
      const [owner, creator, userX, userY, userZ] = await ethers.getSigners()

      const tx = await roadfund
        .connect(userX)
        .pledge(roadmap.address, 1, 10, { value: expandToNDecimals(10, 15) })

      const rcpt = await tx.wait()
      const { channels } = await roadfund.getInfos(roadmap.address)
      expect(channels[1].totalAcquired).to.equal(10)
    })

    it('user Y pledge 60 tokens for feature B', async function () {
      const [owner, creator, userX, userY, userZ] = await ethers.getSigners()

      const tx = await roadfund
        .connect(userY)
        .pledge(roadmap.address, 1, 60, { value: expandToNDecimals(60, 15) })

      const rcpt = await tx.wait()
      const { channels } = await roadfund.getInfos(roadmap.address)

      expect(channels[1].totalAcquired).to.equal(70)
    })

    it('user Z pledge 30 tokens for feature B', async function () {
      const [owner, creator, userX, userY, userZ] = await ethers.getSigners()

      const tx = await roadfund
        .connect(userX)
        .pledge(roadmap.address, 1, 30, { value: expandToNDecimals(30, 15) })

      const rcpt = await tx.wait()
      const { channels } = await roadfund.getInfos(roadmap.address)
      expect(channels[1].totalAcquired).to.equal(100)
    })

    it('creator claim feature B', async function () {
      const [owner, creator] = await ethers.getSigners()

      const tx = await roadfund.connect(creator).claim(roadmap.address, 1)
      const rcpt = await tx.wait()
    })

    it('user Z pledge 5 tokens for feature B', async function () {
      const [owner, creator, userX, userY, userZ] = await ethers.getSigners()

      const tx = await roadfund
        .connect(userX)
        .pledge(roadmap.address, 1, 5, { value: expandToNDecimals(5, 15) })

      const rcpt = await tx.wait()
      const { channels } = await roadfund.getInfos(roadmap.address)
      expect(channels[1].totalAcquired).to.equal(105)
    })

    it('user X pledge 10 tokens for feature B', async function () {
      const [owner, creator, userX, userY, userZ] = await ethers.getSigners()

      const tx = await roadfund
        .connect(userX)
        .pledge(roadmap.address, 1, 10, { value: expandToNDecimals(10, 15) })

      const rcpt = await tx.wait()
      const { channels } = await roadfund.getInfos(roadmap.address)
      expect(channels[1].totalAcquired).to.equal(115)
    })

    it('creator close feature B (revert, successful contest)', async function () {
      const [owner, creator] = await ethers.getSigners()

      await increaseTime('10m')

      // penalties would have been 150% of 15 tokens
      await expect(
        roadfund
          .connect(creator)
          .close(roadmap.address, 1, { value: expandToNDecimals(21.5, 15) })
      ).to.be.revertedWith('contested')
    })

    it('creator re-claim feature B again', async function () {
      const [owner, creator] = await ethers.getSigners()

      const tx = await roadfund.connect(creator).claim(roadmap.address, 1)
      const rcpt = await tx.wait()
    })

    it('creator close feature B (wait another challenge duration)', async function () {
      const [owner, creator] = await ethers.getSigners()

      await increaseTime('10m')

      const tx = await roadfund
        .connect(creator)
        .close(roadmap.address, 1, { value: expandToNDecimals(15, 15) })
    })
  })

  // *********** *********** *********** *********** *********** ***********

  describe('Using roadmap (edge cases)', function () {
    let roadfund
    let roadmap
    let owner

    it('initialize project & add features A & B', async function () {
      void ({ roadfund, roadmap } = await loadFixture(
        deployRoadfundAndCreateProject
      ))

      const [owner, creator] = await ethers.getSigners()

      const tx1 = await roadfund.connect(creator).addFeature(
        roadmap.address,
        'feature A',
        'ipfs://',
        expandToNDecimals(1, 15), // 1 finney
        60 * 10 // 10 minutes challenge duration
      )
      await tx1.wait()

      const tx2 = await roadfund.connect(creator).addFeature(
        roadmap.address,
        'feature B',
        'ipfs://',
        expandToNDecimals(1, 15), // 1 finney
        60 * 10 // 10 minutes challenge duration
      )
      await tx2.wait()

      return expect(true).to.equal(true)

      //return expect(decoded.singleton).to.equal(rouge.address);
    })

    it('creator claim feature A', async function () {
      const [owner, creator] = await ethers.getSigners()

      const tx = await roadfund.connect(creator).claim(roadmap.address, 0)
      const rcpt = await tx.wait()
    })

    it('creator close feature A (no pledge)', async function () {
      const [owner, creator] = await ethers.getSigners()

      await increaseTime('10m')

      expect((await roadfund.getInfos(roadmap.address)).open[0]).to.equal(true)

      await expect(() =>
        roadfund.connect(creator).close(roadmap.address, 0)
      ).to.changeEtherBalance(creator, expandToNDecimals(0, 15))

      expect((await roadfund.getInfos(roadmap.address)).open[0]).to.equal(false)
    })

    ///** ****************** */

    it('creator claim feature B', async function () {
      const [owner, creator] = await ethers.getSigners()

      const tx = await roadfund.connect(creator).claim(roadmap.address, 1)
      const rcpt = await tx.wait()
    })

    it('user Z pledge 3 tokens for feature B', async function () {
      const [owner, creator, userX, userY, userZ] = await ethers.getSigners()

      const tx = await roadfund
        .connect(userX)
        .pledge(roadmap.address, 1, 3, { value: expandToNDecimals(3, 15) })

      const rcpt = await tx.wait()
      const { channels } = await roadfund.getInfos(roadmap.address)
      expect(channels[1].totalAcquired).to.equal(3)
    })

    it('creator close feature B (revert, successful contest)', async function () {
      const [owner, creator] = await ethers.getSigners()

      await increaseTime('10m')

      await expect(
        roadfund
          .connect(creator)
          .close(roadmap.address, 1, { value: expandToNDecimals(4.5, 15) })
      ).to.be.revertedWith('contested')
    })

    it('creator re-claim feature B again', async function () {
      const [owner, creator] = await ethers.getSigners()

      const tx = await roadfund.connect(creator).claim(roadmap.address, 1)
      const rcpt = await tx.wait()
    })

    it('creator close feature B (wait another challenge duration)', async function () {
      const [owner, creator] = await ethers.getSigners()

      await increaseTime('10m')

      const tx = await roadfund
        .connect(creator)
        .close(roadmap.address, 1, { value: expandToNDecimals(4.5, 15) })
    })
  })
})
