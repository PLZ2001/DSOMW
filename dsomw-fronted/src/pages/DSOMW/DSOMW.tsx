// import {Button, Image} from 'antd';
// import {Header} from "../../asset";
// import {UserOutlined} from "@ant-design/icons";
import {useEffect, useState} from 'react';
import {DSOMWContract, myERC20Contract, web3} from "../../utils/contracts";
import './DSOMW.css';

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

// 更好地输出revert报错信息
const revertOutput = (err: any)=> {
    var errorMessageInJson = JSON.parse(
        err.message.slice(58, err.message.length - 2)
    );
    var errorMessageToShow = errorMessageInJson.data.data[Object.keys(errorMessageInJson.data.data)[0]].reason;
    alert(errorMessageToShow);
    return;
}

const DSOMWPage = () => {

    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)
    const [proposalIds, setProposalIds] = useState([])

    // 初始化动作：检查用户是否已经连接钱包
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
    // 初始化动作：获取账户余额
    const getAccountInfo = async () => {
        if (myERC20Contract) {
            const ab = await myERC20Contract.methods.balanceOf(account).call({from: account})
            setAccountBalance(ab)
        } else {
            alert('Contract not exists.')
        }
    }
    // 初始化动作：获取所有提案信息
    const getProposalsInfo = async () => {
        if (DSOMWContract) {
            const result = await DSOMWContract.methods.getProposalIds().call({from: account})
            const ids = result.map((item:string)=>+item)
            console.log(ids)
            setProposalIds(ids)
        } else {
            alert('Contract not exists.')
        }
    }
    // 按键动作：连接钱包
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
    // 按键动作：领取通证积分TP
    const onGetTP = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (myERC20Contract) {
            try {
                await myERC20Contract.methods.getTP(account).send({
                    from: account
                })
                getAccountInfo()
                alert('You have Token Point now.')
            } catch (error: any) {
                revertOutput(error)
            }

        } else {
            alert('Contract not exists.')
        }
    }
    // 按键动作：发起提案
    const onAddNewProposal = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (DSOMWContract && myERC20Contract) {
            try {
                await myERC20Contract.methods.approve(DSOMWContract.options.address, 1000).send({
                    from: account
                })
                await DSOMWContract.methods.addNewProposal("haha").send({
                    from: account
                })
                getProposalsInfo()
                getAccountInfo()
                alert('You add a new proposal.')
            } catch (error: any) {
                revertOutput(error)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    useEffect(() => {
        initCheckAccounts()
    }, [])

    useEffect(() => {
        if(account !== '') {
            getAccountInfo()
        }
    }, [account])

    useEffect(() => {
        getProposalsInfo()
    }, [])

    return (
        <div className="DSOMW">
            <div>你好！</div>
            {account === '' && <button onClick={onClickConnectWallet}>连接钱包</button>}
            <div>当前用户：{account === '' ? '无用户连接' : account}</div>
            <div>当前用户拥有通证积分TP数量：{account === '' ? 0 : accountBalance}</div>
            {account != '' && <button onClick={onGetTP}>获取通证积分</button>}
            {account != '' && <button onClick={onAddNewProposal}>发送提案</button>}
            <div>
                <ul>
                    {(()=>{
                        return proposalIds.map((item)=><li>{item}</li>);
                    })()}
                </ul>
            </div>
        </div>
    );
}

export default DSOMWPage