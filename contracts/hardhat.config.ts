import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
const config: HardhatUserConfig = {
  solidity: {
    version:"0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    ganache: {
      url:'http://127.0.0.1:8545', //ganache区块链端口
      accounts: [
        '0xb6d64d8abe4edab48cd29fdd5480921b9107a2a0a51d7eab87ebc949b2b7459c',
        '0xb71ec4659c07db1e4a42ad59e622d4ab6f09a2ebfee86c741d7040f479ab8547',
        '0x8712fbb24691fbdde3139e930cd0cbd2b913954684350a853806f1423ebbacd1'
      ], //需要使用的账户的私钥，从ganache里获取
    }
  }
};

export default config;
