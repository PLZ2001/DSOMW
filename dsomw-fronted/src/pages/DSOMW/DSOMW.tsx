
import React,{ useEffect, useState} from 'react';
import {DSOMWContract, myERC20Contract, myERC721Contract, web3} from "../../utils/contracts";
import './DSOMW.css';

import {
    ShopOutlined,
    TeamOutlined,
    UserOutlined,
    SmileFilled,
    FileTextOutlined,
    FileDoneOutlined,
    DollarCircleOutlined,
    FileAddOutlined,
    EyeOutlined,
    GiftOutlined,
    WalletOutlined,
    GitlabFilled,
    CheckSquareOutlined,
    CloseSquareOutlined,
    HighlightOutlined,
} from '@ant-design/icons';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Layout, Menu, Row, Col, Button, Table, Empty, Tag, Tabs, Divider, Alert, Modal, Input, DatePicker,Popconfirm} from 'antd';

//安装npm i date-fns --save
import format from 'date-fns/format'; // 时间格式化字符串

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'


// 获取当前时间戳
const timeNow = () => {
    return Date.parse(new Date().toString())/1000
}
// 由时间戳得到时间字符串
const getDate = (stamp:number) => {
    let date = new Date(1000*stamp);
    let formattedTime = format(date, 'yyyy-MM-dd HH:mm:ss')
    return formattedTime;
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
            setErrorMessage('MetaMask is not installed!');
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
            setErrorMessage(error.message)
        }
    }


    // *****调用智能合约相关内容*****
    // 用户信息
    const [userInfo, setUserInfo] = useState({} as {balance:number, proposalIds:number[], votesInfo:{behavior:number,voteTime:number,proposalIdVotedOn:number}[],bonusInfo:{id:number,URI:string,awardTime:number}[],getBonusReward:boolean,getInitialTp:boolean})
    // 提案信息
    const [proposalsInfo, setProposalsInfo] = useState([] as {id:number,content:string,proposer:string,voteStartTime:number,voteEndTime:number,status:number,votesInfo:{behavior:number,voteTime:number,voter:string}[],getTpReward:boolean}[])
    // 发布提案需要消耗的通证积分TP
    const [tpConsumedByProposal, setTpConsumedByProposal] = useState(0)
    // 投票需要消耗的通证积分TP
    const [tpConsumedByVote, setTpConsumedByVote] = useState(0)
    // 最大投票次数
    const [maxVotingTimes, setMaxVotingTimes] = useState(0)
    // 领取通证积分TP的数量
    const [initialUserTp, setInitialUserTp] = useState(0)
    // 所有用户地址
    const [userAddresses, setUserAddresses] = useState([] as string[])

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
                const _userGetInitialTp = await myERC20Contract.methods.getWhetherUserCanGetInitialUserTp().call({from: account})
                const _userInfo = {balance:+_userBalance, proposalIds:__userProposalIds, votesInfo:__userVotesInformation.reverse(), bonusInfo:__userBonusInformation.reverse(), getBonusReward:_userGetBonusReward, getInitialTp:_userGetInitialTp}
                setUserInfo(_userInfo)
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            setErrorMessage('合约不存在！')
        }
    }
    useEffect(() => {
        if (account !== '') {
            getUserInfo()
        }
    },[account])

    // 自动：获取所有用户地址
    const getUserAddresses = async () => {
        if (DSOMWContract) {
            try {
                const _userAddresses = await DSOMWContract.methods.getUserAddresses().call({from: account})
                setUserAddresses(_userAddresses)
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            setErrorMessage('合约不存在！')
        }
    }
    useEffect(() => {
        if (account !== '') {
            getUserAddresses()
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
                        return {id:id,content:_proposalInformation[0],proposer:_proposalInformation[1],voteStartTime:+_proposalInformation[2],voteEndTime:+_proposalInformation[3],status:+_proposalInformation[4],votesInfo:__proposalVotesInformation, getTpReward:_proposalGetTpReward}
                    } catch (error: any) {
                        revertOutput(error)
                    }
                }))
                console.log(_proposalInfo)
                setProposalsInfo(_proposalInfo.reverse())
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            setErrorMessage('合约不存在！')
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
            setErrorMessage('合约不存在！')
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
            setErrorMessage('合约不存在！')
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
            setErrorMessage('合约不存在！')
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
            setErrorMessage('合约不存在！')
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
            setErrorMessage('你尚未连接钱包！')
            return
        }
        if (myERC20Contract) {
            try {
                await myERC20Contract.methods.getTP().send({from: account})
                getUserInfo()
                getProposalInfo()
                setSuccessMessage('成功领取初始通证积分。')
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            setErrorMessage('合约不存在！')
        }
    }
    // 手动：领取纪念品
    const getBonusReward = async () => {
        if(account === '') {
            setErrorMessage('你尚未连接钱包！')
            return
        }
        if (DSOMWContract && myERC721Contract) {
            try {
                await DSOMWContract.methods.getBonusReward().send({from: account})
                getUserInfo()
                getProposalInfo()
                setSuccessMessage('祝贺你！你得到了社团赠予的纪念品。')
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            setErrorMessage('合约不存在！')
        }
    }
    // 手动：领取通证积分奖励
    const getTpRewardFromProposalApproved = async (id:number) => {
        if(account === '') {
            setErrorMessage('你尚未连接钱包！')
            return
        }
        if (DSOMWContract && myERC20Contract) {
            try {
                await DSOMWContract.methods.getTpRewardFromProposalApproved(id).send({from: account})
                getUserInfo()
                getProposalInfo()
                setSuccessMessage('祝贺你！你因为提案通过得到了通证积分TP奖励')
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            setErrorMessage('合约不存在！')
        }
    }
    // 手动：发起提案
    const addNewProposal = async (content:string, startTime: number, endTime: number) => {
        if(account === '') {
            setErrorMessage('你尚未连接钱包！')
            return
        }
        if (DSOMWContract && myERC20Contract) {
            try {
                await myERC20Contract.methods.approve(DSOMWContract.options.address, tpConsumedByProposal).send({from: account})
                await DSOMWContract.methods.addNewProposal(content,startTime,endTime).send({from: account})
                getUserInfo()
                getProposalInfo()
                setSuccessMessage('你成功发布了一项提案。')
                setSubmit(true)
                _proposalContent = "";
            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            setErrorMessage('合约不存在！')
        }
    }
    // 手动：投票
    const voteOnProposal = async (behavior:number, id:number) => {
        if(account === '') {
            setErrorMessage('你尚未连接钱包！')
            return
        }
        if (DSOMWContract && myERC20Contract) {
            try {
                await myERC20Contract.methods.approve(DSOMWContract.options.address, tpConsumedByVote).send({from: account})
                await DSOMWContract.methods.voteOnProposal(behavior, id).send({from: account})
                getUserInfo()
                getProposalInfo()
                if (behavior == 1) {
                    setSuccessMessage('你成功投出了赞成票。请记住，你一共有 '+maxVotingTimes+' 次投票机会。')
                } else {
                    setSuccessMessage('你成功投出了反对票。请记住，你一共有 '+maxVotingTimes+' 次投票机会。')
                }

            } catch (error: any) {
                revertOutput(error)
            }
        } else {
            setErrorMessage('合约不存在！')
        }
    }

    // *****Ant Design相关*****
    const { Header, Content, Footer, Sider } = Layout;

    // 侧边菜单
    const [menuKey,setMenuKey] = useState(0);
    const _items = [
        {icon:ShopOutlined, label:"提案中心"},
        {icon:UserOutlined, label:"用户中心"}
    ]
    const items: MenuProps['items'] = _items.map((value, index) => ({
        key: String(index),
        icon: React.createElement(value.icon),
        label: value.label,
    }));

    // 用户颜色
    const colorGroup = ["red","gold","green","cyan","magenta","orange","lime","geekblue","volcano","purple"]

    // 表格数据
    const [allProposalData, setAllProposalData] = useState([] as { id: number; voteStartTime: string;voteEndTime: string; content: string; proposer: JSX.Element; votesInfo: string; status: JSX.Element; action: JSX.Element; }[])
    const [userProposalData, setUserProposalData] = useState([] as { id: number;voteStartTime: string; voteEndTime: string; content: string; votesInfo: JSX.Element; status: JSX.Element; action: JSX.Element; }[])
    const [userProposalVoteData, setUserProposalVoteData] = useState([] as {id: number;voteTime:string;voter: JSX.Element;behavior:string;}[])
    const [userVoteData, setUserVoteData] = useState([] as {behavior:string,voteTime:string,proposalIdVotedOn:number,content:string}[])
    const [userBonusData, setUserBonusData] = useState([] as {id:string,URI:string,awardTime:string}[])
    useEffect(()=>{
        if (account !== '' && proposalsInfo) {
            try {
                setAllProposalData(proposalsInfo.map((item)=>{
                    let button_action!:JSX.Element;
                    if (item.status == 0) {
                        button_action =
                            <div>
                                <Popconfirm title={"投票将消耗"+tpConsumedByVote+" TP。你目前有"+userInfo.balance+" TP。是否确定继续？"} onConfirm={(e)=>voteOnProposal(1,item.id)} okText="确定" cancelText="取消" placement="leftTop">
                                    <Button icon={<CheckSquareOutlined />}>赞成</Button>
                                </Popconfirm>
                                <Popconfirm title={"投票将消耗"+tpConsumedByVote+" TP。你目前有"+userInfo.balance+" TP。是否确定继续？"} onConfirm={(e)=>voteOnProposal(0,item.id)} okText="确定" cancelText="取消" placement="leftTop">
                                    <Button icon={<CloseSquareOutlined />}>反对</Button>
                                </Popconfirm>
                            </div>;
                    } else if (item.status == 2 && item.getTpReward==true) {
                        button_action = <Button icon={<DollarCircleOutlined />} onClick={(e)=>getTpRewardFromProposalApproved(item.id)}>领取通证积分TP奖励</Button>;
                    }
                    return {id:item.id,voteStartTime:getDate(item.voteStartTime),voteEndTime:getDate(item.voteEndTime),content:item.content,proposer:<Tag icon={<UserOutlined/>} color={item.proposer == account?"blue":(colorGroup[userAddresses.indexOf(item.proposer)%10])}>{item.proposer}</Tag>,votesInfo: item.votesInfo.filter((item)=>{return item.behavior===1}).length+"/"+item.votesInfo.filter((item)=>{return item.behavior===0}).length,status: (item.status===0?<Tag color="processing">正在投票中</Tag>:(item.status===1?<Tag color="error">已拒绝</Tag>:(item.status===2?<Tag color="success">已通过</Tag>:<Tag color="warning">投票尚未开始</Tag>))),action: button_action}
                }))
            } catch (error: any) {
                revertOutput(error)
            }
        }
    }, [proposalsInfo])
    useEffect(()=>{
        if (account !== "" && proposalsInfo && userInfo.proposalIds) {
            try {
                const _allProposaldata = proposalsInfo.map((item)=>{
                    let button_action!:JSX.Element;
                    if (item.status == 0) {
                        button_action =
                            <div>
                                <Popconfirm title={"投票将消耗"+tpConsumedByVote+" TP。你目前有"+userInfo.balance+" TP。是否确定继续？"} onConfirm={(e)=>voteOnProposal(1,item.id)} okText="确定" cancelText="取消" placement="leftTop">
                                    <Button icon={<CheckSquareOutlined />}>赞成</Button>
                                </Popconfirm>
                                <Popconfirm title={"投票将消耗"+tpConsumedByVote+" TP。你目前有"+userInfo.balance+" TP。是否确定继续？"} onConfirm={(e)=>voteOnProposal(0,item.id)} okText="确定" cancelText="取消" placement="leftTop">
                                    <Button icon={<CloseSquareOutlined />}>反对</Button>
                                </Popconfirm>
                            </div>;
                    } else if (item.status == 2 && item.getTpReward==true) {
                        button_action = <Button icon={<DollarCircleOutlined />} onClick={(e)=>getTpRewardFromProposalApproved(item.id)}>领取通证积分TP奖励</Button>;
                    }
                    return {id:item.id,voteStartTime:getDate(item.voteStartTime),voteEndTime:getDate(item.voteEndTime),content:item.content,votesInfo: <Button type="link" onClick={(e)=>info(item.id)}>{item.votesInfo.filter((item)=>{return item.behavior===1}).length+"/"+item.votesInfo.filter((item)=>{return item.behavior===0}).length}</Button>,status: (item.status===0?<Tag color="processing">正在投票中</Tag>:(item.status===1?<Tag color="error">已拒绝</Tag>:(item.status===2?<Tag color="success">已通过</Tag>:<Tag color="warning">投票尚未开始</Tag>))),action: button_action}
                })
                setUserProposalData(_allProposaldata.filter((item)=>{
                    return userInfo.proposalIds.some((id)=>{
                        return id == item.id
                    })
                }))
            } catch (error: any) {
                revertOutput(error)
            }
        }
    }, [proposalsInfo,userInfo.proposalIds])
    useEffect(()=>{
        if (account !== "" && proposalsInfo && userInfo.proposalIds) {
            try {
                const _allProposaldata = proposalsInfo.map((item)=>{
                    let button_action!:JSX.Element;
                    if (item.status == 0) {
                        button_action = <div><Button icon={<CheckSquareOutlined />} onClick={(e)=>voteOnProposal(1,item.id)}>赞成</Button><Button icon={<CloseSquareOutlined />} onClick={(e)=>voteOnProposal(0,item.id)}>反对</Button></div>;
                    } else if (item.status == 2 && item.getTpReward==true) {
                        button_action = <Button icon={<DollarCircleOutlined />} onClick={(e)=>getTpRewardFromProposalApproved(item.id)}>领取通证积分TP奖励</Button>;
                    }
                    return {id:item.id,voteStartTime:getDate(item.voteStartTime),voteEndTime:getDate(item.voteEndTime),content:item.content,proposer:<Tag icon={<UserOutlined/>}>{item.proposer}</Tag>,votesInfo: item.votesInfo, status: (item.status===0?<Tag color="processing">正在投票中</Tag>:(item.status===1?<Tag color="error">已拒绝</Tag>:(item.status===2?<Tag color="success">已通过</Tag>:<Tag color="warning">投票尚未开始</Tag>))),action: button_action}
                })
                const _userProposaldata = _allProposaldata.filter((item)=>{
                    return userInfo.proposalIds.some((id)=>{
                        return id == item.id
                    })})
                let _userProposalVoteData = [] as { id: number; voteTime:string;voter: JSX.Element;behavior:string;}[]
                _userProposaldata.forEach((item,index,array)=>{
                    item.votesInfo.forEach((_item)=>{
                        _userProposalVoteData.push({id:item.id ,voteTime:getDate(_item.voteTime),voter:<Tag icon={<UserOutlined/>} color={_item.voter == account?"blue":(colorGroup[userAddresses.indexOf(_item.voter)%10])}>{_item.voter}</Tag>,behavior:(_item.behavior==1?"赞成":"反对")})
                    })
                })
                setUserProposalVoteData(_userProposalVoteData)
            } catch (error: any) {
                revertOutput(error)
            }
        }
    }, [proposalsInfo,userInfo.proposalIds])
    useEffect(()=>{
        if (account !== "" && userInfo.votesInfo && proposalsInfo) {
            try {
                setUserVoteData(userInfo.votesInfo.map((item)=>{
                    return {behavior:(item.behavior==1?"赞成":"反对"),voteTime:getDate(item.voteTime),proposalIdVotedOn:item.proposalIdVotedOn,content:(proposalsInfo.filter((_item)=>_item.id==item.proposalIdVotedOn).length > 0?proposalsInfo.filter((_item)=>_item.id==item.proposalIdVotedOn)[0].content:"")}
                }))
            } catch (error: any) {
                revertOutput(error)
            }
        }
    }, [userInfo.votesInfo,proposalsInfo])
    useEffect(()=>{
        if (account !== "" && userInfo.bonusInfo) {
            try {
                setUserBonusData(userInfo.bonusInfo.map((item)=>{
                    return {id:"#"+item.id,URI:item.URI,awardTime:getDate(item.awardTime)}
                }))
            } catch (error: any) {
                revertOutput(error)
            }
        }
    }, [userInfo.bonusInfo])

    const columnsProposal: ColumnsType<{ id: number; voteStartTime: string;voteEndTime: string; content: string; proposer: JSX.Element; votesInfo: string; status: JSX.Element; action: JSX.Element; }> = [
        {
            title: '编号',
            dataIndex: 'id',
            key: 'id',
            align: 'center' as 'center',
        },
        {
            title: '开始时间',
            dataIndex: 'voteStartTime',
            key: 'voteStartTime',
            align: 'center' as 'center',
            sorter: (a, b) => Date.parse(a.voteStartTime) - Date.parse(b.voteStartTime),
        },
        {
            title: '截止时间',
            dataIndex: 'voteEndTime',
            key: 'voteEndTime',
            align: 'center' as 'center',
            sorter: (a, b) => Date.parse(a.voteEndTime) - Date.parse(b.voteEndTime),
        },
        {
            title: '提案内容',
            dataIndex: 'content',
            key: 'content',
            align: 'center' as 'center',
        },
        {
            title: '发起人',
            dataIndex: 'proposer',
            key: 'proposer',
            align: 'center' as 'center',
        },
        {
            title: '赞成数/反对数',
            dataIndex: 'votesInfo',
            key: 'votesInfo',
            align: 'center' as 'center',
        },
        {
            title: '提案状态',
            dataIndex: 'status',
            key: 'status',
            align: 'center' as 'center',
        },
        {
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            align: 'center' as 'center',
        },
    ];
    const columnsUserProposal: ColumnsType<{ id: number; voteStartTime: string;voteEndTime: string; content: string; votesInfo: JSX.Element; status: JSX.Element; action: JSX.Element; }> = [
        {
            title: '编号',
            dataIndex: 'id',
            key: 'id',
            align: 'center' as 'center',
        },
        {
            title: '开始时间',
            dataIndex: 'voteStartTime',
            key: 'voteStartTime',
            align: 'center' as 'center',
            sorter: (a, b) => Date.parse(a.voteStartTime) - Date.parse(b.voteStartTime),
        },
        {
            title: '截止时间',
            dataIndex: 'voteEndTime',
            key: 'voteEndTime',
            align: 'center' as 'center',
            sorter: (a, b) => Date.parse(a.voteEndTime) - Date.parse(b.voteEndTime),
        },
        {
            title: '提案内容',
            dataIndex: 'content',
            key: 'content',
            align: 'center' as 'center',
        },
        {
            title: '赞成数/反对数',
            dataIndex: 'votesInfo',
            key: 'votesInfo',
            align: 'center' as 'center',
        },
        {
            title: '提案状态',
            dataIndex: 'status',
            key: 'status',
            align: 'center' as 'center',
        },
        {
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            align: 'center' as 'center',
        },
    ];
    const columnsVote: ColumnsType<{behavior:string,voteTime:string,proposalIdVotedOn:number,content:string}> = [
        {
            title: '投票的提案编号',
            dataIndex: 'proposalIdVotedOn',
            key: 'proposalIdVotedOn',
            align: 'center' as 'center',
        },
        {
            title: '投票的提案内容',
            dataIndex: 'content',
            key: 'content',
            align: 'center' as 'center',
        },
        {
            title: '投票时间',
            dataIndex: 'voteTime',
            key: 'voteTime',
            align: 'center' as 'center',
            sorter: (a, b) => Date.parse(a.voteTime) - Date.parse(b.voteTime),
        },
        {
            title: '投票行为',
            dataIndex: 'behavior',
            key: 'behavior',
            align: 'center' as 'center',
        },
    ];
    const columnsProposalVote:ColumnsType<{id: number;voteTime:string;voter: JSX.Element;behavior:string;}> = [
        {
            title: '投票时间',
            dataIndex: 'voteTime',
            key: 'voteTime',
            align: 'center' as 'center',
            sorter: (a, b) => Date.parse(a.voteTime) - Date.parse(b.voteTime),
        },
        {
            title: '投票人',
            dataIndex: 'voter',
            key: 'voter',
            align: 'center' as 'center',
        },
        {
            title: '投票行为',
            dataIndex: 'behavior',
            key: 'behavior',
            align: 'center' as 'center',
        },
    ];
    const columnsBonus :ColumnsType<{id:string,URI:string,awardTime:string}> = [
        {
            title: '纪念品独有编号',
            dataIndex: 'id',
            key: 'id',
            align: 'center' as 'center',
        },
        {
            title: '纪念品名称',
            dataIndex: 'URI',
            key: 'URI',
            align: 'center' as 'center',
        },
        {
            title: '领取时间',
            dataIndex: 'awardTime',
            key: 'awardTime',
            align: 'center' as 'center',
            sorter: (a, b) => Date.parse(a.awardTime) - Date.parse(b.awardTime),
        },
    ];

    const AllProposalTable = () => {
        if (allProposalData.length==0) {
            return <Empty/>
        } else {
            return <Table dataSource={allProposalData} columns={columnsProposal} pagination={{
                hideOnSinglePage: true, // 只有一页时不显示分页
                pageSize:5,
                showTotal: () => `共 ${allProposalData.length} 条`, // 显示总共有多少条
                total: allProposalData.length, // 总共有多少条
            }}/>
        }
    }

    const UserProposalTable = () => {
        if (userProposalData.length==0) {
            return <Empty/>
        } else {
            return <Table dataSource={userProposalData} columns={columnsUserProposal} pagination={{
                hideOnSinglePage: true, // 只有一页时不显示分页
                pageSize:5,
                showTotal: () => `共 ${userProposalData.length} 条`, // 显示总共有多少条
                total: userProposalData.length, // 总共有多少条
            }}/>
        }
    }

    const UserVoteTable = () => {
        if (userVoteData.length==0) {
            return <Empty/>
        } else {
            return <Table dataSource={userVoteData} columns={columnsVote} pagination={{
                hideOnSinglePage: true, // 只有一页时不显示分页
                pageSize:5,
                showTotal: () => `共 ${userVoteData.length} 条`, // 显示总共有多少条
                total: userVoteData.length, // 总共有多少条
            }}/>
        }
    }

    const UserProposalVoteTable = (id:{ id: number; }) => {
        if (userProposalVoteData.length==0) {
            return <Empty/>
        } else {
            return <Table dataSource={userProposalVoteData.filter((item)=>item.id==id.id)} columns={columnsProposalVote} pagination={{
                hideOnSinglePage: true, // 只有一页时不显示分页
                pageSize:5,
                showTotal: () => `共 ${userProposalVoteData.filter((item)=>item.id==id.id).length} 条`, // 显示总共有多少条
                total: userProposalVoteData.filter((item)=>item.id==id.id).length, // 总共有多少条
            }}/>
        }
    }

    const UserBonusTable = () => {
        if (userBonusData.length==0) {
            return <Empty/>
        } else {
            return <Table dataSource={userBonusData} columns={columnsBonus} pagination={{
                hideOnSinglePage: true, // 只有一页时不显示分页
                pageSize:5,
                showTotal: () => `共 ${userBonusData.length} 条`, // 显示总共有多少条
                total: userBonusData.length, // 总共有多少条
            }}/>
        }
    }

    // 提案提交数据
    let _proposalContent = ""
    let _startTime = 0
    let _endTime = 0
    let timeValidity = false;
    const { TextArea } = Input;
    const { RangePicker } = DatePicker;

    const [open, setOpen] = useState(false)
    const [submit, setSubmit] = useState(false)

    const showModal = () => {
        setOpen(true)
        setSubmit(false)
    };

    const handleOk = async () => {
        await addNewProposal(_proposalContent,_startTime,_endTime)
    };

    const handleCancel = () => {
        setOpen(false)
        setSubmit(false)
        getUserInfo()
        getProposalInfo()
    };



    const onOk = (value: RangePickerProps['value']) => {
        if (value == null || value == undefined) {
            _startTime = 0;
            _endTime = 0;
        } else {
            _startTime = 0;
            _endTime = 0;
            if (value[0]!=null) {
                _startTime = +(value[0].valueOf()/1000).toFixed(0)
            }
            if (value[1]!=null) {
                _endTime = +(value[1].valueOf()/1000).toFixed(0)
            }
        }

        if (_startTime==0||_endTime==0) {
            timeValidity = false;
            setErrorMessage("Both StartTime and EndTime must be set.")
        } else if (_endTime<timeNow()) {
            timeValidity = false;
            setErrorMessage("EndTime must be time in the future.")
        } else {
            timeValidity = true;
        }
    };

    // 提案中心的HTML
    const ProposalCenter = () => {
        return (
            <Layout className="site-layout" style={{ marginLeft: 200, minHeight:900}}>
                {(errorMessage !== "" && open == false) && <Alert type="error" message={errorMessage} banner closable afterClose={()=>setErrorMessage("")} />}
                {(successMessage !== "" && open == false) && <Alert type="success" message={successMessage} banner closable afterClose={()=>setSuccessMessage("")} />}
                <Header className="header" >
                    <br/>
                    <Row justify="space-around" align="middle">
                        <Col span={6}><FileTextOutlined /> <br/>提案总数{proposalsInfo.length}项</Col>
                        <Col span={6}><FileDoneOutlined /> <br/>提案通过率{proposalsInfo.length==0?0:(proposalsInfo.filter((item)=>item.status===2).length / (proposalsInfo.filter((item)=>item.status===2).length+proposalsInfo.filter((item)=>item.status===1).length) * 100).toFixed(2)}%</Col>
                        <Col span={6}><TeamOutlined /> <br/>参与总人数{userAddresses.length}人</Col>
                        <Col span={6}><HighlightOutlined /> <br/>有效投票总次数{proposalsInfo.length==0?0:((proposalsInfo.map((item)=>item.votesInfo.length)).map((item,index,array)=>index!=0?array[0]+=item:array[0]+=0)).reverse()[0]}次</Col>
                    </Row>
                </Header>
                <Content style={{ margin: '16px', marginTop:'0px', padding:"16px", backgroundColor:"white", overflow: 'initial' }}>
                    <div className="toolBar" >
                        <Row justify="space-around" align="middle">
                            <Col span={20}>
                                <Popconfirm title={"提交提案将消耗"+tpConsumedByProposal+" TP。你目前有"+userInfo.balance+" TP。是否确定继续？"} onConfirm={showModal} okText="确定" cancelText="取消" placement="top">
                                    {account!==""&&<Button type="primary" size="large" shape="round" icon={<FileAddOutlined />} >发起提案</Button>}
                                </Popconfirm>
                            </Col>
                        </Row>
                    </div>
                    <Modal
                        transitionName=""
                        maskTransitionName=""
                        open={open}
                        title="发起提案"
                        onOk={handleOk}
                        onCancel={handleCancel}
                        footer={[
                            <Button key="back" onClick={handleCancel}>
                                取消
                            </Button>,
                            <Button key="submit" type="primary" onClick={handleOk} disabled={submit}>
                                {submit==true?"提案已提交":"提交提案"}
                            </Button>,
                        ]}
                    >
                        {(errorMessage !== "" && open == true) && <Alert type="error" message={errorMessage} banner closable afterClose={()=>setErrorMessage("")} />}
                        {(successMessage !== "" && open == true) && <Alert type="success" message={successMessage} banner closable afterClose={()=>setSuccessMessage("")} />}
                        <div style={{margin:"8px"}}>
                            <RangePicker
                                showTime={{ format: 'HH:mm:ss' }}
                                format="YYYY-MM-DD HH:mm:ss"
                                onOk={onOk}
                            />
                        </div>
                        <div style={{margin:"8px"}}>
                            <TextArea showCount maxLength={200}  onChange={(event)=>_proposalContent = event.target.value} />
                        </div>
                    </Modal>
                    <Divider />
                    <AllProposalTable/>
                </Content>
                <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
            </Layout>
        );
    }

    // 异常信息和成功信息
    const [successMessage, setSuccessMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    // 更好地输出revert报错信息
    const revertOutput = (err: any)=> {
        const start = err.message.indexOf("revert ")
        const end = err.message.indexOf("\"", start)
        if (start === -1 || end === -1) {
            setErrorMessage(err.message)
        } else {
            setErrorMessage(err.message.substring(start+7,end))
        }
    }

    const [open_, setOpen_] = useState(false)
    const [voteInfoId, setVoteInfoId] = useState(0)


    const info = (id:number) => {
        setOpen_(true)
        setVoteInfoId(id)
    };

    const handleCancel_ = () => {
        setOpen_(false)
        getUserInfo()
        getProposalInfo()
    };

    // 用户中心的HTML
    const UserCenter = () => {
        return (
            <Layout className="site-layout" style={{ marginLeft: 200 , minHeight:900}}>
                {errorMessage !== "" && <Alert type="error" message={errorMessage} banner closable afterClose={()=>setErrorMessage("")} />}
                {successMessage !== "" && <Alert type="success" message={successMessage} banner closable afterClose={()=>setSuccessMessage("")} />}
                <Header className="header" >
                    <br/>
                    <Row justify="space-around" align="middle">
                        <Col span={6}><FileTextOutlined /> <br/>你一共提交了{(account === "" || !userInfo.proposalIds)?0:userInfo.proposalIds.length}项提案</Col>
                        <Col span={6}><HighlightOutlined /> <br/>你一共参与了{(account === "" || !userInfo.votesInfo)?0:userInfo.votesInfo.length}次投票</Col>
                        <Col span={6}><GiftOutlined /> <br/>你拥有{(account === "" || !userInfo.bonusInfo)?0:userInfo.bonusInfo.length}个纪念品</Col>
                        <Col span={6}><DollarCircleOutlined /> <br/>你拥有通证积分{(account === "")?0:userInfo.balance} TP</Col>
                    </Row>
                </Header>
                <Content style={{ margin: '16px', marginTop:'0px', padding:"16px", backgroundColor:"white", overflow: 'initial' }}>
                    <div className="userBar" >
                        <Row justify="space-around" align="middle" style={{fontSize:"xxx-large"}}>
                            <Col span={20}>
                                <GitlabFilled />
                            </Col>
                        </Row>
                        <Row justify="space-around" align="middle" >
                            <Col span={20}>
                                {account === '' ? '你尚未连接' : <Tag style={{fontSize:"x-large", padding:"16px"}} icon={<UserOutlined/>} color="blue">{account}</Tag>}
                            </Col>
                        </Row>
                        <Row justify="space-around" align="middle">
                            <Col span={20}>
                                {account === ""?<Button type="primary" size="large" shape="round" icon={<WalletOutlined />} onClick={onClickConnectWallet}>连接钱包</Button>:(userInfo.getInitialTp == true?<Button type="primary" size="large" shape="round" icon={<DollarCircleOutlined />} onClick={getTP}>领取初始通证积分TP</Button>:(userInfo.getBonusReward==true && <Button type="primary" size="large" shape="round" icon={<GiftOutlined />} onClick={getBonusReward}>领取纪念品奖励</Button>))}
                            </Col>
                        </Row>
                    </div>
                </Content>
                <Content style={{ margin: '16px', marginTop:'0px', padding:"16px", backgroundColor:"white", overflow: 'initial' }}>
                    <Tabs
                        defaultActiveKey="1"
                        centered
                        items={[{label: (<span><FileTextOutlined /> 我的提案</span>), key: '1', children: <UserProposalTable/>},
                                {label: (<span><HighlightOutlined /> 我的投票</span>), key: '2', children: <UserVoteTable/>},
                                {label: (<span><GiftOutlined /> 我的纪念品</span>), key: '3', children: <UserBonusTable/>}
                        ]}
                    />
                    <Modal
                        transitionName=""
                        maskTransitionName=""
                        open={open_}
                        title={"提案"+voteInfoId+"的投票详情"}
                        onCancel={handleCancel_}
                        width={800}
                        footer={[
                            <Button key="ok" type="primary" onClick={handleCancel_}>
                                确定
                            </Button>,
                        ]}
                    >
                        {(errorMessage !== "" && open == true) && <Alert type="error" message={errorMessage} banner closable afterClose={()=>setErrorMessage("")} />}
                        {(successMessage !== "" && open == true) && <Alert type="success" message={successMessage} banner closable afterClose={()=>setSuccessMessage("")} />}
                        <UserProposalVoteTable id={voteInfoId}/>
                    </Modal>
                </Content>
                <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
            </Layout>
        );
    }

    // 总的HTML
    return (
        <Layout hasSider className="site-layout">
            <Sider
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}
                theme="light"
            >
                <div className="logo"><SmileFilled /> DSOMW</div>
                <Menu theme="light" mode="inline" defaultSelectedKeys={['0']} items={items} onSelect={(item:any)=>{setMenuKey(item.key)}}/>
            </Sider>
            {menuKey == 0?<ProposalCenter/>:(menuKey == 1?<UserCenter/>:menuKey)}
        </Layout>
        // <div className="DSOMW">
        //     <div>你好！</div>
        //     {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
        //     <div>你的账户<UserOutlined/>：{account === '' ? '你尚未连接' : account}</div>
        //     <div>你的通证积分TP：{account === '' ? 0 : userInfo.balance}</div>
        //     <div>你发布的提案：{account === '' ? "无" : (userInfo.proposalIds.length === 0? "无":userInfo.proposalIds)}</div>
        //     <div>你的投票情况：{account === '' ? "无" : (userInfo.votesInfo.length === 0? "无":userInfo.votesInfo.map((val)=>{return <p>{"你在"+val.voteTime+"时给提案"+val.proposalIdVotedOn+"投了"+(val.behavior===1?"赞成票":"反对票")+"\n"}</p>}))}</div>
        //     <div>你的纪念品：{account !== '' && (userInfo.getBonusReward===true && <Button onClick={getBonusReward}>获取纪念品奖励</Button>)}{account === '' ? "无" : (userInfo.bonusInfo.length === 0? "无":userInfo.bonusInfo.map((val)=>{return <p>{val.URI+"（编号："+val.id+"，获得时间："+val.awardTime+"）"}</p>}))}</div>
        //     <div>{account !== '' && <Button onClick={getTP}>获取通证积分</Button>}</div>
        //     <div>{account !== '' && <Button onClick={addNewProposal}>发起提案</Button>}</div>
        //     <div>所有提案：{account === '' ? "无" : (proposalsInfo.length === 0? "无":proposalsInfo.map((val)=>{return <p>{account !== '' && <Button onClick={(e)=>voteOnProposal(1,val.id)}>赞成</Button>}{account !== '' && <Button onClick={(e)=>voteOnProposal(0,val.id)}>反对</Button>}{account !== '' && (val.getTpReward == true && <Button onClick={(e)=>getTpRewardFromProposalApproved(val.id)}>领取通证积分TP奖励</Button>)}{"提案"+val.id+"的内容是："+val.content+" 发起人是："+val.proposer+" 投票截止时间是："+val.voteEndTime+" 提案当前状态是："+(val.status===0?"正在投票中":(val.status===1?"已拒绝":"已通过"))+" 投票情况："+"赞成"+val.votesInfo.filter((item)=>{return item.behavior===1}).length+"反对"+val.votesInfo.filter((item)=>{return item.behavior===0}).length+"\n"}</p>}))}</div>
        // </div>
    );
}



export default DSOMWPage