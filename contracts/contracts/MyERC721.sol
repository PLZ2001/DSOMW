// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// MyERC721合约的所有对外函数
// 1. 获取用户的所有bonus信息
//    function getBonusInformation(address user) public view returns (uint[] memory, string[] memory, uint[] memory)
// 2. 获取用户是否可以获取某种TokenURI的bonus
//    function getWhetherUserCanGetBonusReward(address user, string memory tokenURI) public view returns (bool)
// 3. 继承于ERC721合约的所有对外函数（略）

contract MyERC721 is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds; // NFT计数器

    address manager; // 管理员，即DSOMW合约

    // 一个纪念品
    struct Bonus {
        uint itemId; // 纪念品的id
        string tokenURI; // 纪念品的URI
        uint awardTime; // 纪念品获得时间
    }

    // 所有纪念品
    struct Bonuses {
        mapping(address=>Bonus[]) getBonusWithAddress; // 由地址获取所拥有的纪念品
    }

    Bonuses private _bonuses;
    mapping(string => mapping(address => bool)) claimedGetBonusUserList; //已经领取指定TokenURI的用户名单


    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        manager = msg.sender; // DSOMW合约即管理员
    }

    // 给某用户发纪念品
    function awardItem(address user, string memory tokenURI) public {
        require(msg.sender == manager, "Only system can access awardItem function.");
        require(claimedGetBonusUserList[tokenURI][msg.sender] == false, "You have got this kind of bonus already");

        claimedGetBonusUserList[tokenURI][user] = true;
        // 由计数器获取现在最新的id
        uint256 newItemId = _tokenIds.current();
        // 给对应地址发对应的NFT
        _mint(user, newItemId);
        // 匹配uri和id的关系
        _setTokenURI(newItemId, tokenURI);
        // 计数器自增，准备下一次发NFT
        _tokenIds.increment();

        // 将新的纪念品记录下来
        Bonus memory newBonus = Bonus({itemId:newItemId,tokenURI:tokenURI,awardTime:block.timestamp});
        _bonuses.getBonusWithAddress[user].push(newBonus);
    }

    // 获取用户的所有bonus信息
    function getBonusInformation(address user) public view returns (uint[] memory, string[] memory, uint[] memory) {
        uint i;
        Bonus[] memory userBonuses = _bonuses.getBonusWithAddress[user];
        uint[] memory itemId = new uint[](userBonuses.length);
        string[] memory tokenURI = new string[](userBonuses.length);
        uint[] memory awardTime = new uint[](userBonuses.length);
        for (i = 0; i < userBonuses.length; i++) {
            itemId[i] = userBonuses[i].itemId;
            tokenURI[i] = userBonuses[i].tokenURI;
            awardTime[i] = userBonuses[i].awardTime;
        }
        return (itemId, tokenURI, awardTime);
    }

    // 获取用户是否可以获取某种TokenURI的bonus
    function getWhetherUserCanGetBonusReward(address user, string memory tokenURI) public view returns (bool) {
        return !claimedGetBonusUserList[tokenURI][user];
    }
}
