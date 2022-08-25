/** Deploys FundMe contract */
const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()

  let ethUsdPriceFeedAddress
  if (developmentChains.includes(network.name)) {
    // fetch mock price feed contract address
    const ethUsdAggregator = await get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    // get the address of the price feed contract for the network that we'll deploy
    // our contract on
    ethUsdPriceFeedAddress =
      networkConfig[network.config.chainId].ethUsdPriceFeed
  }

  const args = [ethUsdPriceFeedAddress]
  // finally deploy our contract on whichever network we choose
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args, // goes to the constructor of the FundMe contract
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1
  })

  // verify our contract on etherscan
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args)
  }
  log("------------------------------------")
}

module.exports.tags = ["all", "fundMe"]
