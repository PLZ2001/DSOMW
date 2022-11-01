# Decentralized Student Organization Management Website (DSOMW)
## 项目简介
本项目是一个基于智能合约和React前端的去中心化学生社团组织治理网站。

## 项目运行方法（Windows/MacOS）
需要预先安装：
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
   npm install
   cd contracts
   npm install
   cd ..
   cd dsomw-fronted
   npm install
   cd ..
```


### 3. 创建本地区块链
   * 启动Ganache
   * 新建Workspace
   * SERVER中的PORT NUMBER改为8545
   * 点击START

### 4. 将智能合约部署到本地区块链
```shell
   cd contracts
   npx hardhat run ./scripts/deploy.ts --network ganache
   cd ..
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
   * 设置-高级，打开显示测试网络
   * 导入账户，输入私钥（私钥从ganache界面中每一行账户右侧🔑点击获取）
   * 切换网络为 Localhost 8545

### 7. 启动网页
```shell
   cd dsomw-fronted
   npm start
```
   * 连接钱包，选择此前导入的账户
   * 开始使用网站吧！

