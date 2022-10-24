// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// MyERC20合约的所有对外函数
// 1. 每个用户仅有一次领取通证积分TP的机会
//    function getTP() public
// 2. 继承于ERC20合约的所有对外函数（略）

contract MyERC20 is ERC20 {

    uint private _initialUserTp;
    mapping(address => bool) claimedGetTpUserList; //已经领取通证积分TP的名单

    constructor(string memory name, string memory symbol, uint initialUserTp) ERC20(name, symbol) {
        _initialUserTp = initialUserTp;
    }

    // 每个用户仅有一次领取通证积分TP的机会
    function getTP() public {
        // 检查消息发起者是否已经领取过通证积分TP
        require(claimedGetTpUserList[msg.sender] == false, "You have got TP already");
        // 没有领取
        _mint(msg.sender, _initialUserTp);
        claimedGetTpUserList[msg.sender] = true;
    }
}
