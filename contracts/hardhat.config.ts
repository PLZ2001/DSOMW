import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    ganache: {
      url:'http://127.0.0.1:8545', //ganache区块链端口
      accounts: [
        '0x84447146f6c5924d63f909c9a2ea274ca163cf7ee0b43cfcffbd09380e6344ef',
        '0xc4f82fb8e160423bb3d3a93413d9fb42f1056fe5827b91e1e809bc0b59f7eee8',
        '0x95634bdc67987e755e5406e4cdd498aedacd1263437927e113ef7ceeea75cece',
        '0x446d979d8dacc802b9648d064232843dfe952eab2092d8f8fb0e6a5443a1adfd',
        '0x1d87a7c6ec3a773a814fd08cf3bfa7ee6c59e96250fb3c318fd024c493e24650'
      ] //需要使用的账户的私钥，从ganache里获取
    }
  }
};

export default config;
