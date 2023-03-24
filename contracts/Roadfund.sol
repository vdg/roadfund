// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import 'hardhat/console.sol';

import '@openzeppelin/contracts/access/Ownable.sol';

import '@rougenetwork/v2-core/contracts/Rouge.sol';
import '@rougenetwork/v2-core/contracts/proxies/RougeProxyFactory.sol';
import '@rougenetwork/v2-core/contracts/proxies/RougeProxy.sol';

// Roadfund contract that extends Ownable from OpenZeppelin
contract Roadfund is Ownable {
  using Address for address payable;

  address public _factory;
  address public _singleton;

  // Minimum percentage to contest a feature claim
  uint256 public constant CONTEST_LIMIT = 12;

  // Cooling pledges % to give back as penalty when closing a feature
  uint256 public constant CONTEST_PENALTY = 150;

  uint48 public constant NFT_LIMIT = ~uint48(0); // 281,474,976,710,655
  uint16 public constant CHANNEL_LIMIT = ~uint16(0); // 65,535

  // Set Rouge factory and singleton addresses
  function setRouge(address factory, address singleton) public onlyOwner {
    _factory = factory;
    _singleton = singleton;
  }

  function getRouge() public returns (address factory, address singleton) {
    factory = _factory;
    singleton = _singleton;
  }

  // Constructor to initialize factory and singleton addresses
  constructor(address factory, address singleton) {
    setRouge(factory, singleton);
  }

  uint256 private _nonce;
  address payable _penaltiesReceipient;

  // Function to create a new roadmap (Rouge instance)
  function createRoadmap(
    string memory uri,
    address payable penaltiesReceipient
  ) public returns (RougeProxy proxy) {
    _nonce += 1;
    _penaltiesReceipient = penaltiesReceipient;

    // Create special admin authorization for the message sender
    uint16[] memory channels = new uint16[](1);
    channels[0] = CHANNEL_LIMIT;
    Rouge.Authorization[] memory auths = new Rouge.Authorization[](1);
    auths[0] = Rouge.Authorization({
      account: _msgSender(),
      selector: this.createRoadmap.selector,
      channels: channels,
      grant: true
    });

    // Create a RougeProxy instance and set up the initial state
    proxy = RougeProxyFactory(_factory).createProxyWithNonce(
      _singleton,
      abi.encodePacked(
        Rouge.setup.selector,
        abi.encode(address(this), uri, new Rouge.Channel[](0), auths)
      ),
      _nonce
    );

    // XXX debug
    // string memory v = Rouge(address(proxy)).VERSION();
    // console.log(
    //     "deploying new roadmap on %s from Rouge version %s",
    //     address(proxy),
    //     v
    // );

    return proxy;
  }

  // Internal function to grant or revoke the acquire authorization for a specific feature
  function grantFeature(Rouge rouge, uint16 channelId, bool grant) internal {
    uint16[] memory channels = new uint16[](1);
    channels[0] = channelId;
    Rouge.Authorization[] memory auths = new Rouge.Authorization[](1);
    auths[0] = Rouge.Authorization({
      account: address(0),
      selector: rouge.acquire.selector,
      channels: channels,
      grant: grant
    });
    rouge.updateAuthorizations(auths);
  }

  // Mappings to store feature information
  mapping(Rouge => mapping(uint16 => string)) private _featureName;
  mapping(Rouge => mapping(uint16 => uint256)) private _featureCooling;

  // Function to add a new feature to a roadmap (Rouge instance)
  function addFeature(
    Rouge rouge,
    string memory name,
    uint256 amount,
    uint256 cooling //Rouge.Channel calldata channel
  ) public {
    (, Rouge.Channel[] memory channels, ) = rouge.getInfos();

    // Check if the message sender is the roadmap creator
    require(
      rouge.hasRole(_msgSender(), this.createRoadmap.selector, CHANNEL_LIMIT)
    );

    // Add a new channel for the feature
    Rouge.Channel[] memory newChannels = new Rouge.Channel[](1);
    newChannels[0] = Rouge.Channel({
      supply: NFT_LIMIT,
      totalAcquired: 0,
      totalRedeemed: 0,
      token: address(0),
      amount: amount
    });
    rouge.addChannels(newChannels);

    // Grant the acquire authorization for the new feature
    grantFeature(rouge, uint16(channels.length), true);

    // Store the feature name and cooling period
    _featureName[rouge][uint16(channels.length)] = name;
    _featureCooling[rouge][uint16(channels.length)] = cooling;
  }

  // Mappings to store pledge information
  // XXX future optimisation, use total acquired ?
  mapping(Rouge => mapping(uint16 => uint16)) private _pledges;

  // Function to pledge funds to a specific feature
  function pledge(Rouge rouge, uint16 channelId, uint16 qty) public payable {
    Rouge.Acquisition[] memory pledges = new Rouge.Acquisition[](1);
    pledges[0] = Rouge.Acquisition({
      channelId: channelId,
      qty: qty,
      salt: 0,
      stamps: new bytes16[](0)
    });

    // Acquire the pledged tokens
    rouge.acquire{ value: msg.value }(pledges);

    // Update the internal pledge mapping
    _pledges[rouge][channelId] += qty;
  }

  // Mappings to store claim information
  mapping(Rouge => mapping(uint16 => uint256)) private _claimedAt;
  mapping(Rouge => mapping(uint16 => uint16)) private _claimedQty;

  // Function to claim funds for a specific feature
  function claim(Rouge rouge, uint16 channelId) public {
    // Check if the message sender is the roadmap creator
    require(
      rouge.hasRole(_msgSender(), this.createRoadmap.selector, CHANNEL_LIMIT)
    );

    _claimedAt[rouge][channelId] = block.timestamp;

    // TODO calculate a lower amount preventing malvolent creator ?

    _claimedQty[rouge][channelId] = _pledges[rouge][channelId];
  }

  // Function to close a specific feature and withdraw funds
  function close(Rouge rouge, uint16 channelId) public payable {
    // Check if the message sender is the roadmap creator
    require(
      rouge.hasRole(_msgSender(), this.createRoadmap.selector, CHANNEL_LIMIT)
    );

    // Ensure the feature is claimed and the cooling period has passed
    require(_claimedAt[rouge][channelId] > 0, 'not claimed');
    require(
      block.timestamp - _claimedAt[rouge][channelId] >=
        _featureCooling[rouge][channelId],
      'not time'
    );

    uint16 coolingPledges = _pledges[rouge][channelId] -
      _claimedQty[rouge][channelId];

    // Refuse to close contested features
    require(
      (100 * coolingPledges) / _pledges[rouge][channelId] < CONTEST_LIMIT,
      'contested'
    );

    (, Rouge.Channel[] memory channels, ) = rouge.getInfos();

    // Require penalty payment for closing the feature if coolingPledges exist
    require(
      msg.value >
        ((coolingPledges * CONTEST_PENALTY) / 100) * channels[channelId].amount,
      'penalty unpaid'
    );

    // Transfer the penalty payment (or tip) to the penalties recipient
    if (msg.value > 0) {
      _penaltiesReceipient.sendValue(msg.value);
    }
    console.log(
      'amount per pledge for [%s] =  %s  ',
      channels[channelId].amount
    );

    // Withdraw funds to the message sender
    rouge.widthdraw(
      payable(_msgSender()),
      _pledges[rouge][channelId] * channels[channelId].amount
    );

    // Revoke the acquire authorization for the closed feature
    grantFeature(rouge, channelId, false);
  }

  // Shortcut to get all infos we need onchain - aggregate Rouge instances + Roadfund
  function getInfos(
    Rouge rouge
  )
    public
    view
    returns (
      string memory uri,
      Rouge.Channel[] memory channels,
      string[] memory names,
      uint256[] memory cooling,
      uint256[] memory claimedAt,
      uint16[] memory claimedQty
    )
  {
    (uri, channels, ) = rouge.getInfos();

    string[] memory names_ = new string[](channels.length);
    uint256[] memory cooling_ = new uint256[](channels.length);

    uint256[] memory at_ = new uint256[](channels.length);
    uint16[] memory qty_ = new uint16[](channels.length);

    for (uint16 i = 0; i < channels.length; i++) {
      names_[i] = _featureName[rouge][i];
      cooling_[i] = _claimedAt[rouge][i];
      at_[i] = _claimedQty[rouge][i];
    }
    names = names_;
    cooling = cooling_;
    claimedAt = at_;
    claimedQty = qty_;
  }
}
