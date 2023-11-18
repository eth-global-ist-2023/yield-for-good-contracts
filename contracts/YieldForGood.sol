// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IYieldForGood} from "./interfaces/IYieldForGood.sol";
import {IYieldForGoodSoulbound} from "./interfaces/IYieldForGoodSoulbound.sol";

contract YieldForGood is IYieldForGood, Ownable {

    mapping(uint256 => Pool) public pools;
    mapping(address => bool) public supportedYieldSources;

    uint256 public lastPoolId;
    address public yfgSoulbound;

    constructor() Ownable(msg.sender) {}

    function getAccruedYieldForPool(uint256 poolId)
        external
        view
        returns (uint256 accruedYield, address underlyingAsset)
    {
        Pool storage pool = pools[poolId];

        uint256 sharesToAsset = IERC4626(pool.yieldSource).previewRedeem(pool.totalSharesDelegated);

        (sharesToAsset > pool.totalAssetPrincipal)
            ? accruedYield = sharesToAsset - pool.totalAssetPrincipal
            : accruedYield = 0;

        underlyingAsset = pool.asset;
    }

    function getUserPrincipal(uint256 poolId, address user) external view returns (uint256 userPrincipal) {
        userPrincipal = pools[poolId].userPrincipal[user];
    }

    function enter(uint256 poolId, uint256 amount) external {
        Pool storage pool = pools[poolId];

        if (pool.userPrincipal[msg.sender] == 0 && !pool.userParticipated[msg.sender]) {

            IYieldForGoodSoulbound(yfgSoulbound).mint(msg.sender);

            pool.userParticipated[msg.sender] = true;
        }

        IERC20(pool.asset).transferFrom(msg.sender, address(this), amount);

        uint256 shares = IERC4626(pool.yieldSource).deposit(amount, address(this));

        pool.totalSharesDelegated += shares;

        pool.totalAssetPrincipal += amount;

        pool.userPrincipal[msg.sender] += amount;

    }

    function exit(uint256 poolId, uint256 amount) external {
        Pool storage pool = pools[poolId];

        uint256 shares = IERC4626(pool.yieldSource).withdraw(amount, address(this), address(this));

        pool.totalSharesDelegated -= shares;

        pool.totalAssetPrincipal -= amount;

        pool.userPrincipal[msg.sender] -= amount;

        IERC20(pool.asset).transfer(msg.sender, amount);

    }

    function createPool(address yieldSource) external {

        ++lastPoolId;

        uint256 poolId = lastPoolId;
        address underlyingAsset = IERC4626(yieldSource).asset();

        pools[poolId].poolOwner = msg.sender;
        pools[poolId].yieldSource = yieldSource;
        pools[poolId].asset = underlyingAsset;

        IERC20(underlyingAsset).approve(yieldSource, type(uint256).max);

    }

    function claimYield(uint256 poolId) external returns (uint256 yieldForClaim) {
        Pool storage pool = pools[poolId];

        uint256 sharesToAsset = IERC4626(pool.yieldSource).previewRedeem(pool.totalSharesDelegated);

        (sharesToAsset > pool.totalAssetPrincipal)
            ? yieldForClaim = sharesToAsset - pool.totalAssetPrincipal
            : yieldForClaim = 0;

        IERC4626(pool.yieldSource).withdraw(yieldForClaim, address(this), address(this));

        pool.totalSharesDelegated = IERC4626(pool.yieldSource).convertToShares(pool.totalAssetPrincipal);

        IERC20(pool.asset).transfer(msg.sender, yieldForClaim);

    }

    function updateSupportedYieldSource(address yieldSource, bool isSupported) external onlyOwner {

        supportedYieldSources[yieldSource] = isSupported;

    }

    function setYFGSoulbound(address _yfgSoulbound) external onlyOwner {
        yfgSoulbound = _yfgSoulbound;
    }

}
