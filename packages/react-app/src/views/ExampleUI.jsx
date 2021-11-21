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

function TixControl({
  tokenId,
  tx,
  readContracts,
  writeContracts,
}) {
  const [approved, setApproved] = useState(false);
  const [entered, setEntered] = useState(false);

  return (<div style={{clear: 'both'}}>
      <div style={{display: 'inline-block'}}>
        <h2>Ticket #{('0000' + tokenId).slice(-5)}</h2>
      </div>
      <div style={{display: 'inline-block'}}>
        <Button
          className={'nes-btn ' + (approved ? '': 'is-success')}
          disabled={approved ? true : false}
          style={{ marginTop: 8 }}
          onClick={async () => {
            setApproved(true);
            const result = tx(writeContracts.Tix.approve(readContracts.Plottery.address, tokenId), _dumpUpdate);
            console.log("awaiting metamask/web3 confirm result...", result);
            console.log(await result);
          }}
        >
          Approve First
        </Button>
        <Button
          className='nes-btn is-warning'
          disabled={entered ? true : false}
          style={{ marginTop: 8 }}
          onClick={async () => {
            setEntered(true);
            const result = tx(writeContracts.Plottery.enter(tokenId), _dumpUpdate);
            console.log("awaiting metamask/web3 confirm result...", result);
            console.log(await result);
          }}
        >
          Enter Drawing
        </Button>
      </div>
    </div>);
}

function RecentWinners({
  address,
  userSigner,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  tx,
  readContracts,
  writeContracts,
}) {
  return (<div>
        <SendPrizeEvents
          contracts={readContracts}
          contractName="Plottery"
          ensProvider={mainnetProvider}
          eventName="SendPrize"
          localProvider={localProvider}
          mainnetProvider={mainnetProvider}
          startBlock={1}
        />
    </div>);
}
function PlayGame({
  address,
  userSigner,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  tx,
  readContracts,
  writeContracts,
}) {
  const jackpot = /*100*/ useContractReader(readContracts, "Plottery", "jackpot");
  const canEnter = /*true*/ useContractReader(readContracts, "Plottery", "canEnter");
  const entryCount = useContractReader(readContracts, "Plottery", "entryCount");

  return (<div>
      <div>
        <section className={"nes-container " + (canEnter ? '' : "is-dark")}>
            <section className="message -right" style={{marginTop: -50}}>
              <div className={"nes-balloon from-right " + (canEnter ? '' : "is-dark")} style={{margin: 20}}>
                <p>{canEnter ? 'GM. Would you like to play a game?' : 'Stand by for round to close.'}</p>
              </div>
              <i className="nes-bcrikko" style={{top: 56}}></i>
            </section>
        </section>
        <div className="nes-container with-title " style={{marginTop: 20}}>
          <p className="title">Jackpot</p>
          <progress className="nes-progress is-success" value="50" max="100"></progress>
          <div>
            <span style={{fontSize: 56}}>{ jackpot ? utils.formatEther(jackpot) : '..'}</span> <i className="nes-icon coin is-large"></i>
          </div>
          <progress className="nes-progress is-pattern" value="10" max="100"></progress>
          <div>
            <span >Currently Entered Tickets: {entryCount ? entryCount.toString() : '...'}</span>
          </div>
        </div>
      </div>

    </div>);
}

function ClaimAirdrop({
  address,
  userSigner,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  tx,
  readContracts,
  writeContracts,
}) {
  //const airdropBal = useContractReader(readContracts, "MockNftPort", "balanceOf", [address]);
  const airdropBal = useContractReader(readContracts, "NFTPort", "balanceOf", [address]);
  const [newNum, setNewNum] = useState(9999);
  const [errNum, setErrNum] = useState(false);

  return (<div>
          <h2>You have {airdropBal ? airdropBal.toString() : '...'} airdrops to claim</h2>

          <Input value={newNum} style={{ width: 250, fontSize: 42 }}
              onChange={e => {
              try {
                setErrNum(false);
                let n = parseInt(e.target.value);
                if (isNaN(n)) {
                  console.log('NaN for ', e.target.value);
                  n = 0;
                }
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
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = await readContracts.MockNftPort.ownerOf(newNum);
              console.log(result);
            }}
          >
            Check Claim
          </Button>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              //const result = tx(writeContracts.MockNftPort.approve(readContracts.Tix.address, newNum), _dumpUpdate);
              const result = tx(writeContracts.NFTPort.approve(readContracts.Tix.address, newNum), _dumpUpdate);
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Approve Airdrop 
          </Button>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = tx(writeContracts.Tix.claimAirdrop(newNum), _dumpUpdate);
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Claim 
          </Button>
    </div>);
}
function TixForSale({
  address,
  userSigner,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  tx,
  readContracts,
  writeContracts,
}) {
  const tixForSale = useContractReader(readContracts, "Plottery", "tixForSale");

  return (<div>
      { tixForSale ? tixForSale.map(tokenId => (<div>
          <div style={{display: 'inline-block'}}>
            <h2>Ticket #{('0000' + tokenId).slice(-5)}</h2>
          </div>

          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = tx(writeContracts.Plottery.buyTix(tokenId), _dumpUpdate);
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Buy 
          </Button>
        </div>)
      ) : ''}
    </div>);
}
function MyTix({
  address,
  userSigner,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  tx,
  readContracts,
  writeContracts,
}) {
  const [newNum, setNewNum] = useState(9999);
  const [errNum, setErrNum] = useState(false);
  const tixBal = useContractReader(readContracts, "Tix", "balanceOf", [address]);
  const tix = useContractReader(readContracts, "Plottery", "tixByAddress", [address]);
  const tixForSaleCount = useContractReader(readContracts, "Plottery", "tixForSaleCount");

  return (<div>
    <div>You have {tixBal ? tixBal.toString() : '...'} TIX</div>
    { tix ? tix.map(tokenId => <TixControl tx={tx} readContracts={readContracts} writeContracts={writeContracts} key={tokenId} tokenId={tokenId} />) : ''}

        <Input value={newNum} style={{ width: 250, fontSize: 42 }}
              onChange={e => {
              try {
                setErrNum(false);
                let n = parseInt(e.target.value);
                if (isNaN(n)) {
                  console.log('NaN for ', e.target.value);
                  n = 0;
                }
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
        <div>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = tx(writeContracts.BitCorn.approve(readContracts.Tix.address, utils.parseEther("100")), _dumpUpdate);
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Approve Corn for Tix for Plottery to Buy
          </Button>
        </div>
        <div>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = tx(writeContracts.Tix.mint(address, newNum), _dumpUpdate);
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Buy New Ticket
          </Button>
        </div>

        <div>
          Previously owned tickets for sale: ({tixForSaleCount ? tixForSaleCount.toString() : 0})
        </div>
        <div>
          <TixForSale 
            address={address}
            userSigner={userSigner}
            mainnetProvider={mainnetProvider}
            localProvider={localProvider}
            yourLocalBalance={yourLocalBalance}
            tx={tx}
            writeContracts={writeContracts}
            readContracts={readContracts}
          />
          <ClaimAirdrop 
            address={address}
            userSigner={userSigner}
            mainnetProvider={mainnetProvider}
            localProvider={localProvider}
            yourLocalBalance={yourLocalBalance}
            tx={tx}
            writeContracts={writeContracts}
            readContracts={readContracts}
          />
        </div>
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
  // TODO show how many current entries
  // TODO save timestamp of last time _open was called, that's how long game has been running

  return (
    <div>
      <Divider/>
      <div className="nes-container is-rounded" style={{ padding: 16, width: "auto", margin: "auto", marginTop: 64, marginBottom: 64 }}>
        {readContracts ? <PlayGame 
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
        {readContracts ? <RecentWinners 
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
      </div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}

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
