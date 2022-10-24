import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const test = async function () {
  const deploy = async function() {
    const [owner, otherAccount] = await ethers.getSigners(); //获取自己账户对象和其他账户对象

    const DSOMW = await ethers.getContractFactory("DSOMW"); //获取合约
    const DSOMW_obj = await DSOMW.deploy(3600, 3, 1000, 100, 10000); //部署合约，获取合约对象

    return {DSOMW_obj, otherAccount}; // 返回合约对象
  }
  const {DSOMW_obj, otherAccount} = await loadFixture(deploy);
  await expect(DSOMW_obj.connect(otherAccount).addNewProposal("haha")).to.be.revertedWith("DSOMW don't have allowance over your TP. Please authorize DSOMW");
};
it("测试",test);