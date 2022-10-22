// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GameItem is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("Bonus", "BNS") {}

    // 给某用户发纪念品
    function awardItem(address player, string memory tokenURI) public returns (uint256)
    {
        //获取现在最新的id
        uint256 newItemId = _tokenIds.current();
        //给对应地址发对应的NFT
        _mint(player, newItemId);
        //匹配uri和id的关系
        _setTokenURI(newItemId, tokenURI);
        //id增加，准备下一次发行NFT
        _tokenIds.increment();
        return newItemId;
    }
}
