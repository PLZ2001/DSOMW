// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./MyERC20.sol";
import "./MyERC721.sol";
import "hardhat/console.sol";

// DSOMW合约的所有对外函数
// **提案**
// 1. 发起一个新提案
//    function addNewProposal(string calldata content) public
// 2. 获取所有提案的id
//    function getProposalIds() public view returns (uint[] memory)
// 3. 获取用户的所有提案的id
//    function getUserProposalIds() public view returns (uint[] memory)
// 4. 获取指定id的提案信息（请前端预先刷新该提案状态）
//    function getProposalInformation(uint id) public view returns (string memory, address, uint, uint)
// 5. 获取发布提案需要消耗的通证积分TP
//    function getTpConsumedByProposal() public view returns (uint)
// 6. 刷新提案状态
//    function updateProposalStatus(uint id) public
// **投票**
// 1. 发起一个新投票（请前端预先刷新提案状态）
//    function voteOnProposal(uint userVote, uint id) public
// 2. 获取用户投票信息
//    function getUserVotesInformation() public view returns (uint[] memory, uint[] memory, uint[] memory)
// 3. 获取指定id的提案的投票信息（请前端预先刷新提案状态）（有访问限制）
//    function getProposalVotesInformation(uint id) public view returns (uint[] memory, uint[] memory, address[] memory)
// 4. 获取所有用户的地址
//    function getUserAddresses() public view returns (address[] memory)
// 5. 获取投票的持续时间
//    function getVotingTime() public view returns (uint)
// 6. 获取最大投票次数
//    function getMaxVotingTimes() public view returns (uint)
// 7. 获取投票需要消耗的通证积分TP
//    function getTpConsumedByVote() public view returns (uint)

contract DSOMW {
    using Counters for Counters.Counter;
    // 一个提案
    struct Proposal {
        uint id; // 提案id
        string content; // 提案内容
        address proposer; // 提案发起人
        uint voteEndTime; // 提案投票结束时间
        ProposalStatus status; // 提案当前状态
        bool isValid; // 用来表示该提案是否存在，防止读取不存在的提案
    }
    // 所有提案
    struct Proposals {
        mapping(uint=>Proposal) getProposalWithId; // 所有提案对象
        uint[] proposalIds; // 存储所有提案的id
        mapping(uint=>bool) isProposalStatusUpdating; // 表示提案对象是否正在修改状态，相当于对提案状态的变量锁
        uint tpConsumedByProposal; // 发起提案需要消耗的通证积分TP
        Counters.Counter proposalIdCounter; // 提案id计数器
    }
    // 提案状态
    enum ProposalStatus {
        isBeingVotedOn, // 正在投票中
        isRejected, // 投票已结束，拒绝
        isApproved // 投票已结束，通过
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
        uint votingTime; // 投票持续时间
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
    address public manager; // 管理员

    // 事件
    event NewProposalAdded(Proposal indexed proposal); // 发起新提案
    event NewVoteAdded(Vote indexed vote); // 发起新投票

    constructor (uint votingTime, uint maxVotingTimes, uint tpConsumedByProposal, uint tpConsumedByVote, uint initialUserTp) {
        _proposals.tpConsumedByProposal = tpConsumedByProposal; // 发起提案需要消耗的通证积分TP
        _votes.votingTime = votingTime; // 投票持续时间
        _votes.maxVotingTimes = maxVotingTimes; // 最大投票次数
        _votes.tpConsumedByVote = tpConsumedByVote; // 投票需要消耗的通证积分TP
        TP = new MyERC20("TokenPoint", "TP", initialUserTp); // 一键发币
        BNS = new MyERC721("Bonus", "BNS"); //一键发NFT
        manager = msg.sender; // 确认管理员地址
    }

    // 发起一个新提案
    function addNewProposal(string calldata content) public {
        require(TP.balanceOf(msg.sender) >= _proposals.tpConsumedByProposal, "Unable to afford a new proposal.");
        require(TP.allowance(msg.sender, address(this)) >= _proposals.tpConsumedByProposal, "DSOMW don't have allowance over your TP. Please authorize DSOMW.");

        TP.transferFrom(msg.sender, address(this), _proposals.tpConsumedByProposal); // 委托本合约把用户的通证积分TP转账给本合约（需要前端提前委托）

        uint newId = _proposals.proposalIdCounter.current(); // 获取新id
        Proposal memory newProposal = Proposal({id:newId, // 提案id
                                         content:content, // 提案内容
                                         proposer:msg.sender, // 提案发起人
                                         voteEndTime:block.timestamp+_votes.votingTime, // 提案投票结束时间
                                         status:ProposalStatus.isBeingVotedOn, // 提案当前状态
                                         isValid:true}); // 用来表示该提案是否存在，防止读取不存在的提案
        _proposals.getProposalWithId[newId] = newProposal; // 添加一个提案
        _proposals.isProposalStatusUpdating[newId] = false; // 允许状态更新
        _proposals.proposalIds.push(newId); // 添加一个新id
        _proposals.proposalIdCounter.increment(); // id自增

        emit NewProposalAdded(newProposal); //记录事件
    }

    // 获取提案的所有id
    function getProposalIds() public view returns (uint[] memory) {
        require(_proposals.proposalIds.length > 0, "No proposal added yet.");

        return _proposals.proposalIds;
    }

    // 获取用户的提案的所有id
    function getUserProposalIds() public view returns (uint[] memory) {
        require(_proposals.proposalIds.length > 0, "No proposal added yet.");

        uint[] memory ids;
        uint cnt = 0;
        uint i;
        for (i = 0; i < _proposals.proposalIds.length; i++) {
            if (_proposals.getProposalWithId[_proposals.proposalIds[i]].proposer == msg.sender) {
                ids[cnt] = _proposals.proposalIds[i];
                cnt++;
            }
        }

        return ids;
    }

    // 获取提案信息（请前端预先刷新状态）
    function getProposalInformation(uint id) public view returns (string memory, address, uint, uint) {
        require(_proposals.getProposalWithId[id].isValid == true, "This proposal doesn't exist.");

        uint status = uint(_proposals.getProposalWithId[id].status);
        string memory content = _proposals.getProposalWithId[id].content;
        address proposer = _proposals.getProposalWithId[id].proposer;
        uint voteEndTime = _proposals.getProposalWithId[id].voteEndTime;

        return (content, proposer, voteEndTime, status);
    }

    // 获取发布提案需要消耗的通证积分TP
    function getTpConsumedByProposal() public view returns (uint) {
        return _proposals.tpConsumedByProposal;
    }

    // 刷新提案状态
    function updateProposalStatus(uint id) public {
        require(_proposals.getProposalWithId[id].isValid == true, "This proposal doesn't exist.");
        require(_proposals.isProposalStatusUpdating[id] == false, "Unable to get status at this moment. Please do it later.");

        _proposals.isProposalStatusUpdating[id] = true; // 开始更新状态
        if (_proposals.getProposalWithId[id].status == ProposalStatus.isBeingVotedOn) {
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
                // 更新状态
                if (numOfApproval > numOfRejection) {
                    // 提案通过
                    _proposals.getProposalWithId[id].status = ProposalStatus.isApproved;
                    // 给提案发起人发放奖励（给提案投票的人所交的所有通证积分TP+发起提案所交的通证积分TP）
                    TP.transferFrom(address(this), _proposals.getProposalWithId[id].proposer, (numOfApproval + numOfRejection) * _votes.tpConsumedByVote + _proposals.tpConsumedByProposal);
                    // 检查提案发起人成功提案的数目
                    uint[] memory ids = getUserProposalIds();
                    uint j;
                    uint numOfProposalsApproved = 0;
                    for (j = 0; j < ids.length; j++) {
                        if (_proposals.getProposalWithId[id].status == ProposalStatus.isApproved) {
                            numOfProposalsApproved++;
                        }
                    }
                    // 检查提案发起人是否有3倍数的成功提案
                    if (numOfProposalsApproved !=0 && numOfProposalsApproved % 3 == 0) {
                        // 发放URI等于成功提案个数的纪念品
                        BNS.awardItem(msg.sender, integerToString(numOfProposalsApproved));
                    }
                } else {
                    // 提案未通过
                    _proposals.getProposalWithId[id].status = ProposalStatus.isRejected;
                }
            }
        }
        _proposals.isProposalStatusUpdating[id] = false; // 结束更新状态
    }

    // 发起一个新投票（请前端预先刷新提案状态）
    function voteOnProposal(uint userVote, uint id) public {
        require(_proposals.getProposalWithId[id].status == ProposalStatus.isBeingVotedOn, "Unable to vote on this proposal because voting has closed.");
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

        emit NewVoteAdded(newVote); //记录事件
    }

    // 获取用户投票信息
    function getUserVotesInformation() public view returns (uint[] memory, uint[] memory, uint[] memory) {
        uint i;
        uint j;
        uint[] memory behavior;
        uint[] memory voteTime;
        uint[] memory proposalIdVotedOn;
        uint cnt = 0;
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

    // 获取指定id的提案的投票信息（请前端预先刷新提案状态）
    function getProposalVotesInformation(uint id) public view returns (uint[] memory, uint[] memory, address[] memory) {
        require((msg.sender == _proposals.getProposalWithId[id].proposer) ||
                (_proposals.getProposalWithId[id].status != ProposalStatus.isBeingVotedOn) ||
                (msg.sender == manager),
                "Unable to get vote information of proposal because you're not proposer or manager, and voting is not over yet.");

        uint i;
        uint j;
        uint[] memory behavior;
        uint[] memory voteTime;
        address[] memory voter;
        uint cnt = 0;
        for (i = 0; i < _votes.userAddresses.length; i++) {
            Vote[] memory userVotes = _votes.getVoteWithAddressAndId[_votes.userAddresses[i]][id];
            if (userVotes.length > 0) {
                for (j = 0; j < userVotes.length; j++) {
                    behavior[cnt] = uint(userVotes[j].behavior);
                    voteTime[cnt] = userVotes[j].voteTime;
                    voter[cnt] = userVotes[j].voter;
                }
            }
        }

        return (behavior, voteTime, voter);
    }

    // 获取所有用户的地址
    function getUserAddresses() public view returns (address[] memory) {
        return _votes.userAddresses;
    }

    // 获取投票的持续时间
    function getVotingTime() public view returns (uint) {
        return _votes.votingTime;
    }

    // 获取最大投票次数
    function getMaxVotingTimes() public view returns (uint) {
        return _votes.maxVotingTimes;
    }

    // 获取投票需要消耗的通证积分TP
    function getTpConsumedByVote() public view returns (uint) {
        return _votes.tpConsumedByVote;
    }

    // 整数转字符串函数（https://www.imangodoc.com/28970.html）
    function integerToString(uint _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = bytes1(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }
}