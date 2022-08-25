const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

// unit tests should only run on development net
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe
      let deployer
      let mockV3Aggregator
      const sendValue = ethers.utils.parseEther("1") // convert ether to gwei

      beforeEach(async () => {
        // deploy FundMe contract using hardhat-deploy
        // const accounts = await ethers.getSigners()
        // const accountZero = accounts[0] (aka deployer below)
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"]) // run deployments tagged 'all'
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        )
      })

      describe("constructor", async () => {
        it("sets the aggregator correctly", async () => {
          const response = await fundMe.getPriceFeed()
          assert.equal(response, mockV3Aggregator.address)
        })
      })

      describe("fund", async () => {
        it("fails if your don't send enough eth", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          )
        })
        it("updates the amount funded data structure", async () => {
          await fundMe.fund({ value: sendValue })
          const response = await fundMe.getAddressToAmountFunded(deployer)
          assert.equal(response.toString(), sendValue.toString())
        })
        it("adds funder to array of funders", async () => {
          await fundMe.fund({ value: sendValue })
          const funder = await fundMe.getFunder(0)
          assert.equal(funder, deployer)
        })
      })

      describe("withdraw", async () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue })
        })

        it("can withdraw ETH from a single funder", async () => {
          // arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // act
          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundmeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // assert
          assert.equal(endingFundmeBalance, 0) // we've withdrawn all the funds
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
        })

        it("allows us to withdraw with multiple funders", async () => {
          const accounts = await ethers.getSigners()
          for (let i = 0; i < 6; ++i) {
            // send eth to our contract from multiple funders
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundmeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          assert.equal(endingFundmeBalance, 0) // all funds withdrawn from contract
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          ) // contract owner receives all possible amount
          expect(fundMe.getFunder(0)).to.be.reverted // funders properly reset
          for (let i = 0; i < 6; ++i) {
            // addressToAmountFunded zeroed out correctly
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })

        it("only allows the owner to withdraw", async () => {
          const accounts = await ethers.getSigners()
          const attacker = accounts[1]
          const attackerConnectedContract = await fundMe.connect(attacker)
          expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
            "FundMe__NotOwner"
          )
        })

        it("cheaperWithdraw...", async () => {
          const accounts = await ethers.getSigners()
          for (let i = 0; i < 6; ++i) {
            // send eth to our contract from multiple funders
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          const transactionResponse = await fundMe.cheaperWithdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundmeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          assert.equal(endingFundmeBalance, 0) // all funds withdrawn from contract
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          ) // contract owner receives all possible amount

          expect(fundMe.getFunder(0)).to.be.reverted // funders properly reset
          for (let i = 0; i < 6; ++i) {
            // addressToAmountFunded zeroed out correctly
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })

        it("can withdraw ETH from a single funder -- cheaper", async () => {
          // arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // act
          const transactionResponse = await fundMe.cheaperWithdraw()
          const transactionReceipt = await transactionResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundmeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // assert
          assert.equal(endingFundmeBalance, 0) // we've withdrawn all the funds
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
        })
      })
    })
