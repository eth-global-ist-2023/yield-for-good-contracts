// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IERC5192 } from "./interfaces/IERC5192.sol";

abstract contract ERC5192 is ERC721URIStorage, IERC5192 {
    bool private _locked;

    error TransferLocked();

    constructor(string memory name, string memory symbol, bool isLocked) ERC721(name, symbol) {
        _locked = isLocked;
    }

    function locked(uint256 tokenId) external view virtual returns (bool) {
        _requireOwned(tokenId);
        return _locked;
    }

    function _checkLockStatus() private view {
        if (_locked) revert TransferLocked();
    }

    function approve(address to, uint256 tokenId) public virtual override(ERC721, IERC721) {
        _checkLockStatus();
        super.approve(to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public virtual override(ERC721, IERC721) {
        _checkLockStatus();
        super.setApprovalForAll(operator, approved);
    }

    function transferFrom(address from, address to, uint256 tokenId) public virtual override(ERC721, IERC721) {
        _checkLockStatus();
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override(ERC721, IERC721) {
        _checkLockStatus();
        super.safeTransferFrom(from, to, tokenId, data);
    }
}
