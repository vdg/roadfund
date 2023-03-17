// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

import "@rougenetwork/v2-core/contracts/Rouge.sol";
import "@rougenetwork/v2-core/contracts/proxies/RougeProxyFactory.sol";
import "@rougenetwork/v2-core/contracts/proxies/RougeProxy.sol";

contract Roadfund is Ownable {
    address public _factory;
    address public _singleton;

    function setRouge(address factory, address singleton) public onlyOwner {
        _factory = factory;
        _singleton = singleton;
    }

    constructor(address factory, address singleton) {
        setRouge(factory, singleton);
    }

    function createRoadmap(
        bytes memory initializer,
        uint256 saltNonce
    ) public returns (RougeProxy proxy) {
        proxy = RougeProxyFactory(_factory).createProxyWithNonce(
            _singleton,
            initializer,
            saltNonce
        );

        // XXX debug
        string memory v = Rouge(address(proxy)).VERSION();
        console.log(
            "deploying new roadmap on %s from Rouge version %s",
            address(proxy),
            v
        );

        return proxy;
    }

    // TODO: later ownership management
    function addFeature(
        Rouge rouge,
        string memory name,
        Rouge.Channel calldata channel
    ) public {
        (string memory uri, Rouge.Channel[] memory channels, ) = rouge
            .getInfos();

        // You can now use uri and channels variables in the rest of the function
        console.log(uri, channels.length);
        Rouge.Channel[] memory newChannels = new Rouge.Channel[](1);
        newChannels[0] = channel;
        rouge.addChannels(newChannels);
    }
}
