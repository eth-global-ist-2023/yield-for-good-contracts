// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { ERC5192 } from "./ERC5192.sol";
import { IYieldForGoodSoulbound } from "./interfaces/IYieldForGoodSoulbound.sol";

/**
 * @title YieldForGood Soulbound NFT
 * @dev Yield For Good Soulbound NFT is minted to anyone who stakes in the YieldForGood contract.
 */
contract YieldForGoodSoulbound is IYieldForGoodSoulbound, ERC5192, Ownable {
    address public yfgAddress;
    uint256 public totalSupply;

    error UnauthorizedMint();

    /**
     * @dev Constructor to initialize the YieldForGood Soulbound contract.
     * @param name The name of the Soulbound NFT
     * @param symbol The symbol of the Soulbound NFT
     */
    constructor(string memory name, string memory symbol) ERC5192(name, symbol, true) Ownable(msg.sender) {}

    /**
     * @dev Sets the YFG  contract.
     * @param _yfgAddress The address of the YGF Soulbound.
     */
    function setYFG(address _yfgAddress) external onlyOwner {
        yfgAddress = _yfgAddress;
    }

    /**
     * @dev See {ERC721-mint}.
     */
    function mint(address to) public {
        if (msg.sender != address(yfgAddress)) revert UnauthorizedMint();

        uint256 tokenId = ++totalSupply;

        _safeMint(to, tokenId);
    }
}
