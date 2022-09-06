import { BigNumber } from "ethers";
import { ethers, getNamedAccounts } from "hardhat";
import { Address } from "hardhat-deploy/dist/types";
import { AMOUNT, getWeth, wethTokenAddress } from "./getWeth";

const lendingPoolAddressProviderAddress = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
const daiEthDataFeedAddress = "0x773616E4d11A78F511299002da57A0a94577F1f4";
const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

async function main() {
  await getWeth();

  const { deployer } = await getNamedAccounts();
  const lendingPool = await getLendingPool(deployer);
  console.log("Lending pool address: ", lendingPool.address);

  await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer);
  console.log("depositing...");
  await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
  console.log("Deposited!");

  const { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer);
  const daiPrice = await getDaiPrice();
  const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber());
  const amountDaiToBorrowInWei = ethers.utils.parseEther(amountDaiToBorrow.toString());
  await borrowDai(daiTokenAddress, lendingPool, amountDaiToBorrowInWei, deployer);
  await getBorrowUserData(lendingPool, deployer); 

  await repay(daiTokenAddress, lendingPool, amountDaiToBorrowInWei, deployer);
  await getBorrowUserData(lendingPool, deployer);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const repay = async (daiAddress: Address, lendingPool: any, amountDaiToRepayInWei: BigNumber, account: Address) => {
    await approveErc20(daiAddress, lendingPool.address, amountDaiToRepayInWei, account);
    const repayTx = await lendingPool.repay(daiAddress, amountDaiToRepayInWei, 1, account); 
    await repayTx.wait(1);
    console.log('You have repaid some DAI!');
}

const borrowDai = async (daiAddress: Address, lendingPool: any, amountDaiToBorrowInWei: BigNumber, account: Address) => {
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrowInWei, 1, 0, account);
    await borrowTx.wait(1);
    console.log('You have borrowed some DAI!');
}

const getDaiPrice = async () => {
    const daiEthPriceFeed = await ethers.getContractAt("AggregatorV3Interface", daiEthDataFeedAddress);
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price.toString()}`)
    return price
}

const getBorrowUserData = async (lendingPool: any, account: Address) => {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } = await lendingPool.getUserAccountData(account);
    console.log(`You have ${totalCollateralETH} worth of eth deposited.`);
    console.log(`You have ${totalDebtETH} worth of eth borrowed.`);
    console.log(`You can borrow ${availableBorrowsETH} worth of eth.`);
    return { availableBorrowsETH, totalDebtETH };
};

const getLendingPool = async (account: Address) => {
    const lendingPoolAddressesProvider = await ethers.getContractAt("ILendingPoolAddressesProvider", lendingPoolAddressProviderAddress, account);
    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool();
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account);
    return lendingPool;
};

const approveErc20 = async (erc20Address: Address, spenderAddress: Address, amountToSpend: BigNumber, account: Address) => {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account);
    const tx = await erc20Token.approve(spenderAddress, amountToSpend);
    await tx.wait(1);
    console.log("Approved!");
};