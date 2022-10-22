// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyERC20 is ERC20 {

    mapping(address => bool) claimedGetTPPlayerList;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {

    }

    // 每个用户仅有一次领取通证积分TP的机会
    function getTP() external {
        // 检查消息发起者是否已经领取过通证积分TP
        require(claimedGetTPPlayerList[msg.sender] == false, "This user has got TP already");
        // 没有领取
        _mint(msg.sender, 10000);
        claimedGetTPPlayerList[msg.sender] = true;
    }
}
