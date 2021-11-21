import { SyncOutlined } from "@ant-design/icons";
import { utils, BigNumber } from "ethers";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { Address, Balance, Events, SendPrizeEvents } from "../components";
import {
  useContractLoader,
  useContractReader,
  useUserProviderAndSigner,
  useOnBlock,
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
  const futureBlockNumber = useContractReader(readContracts, "Plottery", "futureBlockNumber");
  const dealerKeys = useContractReader(readContracts, "DealerKey", "balanceOf", [address]);
  
  //useOnBlock(mainnetProvider, () => {
  //  console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  useOnBlock(localProvider, () => {
    console.log(`⛓ A new local block is here: ${localProvider._lastBlockNumber}`);
  });


  return (<div>

          <div>{ dealerKeys && dealerKeys.toNumber() > 0 ? 'You are a dealer' : 'You are NOT a dealer'}</div>
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
          <span>Wait until block {futureBlockNumber ? futureBlockNumber.toString() : '?'} to reveal</span>
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

    </div>);
}

export default function Dealer({
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
      <div style={{ border: "20px solid red", padding: 16, width: "auto", margin: "auto", marginTop: 64 }}>
        <h2>Plottery Dealer UI:</h2>

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
