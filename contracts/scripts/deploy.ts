import { ethers } from "hardhat";

async function main() {
  const DSOMW = await ethers.getContractFactory("DSOMW");
  const DSOMW_obj = await DSOMW.deploy(3600, 3, 1000, 100, 10000);
  await DSOMW_obj.deployed();
  console.log(`DSOMW contract has been deployed successfully in ${DSOMW_obj.address}`);
  const erc20 = await DSOMW_obj._TP();
  console.log(`erc20 contract has been deployed successfully in ${erc20}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
