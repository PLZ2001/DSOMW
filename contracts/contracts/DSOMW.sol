// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./MyERC20.sol";
import "./MyERC721.sol";
import "./StringHelper.sol";

// DSOMW合约的所有对外函数
// **提案**
// 1. 发起一个新提案
//    function addNewProposal(string calldata content, uint startTime, uint endTime) public
// 2. 获取所有提案的id
//    function getProposalIds() public view returns (uint[] memory)
// 3. 获取用户的所有提案的id
//    function getUserProposalIds() public view returns (uint[] memory)
// 4. 获取指定id的提案信息
//    function getProposalInformation(uint id, uint timeNow) public view returns (string memory, address, uint, uint)
// 5. 获取发布提案需要消耗的通证积分TP
//    function getTpConsumedByProposal() public view returns (uint)
// 6. 获取提案状态
//    function getProposalStatus(uint id) public view returns (ProposalStatus)
// 7. 获取提案状态（使用外部传入的时间戳）
//    function getProposalStatus(uint id, uint timeNow) public view returns (ProposalStatus)
// 8. 获取用户是否可以领取通证积分奖励
//    function getWhetherUserCanGetTpReward(uint id, uint timeNow) public view returns (bool)
// 9. 获取通证积分奖励
//    function getTpRewardFromProposalApproved(uint id) public
// 10.获取用户是否可以领取纪念品奖励
//    function getWhetherUserCanGetBonusReward(uint timeNow) public view returns (bool)
// 11.获取纪念品奖励
//    function getBonusReward() public
// **投票**
// 1. 发起一个新投票
//    function voteOnProposal(uint userVote, uint id) public
// 2. 获取用户投票信息
//    function getUserVotesInformation() public view returns (uint[] memory, uint[] memory, uint[] memory)
// 3. 获取指定id的提案的投票信息（有访问限制）
//    function getProposalVotesInformation(uint id, uint timeNow) public view returns (uint[] memory, uint[] memory, address[] memory)
// 4. 获取所有用户的地址
//    function getUserAddresses() public view returns (address[] memory)
// 5. 获取最大投票次数
//    function getMaxVotingTimes() public view returns (uint)
// 6. 获取投票需要消耗的通证积分TP
//    function getTpConsumedByVote() public view returns (uint)

contract DSOMW {
    using Counters for Counters.Counter;

    // 一个提案
    struct Proposal {
        uint id; // 提案id
        string content; // 提案内容
        address proposer; // 提案发起人
        uint voteStartTime; // 提案投票开始时间
        uint voteEndTime; // 提案投票结束时间
        bool isTpRewardGotten; // 用来表示通证积分奖励是否已经被领取
        bool isValid; // 用来表示该提案是否存在，防止读取不存在的提案
    }
    // 所有提案
    struct Proposals {
        mapping(uint=>Proposal) getProposalWithId; // 所有提案对象
        uint[] proposalIds; // 存储所有提案的id
        uint tpConsumedByProposal; // 发起提案需要消耗的通证积分TP
        Counters.Counter proposalIdCounter; // 提案id计数器
    }
    // 提案状态
    enum ProposalStatus {
        isBeingVotedOn, // 正在投票中
        isRejected, // 投票已结束，拒绝
        isApproved, // 投票已结束，通过
        notStartYet // 投票还没开始
    }

    // 一个投票
    struct Vote {
        VoteBehavior behavior; // 投票状态
        address voter; // 投票发起人
        uint voteTime; // 投票发起时间
        uint proposalIdVotedOn; // 投票对象
    }
    // 所有投票
    struct Votes {
        mapping(address=>mapping(uint=>Vote[])) getVoteWithAddressAndId; // 所有投票信息
        address[] userAddresses; // 存储所有用户的地址
        uint maxVotingTimes; // 最大投票次数
        uint tpConsumedByVote; // 投票需要消耗的通证积分TP
    }
    // 投票状态
    enum VoteBehavior {
        reject, // 投票拒绝
        approve // 投票通过
    }

    // 变量
    Proposals private _proposals; // 存储所有提案的信息
    Votes private _votes; // 存储所有投票的信息
    MyERC20 public TP; //通证积分TokenPoint(TP)
    MyERC721 public BNS; //纪念品Bonus(BNS)

    constructor (uint maxVotingTimes, uint tpConsumedByProposal, uint tpConsumedByVote, uint initialUserTp) {
        _proposals.tpConsumedByProposal = tpConsumedByProposal; // 发起提案需要消耗的通证积分TP
        _votes.maxVotingTimes = maxVotingTimes; // 最大投票次数
        _votes.tpConsumedByVote = tpConsumedByVote; // 投票需要消耗的通证积分TP
        TP = new MyERC20("TokenPoint", "TP", initialUserTp); // 一键发币
        BNS = new MyERC721("Bonus", "BNS"); //一键发NFT
    }

    // 发起一个新提案
    function addNewProposal(string calldata content, uint startTime, uint endTime) public {
        require(startTime<endTime, "StartTime must be less than endTime.");
        require(endTime>block.timestamp, "EndTime must be time in the future.");
        require(TP.balanceOf(msg.sender) >= _proposals.tpConsumedByProposal, "Unable to afford a new proposal.");
        require(TP.allowance(msg.sender, address(this)) >= _proposals.tpConsumedByProposal, "DSOMW don't have allowance over your TP. Please authorize DSOMW.");

        TP.transferFrom(msg.sender, address(this), _proposals.tpConsumedByProposal); // 委托本合约把用户的通证积分TP转账给本合约（需要前端提前委托）

        uint newId = _proposals.proposalIdCounter.current(); // 获取新id
        Proposal memory newProposal = Proposal({id:newId, // 提案id
                                         content:content, // 提案内容
                                         proposer:msg.sender, // 提案发起人
                                         voteStartTime:startTime, // 提案投票开始时间
                                         voteEndTime:endTime, // 提案投票结束时间
                                         isTpRewardGotten:false,
                                         isValid:true}); // 用来表示该提案是否存在，防止读取不存在的提案
        _proposals.getProposalWithId[newId] = newProposal; // 添加一个提案
        _proposals.proposalIds.push(newId); // 添加一个新id
        _proposals.proposalIdCounter.increment(); // id自增

        uint i;
        bool isSenderInUserAddresses = false; // 检查当前提案人地址是否已经存储
        for (i = 0; i < _votes.userAddresses.length; i++) {
            if (_votes.userAddresses[i] == msg.sender) {
                isSenderInUserAddresses = true;
                break;
            }
        }
        if (!isSenderInUserAddresses) {
            _votes.userAddresses.push(msg.sender); // 添加一个新地址
        }

    }

    // 获取提案的所有id
    function getProposalIds() public view returns (uint[] memory) {
        return _proposals.proposalIds;
    }

    // 获取用户的提案的所有id
    function getUserProposalIds() public view returns (uint[] memory) {
        uint cnt = 0;
        uint i;
        for (i = 0; i < _proposals.proposalIds.length; i++) {
            if (_proposals.getProposalWithId[_proposals.proposalIds[i]].proposer == msg.sender) {
                cnt++;
            }
        }

        uint[] memory ids = new uint[](cnt);
        cnt = 0;
        for (i = 0; i < _proposals.proposalIds.length; i++) {
            if (_proposals.getProposalWithId[_proposals.proposalIds[i]].proposer == msg.sender) {
                ids[cnt] = _proposals.proposalIds[i];
                cnt++;
            }
        }

        return ids;
    }

    // 获取提案信息
    function getProposalInformation(uint id, uint timeNow) public view returns (string memory, address, uint, uint, uint) {
        require(_proposals.getProposalWithId[id].isValid == true, "This proposal doesn't exist.");

        uint status = uint(getProposalStatus(id, timeNow));
        string memory content = _proposals.getProposalWithId[id].content;
        address proposer = _proposals.getProposalWithId[id].proposer;
        uint voteStartTime = _proposals.getProposalWithId[id].voteStartTime;
        uint voteEndTime = _proposals.getProposalWithId[id].voteEndTime;

        return (content, proposer, voteStartTime, voteEndTime, status);
    }

    // 获取发布提案需要消耗的通证积分TP
    function getTpConsumedByProposal() public view returns (uint) {
        return _proposals.tpConsumedByProposal;
    }

    // 获取提案状态
    function getProposalStatus(uint id) public view returns (ProposalStatus) {
        require(_proposals.getProposalWithId[id].isValid == true, "This proposal doesn't exist.");

        // 检查是否超时
        if (block.timestamp > _proposals.getProposalWithId[id].voteEndTime) {
            // 已超时，统计投票情况
            uint numOfApproval = 0; // 赞成数量
            uint numOfRejection = 0; // 拒绝数量
            uint i;
            for (i = 0; i < _votes.userAddresses.length; i++) {
                Vote[] memory userVotes = _votes.getVoteWithAddressAndId[_votes.userAddresses[i]][id];
                if (userVotes.length > 0) {
                    // 说明当前用户对该提议投了票
                    Vote memory userVote = userVotes[userVotes.length-1];
                    if (userVote.behavior == VoteBehavior.approve) {
                        numOfApproval++;
                    } else if (userVote.behavior == VoteBehavior.reject) {
                        numOfRejection++;
                    }
                }
            }
            if (numOfApproval > numOfRejection) {
                // 提案通过
                return ProposalStatus.isApproved;
            } else {
                // 提案未通过
                return ProposalStatus.isRejected;
            }
        } else {
            if (block.timestamp < _proposals.getProposalWithId[id].voteStartTime) {
                // 提案投票还没开始
                return ProposalStatus.notStartYet;
            } else {
                // 提案正在投票
                return ProposalStatus.isBeingVotedOn;
            }
        }
    }

    // 获取提案状态（使用外部传入的时间戳）
    function getProposalStatus(uint id, uint timeNow) public view returns (ProposalStatus) {
        require(_proposals.getProposalWithId[id].isValid == true, "This proposal doesn't exist.");

        // 检查是否超时
        if (timeNow > _proposals.getProposalWithId[id].voteEndTime) {
            // 已超时，统计投票情况
            uint numOfApproval = 0; // 赞成数量
            uint numOfRejection = 0; // 拒绝数量
            uint i;
            for (i = 0; i < _votes.userAddresses.length; i++) {
                Vote[] memory userVotes = _votes.getVoteWithAddressAndId[_votes.userAddresses[i]][id];
                if (userVotes.length > 0) {
                    // 说明当前用户对该提议投了票
                    Vote memory userVote = userVotes[userVotes.length-1];
                    if (userVote.behavior == VoteBehavior.approve) {
                        numOfApproval++;
                    } else if (userVote.behavior == VoteBehavior.reject) {
                        numOfRejection++;
                    }
                }
            }
            if (numOfApproval > numOfRejection) {
                // 提案通过
                return ProposalStatus.isApproved;
            } else {
                // 提案未通过
                return ProposalStatus.isRejected;
            }
        } else {
            if (timeNow < _proposals.getProposalWithId[id].voteStartTime) {
                // 提案投票还没开始
                return ProposalStatus.notStartYet;
            } else {
                // 提案正在投票
                return ProposalStatus.isBeingVotedOn;
            }
        }
    }

    // 获取用户是否可以领取通证积分奖励
    function getWhetherUserCanGetTpReward(uint id, uint timeNow) public view returns (bool) {
        require(_proposals.getProposalWithId[id].isValid == true, "This proposal doesn't exist.");

        if(_proposals.getProposalWithId[id].proposer != msg.sender){ return false;}

        if (getProposalStatus(id, timeNow) == ProposalStatus.isApproved && _proposals.getProposalWithId[id].isTpRewardGotten == false){
            return true;
        } else {
            return false;
        }
    }

    // 获取通证积分奖励
    function getTpRewardFromProposalApproved(uint id) public {
        require(getWhetherUserCanGetTpReward(id, block.timestamp) == true, "You can't get TP reward for some reasons.");

        _proposals.getProposalWithId[id].isTpRewardGotten = true;
        // 统计投票情况
        uint numOfApproval = 0; // 赞成数量
        uint numOfRejection = 0; // 拒绝数量
        uint i;
        for (i = 0; i < _votes.userAddresses.length; i++) {
            Vote[] memory userVotes = _votes.getVoteWithAddressAndId[_votes.userAddresses[i]][id];
            if (userVotes.length > 0) {
                // 说明当前用户对该提议投了票
                Vote memory userVote = userVotes[userVotes.length-1];
                if (userVote.behavior == VoteBehavior.approve) {
                    numOfApproval++;
                } else if (userVote.behavior == VoteBehavior.reject) {
                    numOfRejection++;
                }
            }
        }
        // 给提案发起人发放奖励（给提案投票的人所交的所有通证积分TP+发起提案所交的通证积分TP）
        TP.transfer(_proposals.getProposalWithId[id].proposer, (numOfApproval + numOfRejection) * _votes.tpConsumedByVote + _proposals.tpConsumedByProposal);
    }

    // 获取用户是否可以领取纪念品奖励
    function getWhetherUserCanGetBonusReward(uint timeNow) public view returns (bool) {
        // 检查提案发起人成功提案的数目
        uint[] memory ids = getUserProposalIds();
        uint j;
        uint numOfProposalsApproved = 0;
        for (j = 0; j < ids.length; j++) {
            if (getProposalStatus(ids[j], timeNow) == ProposalStatus.isApproved) {
                numOfProposalsApproved++;
            }
        }
        // 检查提案发起人是否有3个以上的成功提案
        if (numOfProposalsApproved >= 3) {
            // 每3个提案发放一次纪念品
            uint numOfBonus = numOfProposalsApproved / 3;
            uint i;
            for (i = 1; i <= numOfBonus; i++) {
                // 检查是否已经领取过某种纪念品
                if (BNS.getWhetherUserCanGetBonusReward(msg.sender,StringHelper.sprintf("[Milestone With %u Proposals Approved]",i*3))) {
                    return true;
                } else {
                    continue;
                }
            }
            return false;
        } else {
            return false;
        }
    }

    // 获取纪念品奖励
    function getBonusReward() public {
        require(getWhetherUserCanGetBonusReward(block.timestamp) == true, "You can't get bonus reward for some reasons.");

        // 检查提案发起人成功提案的数目
        uint[] memory ids = getUserProposalIds();
        uint j;
        uint numOfProposalsApproved = 0;
        for (j = 0; j < ids.length; j++) {
            if (getProposalStatus(ids[j]) == ProposalStatus.isApproved) {
                numOfProposalsApproved++;
            }
        }
        // 检查提案发起人是否有3个以上的成功提案
        if (numOfProposalsApproved >= 3) {
            // 每3个提案发放一次纪念品
            uint numOfBonus = numOfProposalsApproved / 3;
            uint i;
            for (i = 1; i <= numOfBonus; i++) {
                // 检查是否已经领取过某种纪念品
                if (BNS.getWhetherUserCanGetBonusReward(msg.sender,StringHelper.sprintf("[Milestone With %u Proposals Approved]",i*3))) {
                    // 发放URI等于成功提案个数的纪念品
                    BNS.awardItem(msg.sender, StringHelper.sprintf("[Milestone With %u Proposals Approved]",i*3));
                } else {
                    continue;
                }
            }
        }
    }

    // 发起一个新投票
    function voteOnProposal(uint userVote, uint id) public {
        require(getProposalStatus(id) == ProposalStatus.isBeingVotedOn, "Unable to vote on this proposal because voting has closed.");
        require(_votes.getVoteWithAddressAndId[msg.sender][id].length < _votes.maxVotingTimes, "Unable to vote on this proposal because the maximum number of votes has been reached.");
        require(TP.balanceOf(msg.sender) >= _votes.tpConsumedByVote, "Unable to afford a new vote.");
        require(TP.allowance(msg.sender, address(this)) >= _votes.tpConsumedByVote, "DSOMW don't have allowance over your TP. Please authorize DSOMW.");

        TP.transferFrom(msg.sender, address(this), _votes.tpConsumedByVote); // 委托本合约把用户的通证积分TP转账给本合约（需要前端提前委托）

        Vote memory newVote = Vote({behavior:VoteBehavior(userVote), // 投票状态
                             voter:msg.sender, // 投票发起人
                             voteTime:block.timestamp, // 投票发起时间
                             proposalIdVotedOn:id}); // 投票对象
        _votes.getVoteWithAddressAndId[msg.sender][id].push(newVote); // 添加一个新投票

        uint i;
        bool isSenderInUserAddresses = false; // 检查当前投票人地址是否已经存储
        for (i = 0; i < _votes.userAddresses.length; i++) {
            if (_votes.userAddresses[i] == msg.sender) {
                isSenderInUserAddresses = true;
                break;
            }
        }
        if (!isSenderInUserAddresses) {
            _votes.userAddresses.push(msg.sender); // 添加一个新地址
        }
    }

    // 获取用户投票信息
    function getUserVotesInformation() public view returns (uint[] memory, uint[] memory, uint[] memory) {
        uint i;
        uint j;
        uint cnt = 0;
        for (i = 0; i < _proposals.proposalIds.length; i++) {
            Vote[] memory userVotes = _votes.getVoteWithAddressAndId[msg.sender][_proposals.proposalIds[i]];
            if (userVotes.length > 0) {
                for (j = 0; j < userVotes.length; j++) {
                    cnt++;
                }
            }
        }
        uint[] memory behavior = new uint[](cnt);
        uint[] memory voteTime = new uint[](cnt);
        uint[] memory proposalIdVotedOn = new uint[](cnt);
        cnt = 0;
        for (i = 0; i < _proposals.proposalIds.length; i++) {
            Vote[] memory userVotes = _votes.getVoteWithAddressAndId[msg.sender][_proposals.proposalIds[i]];
            if (userVotes.length > 0) {
                for (j = 0; j < userVotes.length; j++) {
                    behavior[cnt] = uint(userVotes[j].behavior);
                    voteTime[cnt] = userVotes[j].voteTime;
                    proposalIdVotedOn[cnt] = userVotes[j].proposalIdVotedOn;
                    cnt++;
                }
            }
        }

        return (behavior, voteTime, proposalIdVotedOn);
    }

    // 获取指定id的提案的投票信息
    function getProposalVotesInformation(uint id, uint timeNow) public view returns (uint[] memory, uint[] memory, address[] memory) {
        uint i;
        uint cnt = 0;
        for (i = 0; i < _votes.userAddresses.length; i++) {
            Vote[] memory userVotes = _votes.getVoteWithAddressAndId[_votes.userAddresses[i]][id];
            if (userVotes.length > 0) {
                cnt++;
            }
        }
        uint[] memory behavior = new uint[](cnt);
        uint[] memory voteTime = new uint[](cnt);
        address[] memory voter = new address[](cnt);
        cnt = 0;
        for (i = 0; i < _votes.userAddresses.length; i++) {
            Vote[] memory userVotes = _votes.getVoteWithAddressAndId[_votes.userAddresses[i]][id];
            if (userVotes.length > 0) {
                behavior[cnt] = uint(userVotes[userVotes.length-1].behavior);
                voteTime[cnt] = userVotes[userVotes.length-1].voteTime;
                voter[cnt] = userVotes[userVotes.length-1].voter;
                cnt++;
            }
        }

        if ((msg.sender == _proposals.getProposalWithId[id].proposer) || (getProposalStatus(id, timeNow) != ProposalStatus.isBeingVotedOn)) {
            return (behavior, voteTime, voter);
        } else {
            voteTime = new uint[](cnt); // 全为0
            voter = new address[](cnt); // 全为0
            return (behavior, voteTime, voter);
        }
    }

    // 获取所有用户的地址
    function getUserAddresses() public view returns (address[] memory) {
        return _votes.userAddresses;
    }

    // 获取最大投票次数
    function getMaxVotingTimes() public view returns (uint) {
        return _votes.maxVotingTimes;
    }

    // 获取投票需要消耗的通证积分TP
    function getTpConsumedByVote() public view returns (uint) {
        return _votes.tpConsumedByVote;
    }
}