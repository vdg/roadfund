// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

//import 'hardhat/console.sol';

import '@openzeppelin/contracts/access/Ownable.sol';

import '@rougenetwork/v2-core/contracts/Rouge.sol';
import '@rougenetwork/v2-core/contracts/proxies/RougeProxyFactory.sol';
import '@rougenetwork/v2-core/contracts/proxies/RougeProxy.sol';

// Roadfund contract that extends Ownable from OpenZeppelin
contract Roadfund is Ownable {
  using Address for address payable;

  address public _factory;
  address public _singleton;

  uint48 public constant NFT_LIMIT = ~uint48(0); // 281,474,976,710,655
  uint16 public constant CHANNEL_LIMIT = ~uint16(0); // 65,535

  // the 3 constants below gouvern the game theory of the contract

  // Percentage of challenge pledges to be given back as a penalty when closing a feature
  uint256 public constant CHALLENGE_PENALTY = 150;

  // limit for a substantially challenged feature to be considered contested
  uint256 public constant CONTEST_LIMIT = 12;

  // Percentage of the challenge pledges to keep in the next claim cycle
  uint256 public constant RECLAIM_THRESHOLD = 33;

  // Set Rouge factory and singleton addresses
  function setRouge(address factory, address singleton) public onlyOwner {
    _factory = factory;
    _singleton = singleton;
  }

  function getRouge() public view returns (address factory, address singleton) {
    factory = _factory;
    singleton = _singleton;
  }

  // Constructor to initialize factory and singleton addresses
  constructor(address factory, address singleton) {
    setRouge(factory, singleton);
  }

  uint256 private _nonce;

  mapping(Rouge => address payable) private _creator;
  mapping(Rouge => address payable) private _penaltiesRecipient;

  // Function to create a new roadmap (Rouge instance)
  function createRoadmap(
    string memory uri,
    address payable penaltiesRecipient
  ) public returns (RougeProxy proxy) {
    _nonce += 1;

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

    _creator[Rouge(address(proxy))] = payable(_msgSender());
    _penaltiesRecipient[Rouge(address(proxy))] = penaltiesRecipient;

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
  mapping(Rouge => mapping(uint16 => string)) private _featureURI;
  mapping(Rouge => mapping(uint16 => uint256))
    private _featureChallengeDuration;

  // Function to add a new feature to a roadmap (Rouge instance)
  function addFeature(
    Rouge rouge,
    string memory name,
    string memory uri,
    uint256 amount,
    uint256 challenge
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

    // Store the feature name, uri and challenge duration
    _featureName[rouge][uint16(channels.length)] = name;
    _featureURI[rouge][uint16(channels.length)] = uri;
    _featureChallengeDuration[rouge][uint16(channels.length)] = challenge;
  }

  // Mappings to store pledge information
  // XXX future optimisation, use total acquired only ?
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
  mapping(Rouge => mapping(uint16 => uint16)) private _claimedThreshold;

  // Function to claim funds for a specific feature
  function claim(Rouge rouge, uint16 channelId) public {
    // Check if the message sender is the roadmap creator
    require(
      rouge.hasRole(_msgSender(), this.createRoadmap.selector, CHANNEL_LIMIT),
      'not creator'
    );

    // Ensure the feature is not claimed or the challenge duration has passed
    require(
      _claimedAt[rouge][channelId] == 0 ||
        block.timestamp - _claimedAt[rouge][channelId] >=
        _featureChallengeDuration[rouge][channelId],
      'not claimable'
    );

    _claimedAt[rouge][channelId] = block.timestamp;

    if (_claimedThreshold[rouge][channelId] > 0) {
      // raising threshold a bit so feature may be closed again, but new challenge duration start and easier to re-contest
      _claimedThreshold[rouge][channelId] =
        _claimedThreshold[rouge][channelId] +
        ((_pledges[rouge][channelId] - _claimedThreshold[rouge][channelId]) *
          uint16(RECLAIM_THRESHOLD)) /
        100;
    } else {
      _claimedThreshold[rouge][channelId] = _pledges[rouge][channelId];
    }
  }

  // Function to close a specific feature and withdraw funds
  function close(Rouge rouge, uint16 channelId) public payable {
    // Check if the message sender is the roadmap creator
    require(
      rouge.hasRole(_msgSender(), this.createRoadmap.selector, CHANNEL_LIMIT)
    );

    // Ensure the feature is claimed and the challenge duration has passed
    require(_claimedAt[rouge][channelId] > 0, 'not claimed');
    require(
      block.timestamp - _claimedAt[rouge][channelId] >=
        _featureChallengeDuration[rouge][channelId],
      'not time'
    );

    uint16 challengePledges = _pledges[rouge][channelId] -
      _claimedThreshold[rouge][channelId];

    // if (_pledges[rouge][channelId] > 0) {
    //   console.log(
    //               'challengePledges = %s (%s%%)',
    //               challengePledges,
    //               (100 * challengePledges) / _pledges[rouge][channelId]
    //               );
    // }

    // Refuse to close contested features
    require(
      _pledges[rouge][channelId] == 0 ||
        (100 * challengePledges) / _pledges[rouge][channelId] < CONTEST_LIMIT,
      'contested'
    );

    (, Rouge.Channel[] memory channels, ) = rouge.getInfos();

    // Require penalty payment for closing the feature if challengePledges exist
    require(
      msg.value >=
        ((challengePledges * CHALLENGE_PENALTY) / 100) *
          channels[channelId].amount,
      'penalty unpaid'
    );

    // Transfer the penalty payment (or tip) to the penalties recipient
    if (msg.value > 0) {
      _penaltiesRecipient[rouge].sendValue(msg.value);
    }

    // Withdraw funds to the message sender
    rouge.widthdraw(
      payable(_msgSender()),
      _pledges[rouge][channelId] * channels[channelId].amount
    );

    // Revoke the acquire authorization for the closed feature
    grantFeature(rouge, channelId, false);
  }

  // Function to get all local state for a roadmap
  function getFeatures(
    Rouge rouge,
    uint256 max
  )
    internal
    view
    returns (
      string[] memory names,
      string[] memory featureURI,
      uint256[] memory challenge
    )
  {
    string[] memory names_ = new string[](max);
    string[] memory uri_ = new string[](max);
    uint256[] memory challenge_ = new uint256[](max);

    for (uint16 i = 0; i < max; i++) {
      names_[i] = _featureName[rouge][i];
      uri_[i] = _featureURI[rouge][i];
      challenge_[i] = _featureChallengeDuration[rouge][i];
    }
    return (names_, uri_, challenge_);
  }

  // Function to get all local state for a roadmap
  function getFeaturesState(
    Rouge rouge,
    uint256 max
  )
    internal
    view
    returns (
      bool[] memory open,
      uint256[] memory claimedAt,
      uint16[] memory claimedThreshold
    )
  {
    bool[] memory open_ = new bool[](max);
    uint256[] memory at_ = new uint256[](max);
    uint16[] memory threshold_ = new uint16[](max);

    for (uint16 i = 0; i < max; i++) {
      open_[i] = rouge.isEnabled(rouge.acquire.selector, i);
      at_[i] = _claimedAt[rouge][i];
      threshold_[i] = _claimedThreshold[rouge][i];
    }
    return (open_, at_, threshold_);
  }

  // Shortcut to get all infos we need onchain - aggregate Rouge instances + Roadfund
  function getInfos(
    Rouge rouge
  )
    public
    view
    returns (
      address creator,
      string memory uri,
      Rouge.Channel[] memory channels,
      address penaltiesRecipient,
      bool[] memory open,
      string[] memory names,
      string[] memory featureURI,
      uint256[] memory challenge,
      uint256[] memory claimedAt,
      uint16[] memory claimedThreshold
    )
  {
    creator = _creator[rouge];
    (uri, channels, ) = rouge.getInfos();
    penaltiesRecipient = _penaltiesRecipient[rouge];

    (names, featureURI, challenge) = getFeatures(rouge, channels.length);
    (open, claimedAt, claimedThreshold) = getFeaturesState(
      rouge,
      channels.length
    );
  }
}
