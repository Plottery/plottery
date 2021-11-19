import { SyncOutlined } from "@ant-design/icons";
import { utils, BigNumber } from "ethers";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { Address, Balance, Events } from "../components";
import {
  useContractLoader,
  useContractReader,
  useUserProviderAndSigner,
} from "eth-hooks";

function _dumpUpdate(update) {
  console.log("📡 Transaction Update:", update);
  if (update && (update.status === "confirmed" || update.status === 1)) {
    console.log(" 🍾 Transaction " + update.hash + " finished!");
    console.log(
      " ⛽️ " +
      update.gasUsed +
      "/" +
      (update.gasLimit || update.gas) +
      " @ " +
      parseFloat(update.gasPrice) / 1000000000 +
      " gwei",
    );
  }
}


function GM({
  address,
  userSigner,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [newSecret, setNewSecret] = useState(BigNumber.from("0x0"));
  const [errSecret, setErrSecret] = useState(false);

  const hashfn = (secret, address) => utils.solidityKeccak256(['uint256', 'address'], [secret, address]);

  return (<div>
    <div>You are Game Master</div>
          Secret must be valid BigNumber text {errSecret ? 'ERROR! ' :''}: <Input
            onChange={e => {
              try {
                setErrSecret(false);
                let s = BigNumber.from(e.target.value);
                setNewSecret(s);
              } catch(err) {
                setErrSecret(true);
                console.log("BAD INPUT! ", e.target.vaue);
              }
            }}
          />

          <div>secretHash {address ? hashfn(newSecret, address) : '...'}</div>
    
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = tx(writeContracts.Plottery.close(hashfn(newSecret, address)), _dumpUpdate);
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Close round and commit hashed secret for 10 blocks
          </Button>

          <Divider/>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = tx(writeContracts.Plottery.reveal(newSecret), _dumpUpdate);
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Reveal secret to complete round
          </Button>
    </div>)
}

function MyTix({
  address,
  userSigner,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const tixBal = useContractReader(readContracts, "Tix", "balanceOf", [address]);
  const tix1 = useContractReader(readContracts, "Tix", "tokenOfOwnerByIndex", [address, 0]);

  return (<div>
    <div>You have {tixBal ? tixBal.toString() : '...'} TIX</div>
    1st/next tix: { tix1 ? tix1.toString() : '...'}

          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = tx(writeContracts.Tix.approve(readContracts.Plottery.address, tix1), _dumpUpdate);
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Approve to play
          </Button>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = tx(writeContracts.Plottery.enter(tix1), _dumpUpdate);
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Enter it
          </Button>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = tx(writeContracts.Tix.mint(address), _dumpUpdate);
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            I need more tickets (TODO add to jackpot)
          </Button>
    </div>);
}
function Foo({
  address,
  userSigner,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const cornBal = useContractReader(readContracts, "BitCorn", "balanceOf", [address]);
  const jackpot = /*100*/ useContractReader(readContracts, "Plottery", "jackpot");
  const canEnter = /*true*/ useContractReader(readContracts, "Plottery", "canEnter");
  const entryCount = useContractReader(readContracts, "Plottery", "entryCount");

  return (<div>
        <h4>Your BitCorns: {cornBal ? utils.formatEther(cornBal) : 'bitCorn.balanceOf'}</h4>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = tx(writeContracts.BitCorn.freeCorn(), _dumpUpdate);
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Get Free Corn
          </Button>
        <h4>Jackpot: {jackpot ? utils.formatEther(jackpot) : 'bitCorn.balanceOf'} CORN</h4>
        <h4>Tickets Entered in Round: {entryCount ? entryCount.toString() : '...'} tickets</h4>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = tx(writeContracts.BitCorn.transfer(readContracts.Plottery.address, utils.parseEther('100')), _dumpUpdate);
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Donate 100 CORN to Jackpot
          </Button>
        <h4>Game on? {canEnter ? 'yes': 'no'}</h4>
        {readContracts ? <MyTix 
              address={address}
              userSigner={userSigner}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
          /> : ''}
      </div>);
}

import ticketPng from'../assets/goldenticket.png';

/*
step1 - assume already set up - just need to mint new tickets

curl --request POST \
  --url https://api.nftport.xyz/v0/contracts \
  --header 'Authorization: ee53d0a8-345c-4655-86ac-41554d5ba968' \
  --header 'Content-Type: application/json' \
  --data '{
  "chain": "rinkeby",
  "name": "TiOne",
  "symbol": "T1",
  "owner_address": "0x7212f07cc038cC838B0B7F7AE236bf98dae221d4"
}'


{"response":"OK","chain":"rinkeby","transaction_hash":"0x2b9903d1116ab0f5fc9a6ec2ba41002c0d447446d3fd9aa415404e80c1393c0e","transaction_external_url":"https://rinkeby.etherscan.io/tx/0x2b9903d1116ab0f5fc9a6ec2ba41002c0d447446d3fd9aa415404e80c1393c0e","owner_address":"0x7212f07cc038cC838B0B7F7AE236bf98dae221d4","name":"TiOne","symbol":"T1"}

- doesn't return contract address??


step 2 - for a ticket
curl --request POST \
    --url 'https://api.nftport.xyz/v0/files' \
    --header 'Authorization: ee53d0a8-345c-4655-86ac-41554d5ba968' \
    --header 'Content-Type: multipart/form-data' \
    --form 'file=@/Users/tomo/Downloads/goldenticket.png;type=image/png'

{"response":"OK","ipfs_url":"https://ipfs.io/ipfs/QmXh4yqJU4hMJ1HPDosYqpYpBnTxZdBzop9TJp8uhc6xrS","file_name":"goldenticket.png","content_type":"image/png","file_size":4454,"file_size_mb":0.0042,"error":null}

-- use generated ticket image data

step 3 - use ipfs file
curl --request POST \
  --url https://api.nftport.xyz/v0/metadata \
  --header 'Authorization: ee53d0a8-345c-4655-86ac-41554d5ba968' \
  --header 'Content-Type: application/json' \
  --data '{
  "name": "My Tra",
  "description": "This is my custom art piece",
  "file_url": "https://ipfs.io/ipfs/QmXh4yqJU4hMJ1HPDosYqpYpBnTxZdBzop9TJp8uhc6xrS"
}'

{"response":"OK","metadata_uri":"ipfs://QmZ1Y2WrcwpzDkaGVbXhiffZvjuAgYyiAVaMbmqiT78uxH","name":"My Tra","description":"This is my custom art piece","file_url":"https://ipfs.io/ipfs/QmXh4yqJU4hMJ1HPDosYqpYpBnTxZdBzop9TJp8uhc6xrS","external_url":null,"animation_url":null,"custom_fields":null,"attributes":null,"error":null}




  */
function GoldenTicket({ }) {
  function draw() {
    const ctx = document.getElementById('canvas').getContext('2d');
    const img = new Image();
    img.src = ticketPng;
    ctx.drawImage(img, 0, 0);
    ctx.font = '60px PressStart2P';
    ctx.fillText(('0000' + newNum).slice(-4), 128, 165);
  }
  function mint() {
    // 1. Upload file to IPFS
    const canvas = document.getElementById('canvas');

    canvas.toBlob(async (blob) => {
      let url = 'https://api.nftport.xyz/v0/files';
      const formData = new FormData();
      formData.append('file', blob, `tix${newNum}.png`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'ee53d0a8-345c-4655-86ac-41554d5ba968',
          //'Content-Type': 'multipart/form-data', // NO
        },
        body: formData
      });
      // TODO check errors
      const fileRespJson = await response.json();
      console.log('posted tix ipfs: ', fileRespJson);

      // 2. Create metadata on IPFS
      url = 'https://api.nftport.xyz/v0/metadata';
      const metadataJson = `{ "name": "TIX ${newNum}", "description": "Plottery Ticket #${newNum}", "file_url": "${fileRespJson.ipfs_url}" }`;
      const metadataResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'ee53d0a8-345c-4655-86ac-41554d5ba968',
          'Content-Type': 'application/json',
        },
        body: metadataJson
      });
      // TODO check errors
      const metadataRespJson = await metadataResponse.json();
      console.log('posted metadata: ', metadataRespJson);

      // 3. Finally mint NFT
      url = 'https://api.nftport.xyz/v0/mints/customizable';
      const chain = 'rinkeby'; // TODO
      const myContract = '0x3539a35349c755081c319f9dcb1d9f1acf57381d';
      const myAddress = '0x7212f07cc038cC838B0B7F7AE236bf98dae221d4'; // TODO use address
      const nftJson = `{ "chain": "${chain}", "contract_address": "${myContract}", "metadata_uri": "${metadataRespJson.metadata_uri}", "mint_to_address": "${myAddress}", "token_id": "${newNum}" }`;
      const nftResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'ee53d0a8-345c-4655-86ac-41554d5ba968',
          'Content-Type': 'application/json',
        },
        body: nftJson
      });
      // TODO check errors
      const nftRespJson = await nftResponse.json();
      console.log('posted nft: ', nftRespJson);
    });
  }

  const [newNum, setNewNum] = useState(9999);
  const [errNum, setErrNum] = useState(false);

  return (
    <div>
      <canvas id='canvas' width='490' height='270' ></canvas>
      <h2>Choose a lucky number from 0 to 9999</h2>
      <Input value={newNum}
            onChange={e => {
              try {
                setErrNum(false);
                let n = parseInt(e.target.value);
                if (n < 0 || n > 9999) {
                  console.log(`${n} is out of range`);
                  setErrNum(true);
                } else {
                  setNewNum(n);
                }
              } catch(err) {
                setErrNum(true);
                console.log("BAD INPUT! ", e.target.vaue);
              }
            }}
      />
      <button onClick={() => draw()} >draw</button>
      <button onClick={() => mint()} >mint</button>
    </div>
  );
}

export default function ExampleUI({
  address,
  userSigner,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  // TODO show how many current entries
  // TODO save timestamp of last time _open was called, that's how long game has been running

  return (
    <div>
      <GoldenTicket />
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "20px solid #000000", padding: 16, width: "auto", margin: "auto", marginTop: 64 }}>
        <h2>Plottery UI:</h2>

        {readContracts ? <Foo 
              address={address}
              userSigner={userSigner}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
          /> : ''}
        {readContracts ? <GM 
              address={address}
              userSigner={userSigner}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
          /> : ''}
        <Divider />
        Your Address:
        <Address address={address} ensProvider={mainnetProvider} fontSize={16} />
        <Divider />
        {/* use utils.formatEther to display a BigNumber: */}
        <h2>Your Balance: {yourLocalBalance ? utils.formatEther(yourLocalBalance) : "..."}</h2>
        <div>OR</div>
        <Balance address={address} provider={localProvider} price={price} />
        <Divider />
        Your Contract Address:
        <Address
          address={readContracts && readContracts.Plottery ? readContracts.Plottery.address : null}
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <Divider />
      </div>

      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in YourContract.sol! )
      */}
      <h2>Entered:</h2>
      <Events
        contracts={readContracts}
        contractName="Plottery"
        ensProvider={mainnetProvider}
        eventName="Entered"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />

      <h2>Closed:</h2>
      <Events
        contracts={readContracts}
        contractName="Plottery"
        ensProvider={mainnetProvider}
        eventName="Closed"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />

      <h2>SendPrize:</h2>
      <Events
        contracts={readContracts}
        contractName="Plottery"
        ensProvider={mainnetProvider}
        eventName="SendPrize"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />

    </div>
  );
}
