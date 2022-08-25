/** deploys mock price feed contracts */
const { network } = require("hardhat")
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  // we're running this on our local network
  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks...")
    await deploy("MockV3Aggregator", {
      from: deployer,
      //   contract: "MockV3Aggregator",
      log: true,
      args: [DECIMALS, INITIAL_ANSWER] // these will get passed to the constructor of MockV3Aggregator
    })
    log("Mocks deployed!")
    log("-----------------------------------------------")
  }
}

// for categorizing this deploy. it's unique id is "mocks". We can then deploy it using 'hardhat deploy --tags mocks'
module.exports.tags = ["all", "mocks"]
