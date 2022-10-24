// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// MyERC721合约的所有对外函数
// 1. 获取某用户的所有bonus信息
//    function getBonusInformation(address user) public view returns (uint[] memory, string[] memory, uint[] memory)
// 2. 继承于ERC721合约的所有对外函数（略）

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

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        manager = msg.sender; // DSOMW合约即管理员
    }

    // 给某用户发纪念品
    function awardItem(address user, string memory tokenURI) public {
        require(msg.sender == manager, "Only system can access awardItem function.");

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

    // 获取某用户的所有bonus信息
    function getBonusInformation(address user) public view returns (uint[] memory, string[] memory, uint[] memory) {
        uint[] memory itemId;
        string[] memory tokenURI;
        uint[] memory awardTime;
        uint cnt = 0;
        uint i;
        Bonus[] memory userBonuses = _bonuses.getBonusWithAddress[user];
        for (i = 0; i < userBonuses.length; i++) {
            itemId[cnt] = userBonuses[i].itemId;
            tokenURI[cnt] = userBonuses[i].tokenURI;
            awardTime[cnt] = userBonuses[i].awardTime;
            cnt++;
        }

        return (itemId, tokenURI, awardTime);
    }
}
