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
  const [newPurpose, setNewPurpose] = useState("loading...");
  const jackpot = /*100*/ useContractReader(readContracts, "Plottery", "jackpot");
  const canEnter = /*true*/ useContractReader(readContracts, "Plottery", "canEnter");
  // TODO show how many current entries
  // TODO save timestamp of last time _open was called, that's how long game has been running

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
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

      <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 256 }}>
        <Card>
          Check out all the{" "}
          <a
            href="https://github.com/austintgriffith/scaffold-eth/tree/master/packages/react-app/src/components"
            target="_blank"
            rel="noopener noreferrer"
          >
            📦 components
          </a>
        </Card>

        <Card style={{ marginTop: 32 }}>
          <div>
            There are tons of generic components included from{" "}
            <a href="https://ant.design/components/overview/" target="_blank" rel="noopener noreferrer">
              🐜 ant.design
            </a>{" "}
            too!
          </div>

          <div style={{ marginTop: 8 }}>
            <Button type="primary">Buttons</Button>
          </div>

          <div style={{ marginTop: 8 }}>
            <SyncOutlined spin /> Icons
          </div>

          <div style={{ marginTop: 8 }}>
            Date Pickers?
            <div style={{ marginTop: 2 }}>
              <DatePicker onChange={() => {}} />
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <Slider range defaultValue={[20, 50]} onChange={() => {}} />
          </div>

          <div style={{ marginTop: 32 }}>
            <Switch defaultChecked onChange={() => {}} />
          </div>

          <div style={{ marginTop: 32 }}>
            <Progress percent={50} status="active" />
          </div>

          <div style={{ marginTop: 32 }}>
            <Spin />
          </div>
        </Card>
      </div>
    </div>
  );
}
