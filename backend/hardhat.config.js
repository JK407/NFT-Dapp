require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config()




/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.21",
  allowUnlimitedContractSize: true,
  networks: {
    hardhat: {},
    localhost: {
      accounts: [`${process.env.LOCAL_PRIVATE_KEY}`],
      url: "http://127.0.0.1:8545" // 本地节点的URL
    },
    // MATIC_MAINNET: {
    //   accounts: [`${process.env.PRIVATE_KEY}`],
    //   url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    // },
    // MATIC_MUMBAI: {
    //   accounts: [`${process.env.PRIVATE_KEY}`],
    //   url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    // }
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
