/* ensure everything is working correctly on a test net */
const { assert } = require("chai")
const { ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

// staging tests should only run on test nets
developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe
      let deployer
      const sendValue = ethers.utils.parseEther("0.1")
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
      })

      it("allows people to fund and withdraw", async () => {
        await fundMe.fund({ value: sendValue })
        await fundMe.withdraw()
        const endingBalance = await fundMe.provider.getBalance(fundMe.address)
        assert.equal(endingBalance.toString(), "0")
      })
    })
