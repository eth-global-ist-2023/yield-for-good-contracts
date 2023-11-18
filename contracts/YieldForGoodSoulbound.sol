// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {ERC5192} from "./ERC5192.sol";
import {IYieldForGoodSoulbound} from "./interfaces/IYieldForGoodSoulbound.sol";

contract YieldForGoodSoulbound is IYieldForGoodSoulbound, ERC5192, Ownable {
    address public yfgAddress;
    uint256 public totalSupply;

    error UnauthorizedMint();

    constructor(string memory name, string memory symbol) ERC5192(name, symbol, true) Ownable(msg.sender) {}

    function setYFG(address _yfgAddress) external onlyOwner {
        yfgAddress = _yfgAddress;
    }

    function mint(address to) public {
        if (msg.sender != address(yfgAddress)) revert UnauthorizedMint();

        uint256 tokenId = ++totalSupply;

        _safeMint(to, tokenId);
    }
}
