const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract("FundMe", deployer)
  console.log("Withdrawing...")
  const transactionResponse = await fundMe.withdraw()
  await transactionResponse.wait(1)
  console.log("Got it back!")
}

main(() => process.exit(1)).catch((e) => {
  console.log(e)
  process.exit(1)
})
