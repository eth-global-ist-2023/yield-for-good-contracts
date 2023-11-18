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
  const yfgContractAddress = await yfgContract.getAddress();
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
  const erc20Contract = await erc20Factory.connect(deployer).deploy("USDC", "USDC");
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

  await erc20Contract.mint(stakingRewardsContractAddress, "1000000000000000000000000000");
  await stakingRewardsContract.notifyRewardAmount("1000000000000000000000000000");

  const vaultFactory = await ethers.getContractFactory("MockVault");
  const vaultContract = await vaultFactory
    .connect(deployer)
    .deploy(erc20ContractAddress, stakingRewardsContractAddress, "sUSDC", "sUSDC");
  await vaultContract.waitForDeployment();
  const vaultContractAddress = await vaultContract.getAddress();
  console.log("Vault deployed to: ", await vaultContract.getAddress());

  await yfgContract.updateSupportedYieldSource(vaultContractAddress, true);

  await yfgContract.createPool(
    vaultContractAddress,
    "CHILDREN FACING A WATER CRISIS NEED YOUR HELP",
    "UNICEF launched the Water Under Fire campaign to draw global attention to three fundamental areas where changes are urgently needed to secure access to safe and sustainable water and sanitation in fragile contexts.",
    "https://unicef.or.th/donate/uploads/a46VODlzGrEoRRhmjpe8qlfanSctMKsba4KrZBlh.png",
  );

  await yfgContract.createPool(
    vaultContractAddress,
    "Protect the World's Forests",
    "For years, deforestation has been creeping into our home. Our fridge. Our lunch. Our coffee and the paper cups it comes in.",
    "https://wwfeu.awsassets.panda.org/img/original/wwf_t4f_email_signature_jaguar_1200x630__1_.png",
  );

  await yfgContract.createPool(
    vaultContractAddress,
    "Connect Capital to Communities that Need it the Most",
    "It is vital to connect with communities in need for capital to improve their life.",
    "https://images.prismic.io/impact-market/ed9a450e-df79-49ff-ae5e-1c35e2b361a2_seoimage.jpg?auto=compress,format",
  );

  await yfgContract.createPool(
    vaultContractAddress,
    "Connect Capital to Communities that Need it the Most",
    "If you ever visited Wikipedia, you might have seen a message asking you for a small donation. That is because Wikipedia and the 12 other free knowledge projects that are operated by the Wikimedia Foundation are made possible mostly by donations from individual donors like you. Watch to learn more.",
    "https://i.ytimg.com/vi/DkTj2NHKITE/maxresdefault.jpg",
  );

  await yfgContract.createPool(
    vaultContractAddress,
    "Creates new opportunities for girls and gender nonconforming youth of color",
    "Black girls and gender nonconforming youth of color can power the future. Their code gets us there. We support their creativity and boldness with skills, training, and resources that launch their leadership.",
    "https://i.ytimg.com/vi/rFKVTNoegAY/maxresdefault.jpg",
  );

  await svgImagesContract.addImage(IMG_1, 0);
  await svgImagesContract.addImage(IMG_2, 1);
  await svgImagesContract.addImage(IMG_3, 2);

  await yfgContract.setYFGSoulbound(yfgSbContractAddress);
  await yfgSbContract.setYFG(yfgContractAddress);

  const pool = await yfgContract.pools(1);
  console.log("Pool: ", pool);
});
