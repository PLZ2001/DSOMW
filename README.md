# Decentralized Student Organization Management Website (DSOMW)
## 😀项目简介
本项目是一个基于智能合约和React前端的去中心化学生社团组织治理网站。用于浙江大学2022-2023学年秋学期《区块链与数字货币》课程大作业。
<div align="center">
    <img decoding="async" src="./imgs/网页主界面1.jpeg" width="70%">
    <br/> ”提案中心“首页
</div>
<br/>
<div align="center">
    <img decoding="async" src="./imgs/网页主界面2.jpeg" width="70%">
    <br/> ”用户中心“首页
</div>
<br/>

## 🧐项目基础功能
* 你可以领取一次 10000 通证积分TP
* 你可以消耗 1000 通证积分TP，发起任意内容的提案
* 在提案投票时间区间内，你可以消耗 100 通证积分TP，对提案投票（赞成或反对），对于同一个提案，你最多有3次投票机会
* 投票截止后，赞成数大于反对数的提案通过
* 提案通过后，你可以获取通证积分TP奖励
* 每通过3个提案，你可以获取独有的纪念品奖励

## 😘项目特色
* 所有用户的提案发布行为、投票行为都记录在区块链上
* 你可以通过顶端数据板获取网站最新统计数据
* 你可以查看已发布的所有提案的实时信息
* 你可以查看自己的所有投票（包括投票提案、投票时间、投票行为）
* 你可以查看自己提案的最新投票情况（包括投票人、投票时间、投票行为）
* 你可以查看自己的纪念品情况（包括纪念品编号、纪念品名称、获得时间）
* 优雅的成功/异常消息通知框
* 干净整洁的前端

## 🤗项目运行方法（仅在Windows平台试验过）
你需要预先安装以下软件/插件/环境：
* [git](https://git-scm.com/downloads)
* [Node.js](https://nodejs.org/en/download/)
* [Ganache](https://trufflesuite.com/ganache/)
* [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)

### 1. 克隆本项目
```shell
   git clone https://github.com/PLZ2001/DSOMW
   cd DSOMW   
```

### 2. 安装项目依赖
```shell
   dsomw-install-package1.bat
   dsomw-install-package2.bat
   dsomw-install-package3.bat
```


### 3. 创建并启动本地区块链
   * 启动Ganache
   * 新建Workspace，将SERVER中的PORT NUMBER改为8545
   * 点击START，启动本地区块链

### 4. 将智能合约部署到本地区块链
```shell
   dsomw-deploy.bat
```

正常情况下终端输出（下文只是举例，具体哈希值因人而异）
```shell
   DSOMW contract has been deployed successfully in 0x19D7B46F79d1BDD597a08Df584F1A74Feb2947bb
   erc20 contract has been deployed successfully in 0x868d9AF43e8871498E8554e6277DB4F77dd3d440
   erc721 contract has been deployed successfully in 0x4BBF00a5CDAb2d42eC185418D90C4f5430413fD2
```
### 5. 编辑contract-addresses.json文件
   * 打开 ./dsomw-fronted/src/utils 的 contract-addresses.json
   * 根据第4步实际部署的地址，将文件内容改为
```json
{
   "DSOMW": "0x19D7B46F79d1BDD597a08Df584F1A74Feb2947bb",
   "myERC20": "0x868d9AF43e8871498E8554e6277DB4F77dd3d440",
   "myERC721": "0x4BBF00a5CDAb2d42eC185418D90C4f5430413fD2"
}
```

### 6. 设置MetaMask
   * ”设置“-”高级“，打开“显示测试网络”
   * 选择“导入账户”，输入本地区块链账户私钥（私钥从ganache界面中任意一行账户右侧🔑点击获取）

### 7. 启动网页
```shell
   dsomw-start.bat
```
   * 开始使用网站吧！

## 😉项目操作流程
请先完成前述“项目运行方法”后，再操作该部分内容

### 1. 首次使用，连接钱包
* 当你正确完成以上“项目运行方法”后，应该看到如下界面
<div align="center">
    <img decoding="async" src="./imgs/首次进入.jpeg" width="70%">
    <br/> 正确完成”项目运行方法“后的”提案中心“首页
</div>
<br/>

* 在左侧导航栏切换到”用户中心“，选择”连接钱包“
<div align="center">
    <img decoding="async" src="./imgs/选择用户中心.jpeg" width="70%">
    <br/> 在左侧导航栏切换到”用户中心“
</div>
<br/>
<div align="center">
    <img decoding="async" src="./imgs/选择连接钱包.jpeg" width="70%">
    <br/> 选择”连接钱包“
</div>
<br/>

* 如果你此前正确安装了MetaMask，那么浏览器将会自动唤起MetaMask，选择”切换网络“
<div align="center">
    <img decoding="async" src="./imgs/切换网络.jpeg" width="25%">
    <br/> 选择”切换网络“
</div>
<br/>

* 选中之前导入的本地区块链账户，选择”下一步“，然后选择”连接“
<div align="center">
    <img decoding="async" src="./imgs/选择账户.jpeg" width="25%">
    <img decoding="async" src="./imgs/选择连接.jpeg" width="25%">
    <br/> 选择”下一步“，然后选择”连接“
</div>
<br/>

* 唤起MetaMask拓展程序，如果显示如下界面，那么恭喜！你已经成功连接钱包！此时在”用户中心“中可以看到自己账户的地址
<div align="center">
    <img decoding="async" src="./imgs/连接成功.jpeg" width="25%">
    <img decoding="async" src="./imgs/连接钱包后的用户中心.jpeg" width="70%">
    <br/> 成功连接钱包后的MetaMask和“用户中心”
</div>
<br/>

❗ 特殊情况：若发现无法自动生成LocalHost 8545测试网络，可以在MetaMask设置中手动添加网络，设置参数如下
<div align="center">
    <img decoding="async" src="./imgs/手动设置测试网络.jpeg" width="25%">
    <br/> 特殊情况：手动添加网络
</div>
<br/>

### 2. 首次登陆，领取初始通证积分TP
* 如果你首次登陆，可以在”用户中心“中领取 10000 初始通证积分TP
<div align="center">
    <img decoding="async" src="./imgs/领取通证积分.jpeg" width="70%">
    <br/> 选择“领取初始通证积分TP”
</div>
<br/>

* 领取成功后，在”用户中心“中可以看到你的 10000 初始通证积分TP
<div align="center">
    <img decoding="async" src="./imgs/TP领取成功.jpeg" width="70%">
    <br/> 成功领取初始通证积分TP后的“用户中心”
</div>
<br/>

### 3. 发表你的第一个提案
* 在“提案中心”，任何人都可以发起自己的提案，只需选择“发起提案”
<div align="center">
    <img decoding="async" src="./imgs/发布提案.jpeg" width="70%">
    <br/> 选择“发起提案”
</div>
<br/>

* 系统会提醒消耗 1000 TP，选择“确定”
<div align="center">
    <img decoding="async" src="./imgs/发布提案的提醒.jpeg" width="70%">
    <br/> 选择“确定”
</div>
<br/>

* 进入提案填写界面后，设置你的提案的投票开始时间和投票结束时间，并输入提案内容
<div align="center">
    <img decoding="async" src="./imgs/发起提案界面.jpeg" width="70%">
    <img decoding="async" src="./imgs/填写提案.jpeg" width="70%">
    <br/> 设置你的提案的投票开始时间和投票结束时间，并输入提案内容
</div>
<br/>

* 选择“提交提案”，当提案提交成功后，系统会提示“你成功发布了一项提案”
<div align="center">
    <img decoding="async" src="./imgs/提交提案.jpeg" width="70%">
    <img decoding="async" src="./imgs/提案提交成功.jpeg" width="70%">
    <br/> 提案提交成功后，系统会提示“你成功发布了一项提案”
</div>
<br/>

* 你可以在“提案中心”看到你提交的提案（如果其他人也提交了提案，你在这里也会看到他们提交的提案）
<div align="center">
    <img decoding="async" src="./imgs/你的第一个提案.jpeg" width="70%">
    <br/> 你的第一个提案
</div>
<br/>

* 你也可以在“用户中心”-“我的提案”看到你提交的提案，并看到你的通证积分已经从 10000 TP减少为 9000 TP
<div align="center">
    <img decoding="async" src="./imgs/你的第一个提案2.jpeg" width="70%">
    <br/> 你的第一个提案
</div>
<br/>

### 4. 投出你的第一个投票
* 在“提案中心”，任何人都可以给任何正在投票中的提案投票。以你刚发布的第一个提案为例，选择右侧的“赞成”，即可给你的提案投出赞成票（当然，你也可以反对你的提案）
<div align="center">
    <img decoding="async" src="./imgs/你的第一个投票.jpeg" width="70%">
    <br/> 选择“赞成”
</div>
<br/>

* 系统会提醒消耗 100 TP，选择“确定”
<div align="center">
    <img decoding="async" src="./imgs/消耗100TP.jpeg" width="70%">
    <br/> 选择“确定”
</div>
<br/>

* 投票成功后，系统会提示“你成功投出了赞成票”，你可以看到你的提案已经有了1个赞成数
<div align="center">
    <img decoding="async" src="./imgs/投票成功.jpeg" width="70%">
    <br/> 投票成功后，系统会提示“你成功投出了赞成票”
</div>
<br/>

* 你也可以在“用户中心”-“我的投票”看到你提交的投票，并看到你的通证积分已经从 9000 TP减少为 8900 TP
<div align="center">
    <img decoding="async" src="./imgs/我的投票.jpeg" width="70%">
    <br/> 你的第一个投票
</div>
<br/>

### 5. 查看你的提案的最新投票情况
* 有2个人分别给你的第一个提案投了赞成票和反对票，你可以在“用户中心”-“我的提案”中，通过选择“赞成数/反对数”一栏下的数值，查看你的提案的最新投票情况。只有你有权利查看你的提案的投票情况。
<div align="center">
    <img decoding="async" src="./imgs/选择提案投票情况.jpeg" width="70%">
    <img decoding="async" src="./imgs/查看提案投票情况.jpeg" width="70%">
    <br/> 查看你的第一个提案的最新投票情况（你的账户永远是蓝色，其他人的账户是随机颜色）
</div>
<br/>

### 6. 领取你的通证积分TP奖励
* 当投票截止后，如果你的提案赞成数大于反对数，则自动通过，此时在提案信息右侧会出现“领取通证积分TP奖励”按钮
* 假设你非常积极地提交了3个新提案，而且均已通过，你会看到如下界面，点击获取奖励
<div align="center">
    <img decoding="async" src="./imgs/领取通证积分奖励.jpeg" width="70%">
    <br/> 你的提案通过后，右侧会出现“领取通证积分TP奖励”按钮，点击获取奖励
</div>
<br/>

* 获取奖励后，按钮会自动消失


### 7. 领取你的纪念品奖励
* 当你每通过3个提案，你就拥有了领取纪念品的资格，此时在“用户中心”中间会出现“领取纪念品奖励”按钮，点击获取奖励
<div align="center">
    <img decoding="async" src="./imgs/领取纪念品奖励.jpeg" width="70%">
    <br/> 当你每通过3个提案，“用户中心”中间就会出现“领取纪念品奖励”按钮，点击获取奖励
</div>
<br/>

* 领取成功后，在“用户中心”-“我的纪念品”可以查看你的纪念品获得情况。可以看到，因为你有3个提案通过，所以获得了名称为 \[Milestone With 3 Proposals Approved] 的纪念品
<div align="center">
    <img decoding="async" src="./imgs/我的纪念品.jpeg" width="70%">
    <br/> 在“用户中心”-“我的纪念品”可以查看你的纪念品获得情况
</div>
<br/>

* 获取奖励后，按钮会自动消失
* 随着你提案通过次数的增加，你的纪念品名称也会随之变化。例如当你有6个提案通过时，可获得名称为 \[Milestone With 6 Proposals Approved] 的纪念品

## 😄项目功能实现代码简析
### 1. 你可以领取一次 10000 通证积分TP
```solidity
    // 每个用户仅有一次领取通证积分TP的机会
    function getTP() public {
        // 检查消息发起者是否已经领取过通证积分TP
        require(claimedGetTpUserList[msg.sender] == false, "You have got TP already");
        claimedGetTpUserList[msg.sender] = true;
        // 领取
        _mint(msg.sender, _initialUserTp);
    }

    // 获取用户是否可以领取初始通证积分
    function getWhetherUserCanGetInitialUserTp() public view returns (bool) {
        return !claimedGetTpUserList[msg.sender];
    }
```
### 2. 你可以消耗 1000 通证积分TP，发起任意内容的提案
```solidity
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
```

### 3. 在提案投票时间区间内，你可以消耗 100 通证积分TP，对提案投票（赞成或反对），对于同一个提案，你最多有3次投票机会
```solidity
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

```
### 4. 投票截止后，赞成数大于反对数的提案通过
```solidity
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
```
### 5. 提案通过后，你可以获取通证积分TP奖励
```solidity
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

```
### 6. 每通过3个提案，你可以获取独有的纪念品奖励
```solidity
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
```

## 