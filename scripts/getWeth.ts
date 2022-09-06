import { ethers, getNamedAccounts } from "hardhat";

export const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // Mainnet WETH contract
export const AMOUNT = ethers.utils.parseEther("0.02");

export const getWeth = async () => {
    const { deployer } = await getNamedAccounts(); 
    const iWeth = await ethers.getContractAt("IWeth", wethTokenAddress, deployer);
    const tx = await iWeth.deposit({ value: AMOUNT });
    await tx.wait(1);

    const wethBalance = await iWeth.balanceOf(deployer);
    console.log(`Got ${wethBalance.toString()} WETH`);
}