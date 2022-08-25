require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("dotenv").config()
require("hardhat-gas-reporter")

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || "https://rpc.url"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "apikey"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "Oxkey"
const COIN_MARKET_CAP_API_KEY = process.env.COIN_MARKET_CAP_API_KEY || "apikey"

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.8",
  namedAccounts: {
    deployer: {
      default: 0
    }
  },
  solidity: {
    compilers: [{ version: "0.8.8" }, { version: "0.6.6" }]
  },
  networks: {
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 4,
      // number of block confirmations to wait so that we are sure our
      // transaction went through
      blockConfirmations: 6
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COIN_MARKET_CAP_API_KEY,
    token: "ETH"
  }
}
