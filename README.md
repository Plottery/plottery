# Plottery

# 🏄‍♂️ Quick Start

### Manual setup

Prerequisites: [Node](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> install and start your 👷‍ Hardhat chain:

```# Only if deploying locally, otherwise connect to public chain and use deployed contracts```
```bash
yarn install
yarn chain
```

> Set up Gelato task with ABI from `./plottery-abi.json` and function `stashHash()`

[Gelato task creator](https://beta.app.gelato.network/new-task)

<img width="674" alt="Gelato Task Creation" src="https://user-images.githubusercontent.com/1016509/142756568-5f6fc4b3-b50c-41ff-9fe7-cfd7a79111c1.png">

> in a second terminal window, start your 📱 frontend:

```bash
yarn start
```

> Mint claim tokens to be airdropped to configured airdropee addresses using NFTPort with our deployed custom contract

[NFTPort Airdropper](http://localhost:3000/goldenticket)

<img width="841" alt="nftport-claim" src="https://user-images.githubusercontent.com/1016509/142756547-1e94e0e5-3d12-4f5e-94ef-272cf27fa3c8.png">

> in a third terminal window, 🛰 deploy your contract:

```bash
yarn deploy
```

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

