const hre = require("hardhat");
const fs = require("fs");

async function main() {


    const HFT = await hre.ethers.deployContract("MyNFT");

    await HFT.waitForDeployment();

    console.log(`Contract deployed to ${HFT.target}`);

    // 调用合约的 owner 函数来获取拥有者信息
    const owner = await HFT.owner();
    console.log('合约拥有者:', owner);

    // Write ABI and address to lock.json
    const contractInfo = {
        abi: HFT.interface.format("json"),
        address: HFT.target,
    };

    // 创建ABI和合约地址文件
    fs.writeFileSync("./src/OFT.json", JSON.stringify(contractInfo, null, 2));

    console.log("ABI and address written to OFT.json");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
