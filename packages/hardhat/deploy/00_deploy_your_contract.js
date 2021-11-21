// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy("Plottery", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
  });
  await deploy("DealerKey", {
    from: deployer,
    log: true,
  });
  await deploy("MockNftPort", {
    from: deployer,
    log: true,
  });
  await deploy("BitCorn", {
    from: deployer,
    log: true,
  });
  await deploy("Tix", {
    from: deployer,
    log: true,
  });

  // Getting a previously deployed contract
  const Plottery = await ethers.getContract("Plottery", deployer);
  /*  await YourContract.setPurpose("Hello");
  
    To take ownership of yourContract using the ownable library uncomment next line and add the 
    address you want to be the owner. 
    // yourContract.transferOwnership(YOUR_ADDRESS_HERE);

    //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */

  const me = "0x7212f07cc038cC838B0B7F7AE236bf98dae221d4";//"0x28E1499b7cE4861F9E24eEFBE171cea4Ab759865";
  const dealerKey = await ethers.getContract("DealerKey", deployer);
  const mockNftPort = await ethers.getContract("MockNftPort", deployer);
  const nftportToken = '0x3539a35349c755081c319f9dcb1d9f1acf57381d';
  const tix = await ethers.getContract("Tix", deployer);
  const bitCorn = await ethers.getContract("BitCorn", deployer);

  console.log('set NFTport contract to claimToken');
  //await tix.init(/*nftportToken*/ mockNftPort.address, bitCorn.address);
  await tix.init(nftportToken, bitCorn.address, Plottery.address);
  
  console.log('mint a key and give to me');
  const keyId = await dealerKey.mint();
  console.log(deployer, me, keyId);
  //await dealerKey.transferFrom(deployer, me, /*XXX*/ 1);
  console.log('deployer: ', deployer);
  //console.log("ownerOf(1) = ", await dealerKey.ownerOf(1));
  
  //await bitCorn.freeCorn();
  //await bitCorn.transfer(Plottery.address, ethers.utils.parseEther("10"));
  console.log('Plottery.owner: ', await Plottery.owner());
  await Plottery.init(tix.address, dealerKey.address, bitCorn.address);
  if (me != await Plottery.owner()) {
    //await Plottery.init(tix.address, dealerKey.address, bitCorn.address);
    console.log('check me');
    console.log('owner is ', await Plottery.owner());
    await Plottery.transferOwnership(me);
  }
  
  /*
  await tix.mint(me);
  await tix.mint(me);
  await tix.mint(me);
  await tix.mint(me);
  await tix.mint(me);
  */

  /*
  // Verify your contracts with Etherscan
  // You don't want to verify on localhost
  if (chainId !== localChainId) {
    await run("verify:verify", {
      address: Plottery.address,
      contract: "contracts/YourContract.sol:Plottery",
      contractArguments: [],
    });
  }
  */
};
module.exports.tags = ["YourContract"];
