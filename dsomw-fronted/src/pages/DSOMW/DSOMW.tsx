// import {Button, Image} from 'antd';
// import {Header} from "../../asset";
// import {UserOutlined} from "@ant-design/icons";
import {useEffect, useState} from 'react';
import {DSOMWContract, myERC20Contract, myERC721Contract, web3} from "../../utils/contracts";
import './DSOMW.css';

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

// 更好地输出revert报错信息
const revertOutput = (err: any)=> {
    const start = err.message.indexOf("revert ")
    const end = err.message.indexOf("\"", start)
    if (start === -1 || end === -1) {
        alert(err.message)
    } else {
        alert(err.message.substring(start+7,end))
    }
}

// 获取当前时间戳
const timeNow = () => {
    return Date.parse(new Date().toString())/1000
}

const DSOMWPage = () => {
    // *****小狐狸相关内容*****
    const [account, setAccount] = useState('')
    // 自动：检查用户是否已经连接钱包
    // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
    const initCheckAccounts = async () => {
        // @ts-ignore
        const {ethereum} = window;
        if (Boolean(ethereum && ethereum.isMetaMask)) {
            // 尝试获取连接的用户账户
            const accounts = await web3.eth.getAccounts()
            if(accounts && accounts.length) {
                setAccount(accounts[0])
            }
        }
    }
    useEffect(() => {
        initCheckAccounts()
    }, [])
    // 手动：连接钱包
    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }


    // *****调用智能合约相关内容*****
    // 用户信息
    const [userInfo, setUserInfo] = useState({balance:0, proposalIds:[], votesInfo:[{behavior:0,voteTime:0,proposalIdVotedOn:0}],bonusInfo:[{id:0,URI:"",awardTime:0}],getBonusReward:false})
    // 提案信息
    const [proposalsInfo, setProposalsInfo] = useState([{id:0,content:"",proposer:"",voteEndTime:0,status:0,votesInfo:[{behavior:0,voteTime:0,voter:""}],getTpReward:false}])
    // 发布提案需要消耗的通证积分TP
    const [tpConsumedByProposal, setTpConsumedByProposal] = useState(0)
    // 投票需要消耗的通证积分TP
    const [tpConsumedByVote, setTpConsumedByVote] = useState(0)
    // 最大投票次数
    const [maxVotingTimes, setMaxVotingTimes] = useState(0)
    // 领取通证积分TP的数量
    const [initialUserTp, setInitialUserTp] = useState(0)



    // 自动：获取用户信息（余额、发起提案的id、投票信息）
    const getUserInfo = async () => {
        if (DSOMWContract && myERC20Contract && myERC721Contract) {
            try {
                const _userBalance = await myERC20Contract.methods.balanceOf(account).call({from: account})
                const _userProposalIds = await DSOMWContract.methods.getUserProposalIds().call({from: account})
                const __userProposalIds = _userProposalIds.map((item: string) => +item)
                const _userVotesInformation = await DSOMWContract.methods.getUserVotesInformation().call({from: account})
                const __userVotesInformation = _userVotesInformation[0].map((item:number, index:number)=>{return {behavior:+_userVotesInformation[0][index],voteTime:+_userVotesInformation[1][index],proposalIdVotedOn:+_userVotesInformation[2][index]}})
                const _userBonusInformation = await myERC721Contract.methods.getBonusInformation(account).call({from: account})
                const __userBonusInformation = _userBonusInformation[0].map((item:number, index:number)=>{return {id:+_userBonusInformation[0][index],URI:_userBonusInformation[1][index],awardTime:+_userBonusInformation[2][index]}})
                const _userGetBonusReward = await DSOMWContract.methods.getWhetherUserCanGetBonusReward(timeNow()).call({from: account})
                console.log(_userGetBonusReward)
                const _userInfo = {balance:+_userBalance, proposalIds:__userProposalIds, votesInfo:__userVotesInformation, bonusInfo:__userBonusInformation, getBonusReward:_userGetBonusReward}
                setUserInfo(_userInfo)
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            alert('Contract not exists.')
        }
    }
    useEffect(() => {
        if (account !== '') {
            getUserInfo()
        }
    },[account])

    // 自动：获取所有提案的信息
    const getProposalInfo = async () => {
        if (DSOMWContract) {
            try {
                const _proposalIds = await DSOMWContract.methods.getProposalIds().call({from: account})
                const __proposalIds = _proposalIds.map((item: string) => +item)
                const _proposalInfo = await Promise.all(__proposalIds.map(async (id:number) => {
                    try {
                        const _proposalInformation = await DSOMWContract.methods.getProposalInformation(id, timeNow()).call({from: account})
                        const _proposalVotesInformation = await DSOMWContract.methods.getProposalVotesInformation(id, timeNow()).call({from: account})
                        const __proposalVotesInformation = _proposalVotesInformation[0].map((item:number, index:number)=>{return {behavior:+_proposalVotesInformation[0][index],voteTime:+_proposalVotesInformation[1][index]===0?null:+_proposalVotesInformation[1][index],voter:_proposalVotesInformation[2][index]===0?null:_proposalVotesInformation[2][index]}})
                        const _proposalGetTpReward = await DSOMWContract.methods.getWhetherUserCanGetTpReward(id, timeNow()).call({from: account})
                        return {id:id,content:_proposalInformation[0],proposer:_proposalInformation[1],voteEndTime:+_proposalInformation[2],status:+_proposalInformation[3],votesInfo:__proposalVotesInformation, getTpReward:_proposalGetTpReward}
                    } catch (error: any) {
                        revertOutput(error)
                    }
                }))
                console.log(_proposalInfo)
                setProposalsInfo(_proposalInfo)
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            alert('Contract not exists.')
        }
    }
    useEffect(() => {
        if (account !== '') {
            getProposalInfo()
        }
    },[account])

    // 自动：获取发布提案需要消耗的通证积分TP
    const getTpConsumedByProposal = async () => {
        if (DSOMWContract) {
            try {
                const _tpConsumedByProposal = await DSOMWContract.methods.getTpConsumedByProposal().call({from: account})
                setTpConsumedByProposal(_tpConsumedByProposal)
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            alert('Contract not exists.')
        }
    }
    useEffect(() => {
        if (account !== '') {
            getTpConsumedByProposal()
        }
    },[account])

    // 自动：获取投票需要消耗的通证积分TP
    const getTpConsumedByVote = async () => {
        if (DSOMWContract) {
            try {
                const _tpConsumedByVote = await DSOMWContract.methods.getTpConsumedByVote().call({from: account})
                setTpConsumedByVote(_tpConsumedByVote)
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            alert('Contract not exists.')
        }
    }
    useEffect(() => {
        if (account !== '') {
            getTpConsumedByVote()
        }
    },[account])

    // 自动：获取最大投票次数
    const getMaxVotingTimes = async () => {
        if (DSOMWContract) {
            try {
                const _maxVotingTimes = await DSOMWContract.methods.getMaxVotingTimes().call({from: account})
                setMaxVotingTimes(_maxVotingTimes)
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            alert('Contract not exists.')
        }
    }
    useEffect(() => {
        if (account !== '') {
            getMaxVotingTimes()
        }
    },[account])

    // 自动：获取领取通证积分TP的数量
    const getInitialUserTp = async () => {
        if (myERC20Contract) {
            try {
                const _initialUserTp = await myERC20Contract.methods.getInitialUserTp().call({from: account})
                setInitialUserTp(_initialUserTp)
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            alert('Contract not exists.')
        }
    }
    useEffect(() => {
        if (account !== '') {
            getInitialUserTp()
        }
    },[account])

    // 手动：领取通证积分TP
    const getTP = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (myERC20Contract) {
            try {
                await myERC20Contract.methods.getTP().send({from: account})
                getUserInfo()
                getProposalInfo()
                alert('You have Token Point now.')
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            alert('Contract not exists.')
        }
    }
    // 手动：领取纪念品
    const getBonusReward = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (DSOMWContract && myERC721Contract) {
            try {
                await DSOMWContract.methods.getBonusReward().send({from: account})
                getUserInfo()
                getProposalInfo()
                alert('Congratulations! You got your Bonus reward for your contribution to organization.')
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            alert('Contract not exists.')
        }
    }
    // 手动：领取通证积分奖励
    const getTpRewardFromProposalApproved = async (id:number) => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (DSOMWContract && myERC20Contract) {
            try {
                await DSOMWContract.methods.getTpRewardFromProposalApproved(id).send({from: account})
                getUserInfo()
                getProposalInfo()
                alert('Congratulations! You got your TP reward from this proposal for approval.')
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            alert('Contract not exists.')
        }
    }
    // 手动：发起提案
    const addNewProposal = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (DSOMWContract && myERC20Contract) {
            try {
                await myERC20Contract.methods.approve(DSOMWContract.options.address, 1000).send({from: account})
                await DSOMWContract.methods.addNewProposal("haha",30).send({from: account})
                getUserInfo()
                getProposalInfo()
                alert('You add a new proposal.')
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            alert('Contract not exists.')
        }
    }
    // 手动：投票
    const voteOnProposal = async (behavior:number, id:number) => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (DSOMWContract && myERC20Contract) {
            try {
                await myERC20Contract.methods.approve(DSOMWContract.options.address, 100).send({from: account})
                await DSOMWContract.methods.voteOnProposal(behavior, id).send({from: account})
                getUserInfo()
                getProposalInfo()
                alert('You vote on a proposal.')
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            alert('Contract not exists.')
        }
    }



    return (
        <div className="DSOMW">
            <div>你好！</div>
            {account === '' && <button onClick={onClickConnectWallet}>连接钱包</button>}
            <div>你的账户：{account === '' ? '你尚未连接' : account}</div>
            <div>你的通证积分TP：{account === '' ? 0 : userInfo.balance}</div>
            <div>你发布的提案：{account === '' ? "无" : (userInfo.proposalIds.length === 0? "无":userInfo.proposalIds)}</div>
            <div>你的投票情况：{account === '' ? "无" : (userInfo.votesInfo.length === 0? "无":userInfo.votesInfo.map((val)=>{return <p>{"你在"+val.voteTime+"时给提案"+val.proposalIdVotedOn+"投了"+(val.behavior===1?"赞成票":"反对票")+"\n"}</p>}))}</div>
            <div>你的纪念品：{account !== '' && (userInfo.getBonusReward===true && <button onClick={getBonusReward}>获取纪念品奖励</button>)}{account === '' ? "无" : (userInfo.bonusInfo.length === 0? "无":userInfo.bonusInfo.map((val)=>{return <p>{val.URI+"（编号："+val.id+"，获得时间："+val.awardTime+"）"}</p>}))}</div>
            <div>{account !== '' && <button onClick={getTP}>获取通证积分</button>}</div>
            <div>{account !== '' && <button onClick={addNewProposal}>发起提案</button>}</div>
            <div>所有提案：{account === '' ? "无" : (proposalsInfo.length === 0? "无":proposalsInfo.map((val)=>{return <p>{account !== '' && <button onClick={(e)=>voteOnProposal(1,val.id)}>赞成</button>}{account !== '' && <button onClick={(e)=>voteOnProposal(0,val.id)}>反对</button>}{account !== '' && (val.getTpReward == true && <button onClick={(e)=>getTpRewardFromProposalApproved(val.id)}>领取通证积分TP奖励</button>)}{"提案"+val.id+"的内容是："+val.content+" 发起人是："+val.proposer+" 投票截止时间是："+val.voteEndTime+" 提案当前状态是："+(val.status===0?"正在投票中":(val.status===1?"已拒绝":"已通过"))+" 投票情况："+"赞成"+val.votesInfo.filter((item)=>{return item.behavior===1}).length+"反对"+val.votesInfo.filter((item)=>{return item.behavior===0}).length+"\n"}</p>}))}</div>
        </div>
    );
}

export default DSOMWPage