import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { IMG_1 } from "./img_1";
import { IMG_2 } from "./img_2";
import { IMG_3 } from "./img_3";

task("task:deploy").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  const yfgFactory = await ethers.getContractFactory("YieldForGood");
  const yfgContract = await yfgFactory.connect(deployer).deploy();
  await yfgContract.waitForDeployment();
  console.log("YFG deployed to: ", await yfgContract.getAddress());

  const svgImagesFactory = await ethers.getContractFactory("SVGImages");
  const svgImagesContract = await svgImagesFactory.connect(deployer).deploy();
  await svgImagesContract.waitForDeployment();
  const svgImagesContractAddress = await svgImagesContract.getAddress();
  console.log("SvgImages deployed to: ", await svgImagesContract.getAddress());

  const yfgSbFactory = await ethers.getContractFactory("YieldForGoodSoulBound");
  const yfgSbContract = await yfgSbFactory
    .connect(deployer)
    .deploy("Yield For Good Proof of Contribution", "YFG PoC", svgImagesContractAddress);
  await yfgSbContract.waitForDeployment();
  const yfgSbContractAddress = await yfgSbContract.getAddress();
  console.log("YFG SB deployed to: ", await yfgSbContract.getAddress());

  const erc20Factory = await ethers.getContractFactory("MockERC20");
  const erc20Contract = await erc20Factory.connect(deployer).deploy("DAI", "DAI");
  await erc20Contract.waitForDeployment();
  const erc20ContractAddress = await erc20Contract.getAddress();
  console.log("ERC20 deployed to: ", await erc20Contract.getAddress());

  const stakingRewardsFactory = await ethers.getContractFactory("MockStakingRewards");
  const stakingRewardsContract = await stakingRewardsFactory
    .connect(deployer)
    .deploy(erc20ContractAddress, erc20ContractAddress, 31536000, 0);
  await stakingRewardsContract.waitForDeployment();
  const stakingRewardsContractAddress = await stakingRewardsContract.getAddress();
  console.log("StakingRewards deployed to: ", await stakingRewardsContract.getAddress());

  const vaultFactory = await ethers.getContractFactory("MockVault");
  const vaultContract = await vaultFactory
    .connect(deployer)
    .deploy(erc20ContractAddress, stakingRewardsContractAddress, "sDAI", "sDAI");
  await vaultContract.waitForDeployment();
  const vaultContractAddress = await vaultContract.getAddress();
  console.log("Vault deployed to: ", await vaultContract.getAddress());

  await yfgContract.updateSupportedYieldSource(vaultContractAddress, true);

  await yfgContract.createPool(
    vaultContractAddress,
    "Unicef Green Trees",
    "Help fight climate change",
    "https://jpmas.com.ni/wp-content/uploads/2022/12/unice-ask-money-climate-change.jpg",
  );

  await svgImagesContract.addImage(IMG_1, 0);
  await svgImagesContract.addImage(IMG_2, 1);
  await svgImagesContract.addImage(IMG_3, 2);

  await yfgContract.setYFGSoulbound(yfgSbContractAddress);
  await yfgSbContract.setYFG(yfgSbContractAddress);

  const pool = await yfgContract.pools(1);
  console.log("Pool: ", pool);
});
