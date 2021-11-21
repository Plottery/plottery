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

import ticketPng from'../assets/goldenticket.png';

export default function GoldenTicket({ }) {
  function rand() {
    setNewNum(Math.floor(Math.random() * 10000));
  }
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
      if (metadataRespJson.response != 'OK') {
        setNewMintErr(metadataRespJson.error);
      }
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
      if (nftRespJson.response == 'NOK') {
        setNewMintErr(nftRespJson.error);
      }
      console.log('posted nft: ', nftRespJson);

      setNewOSUrl(`https://testnets.opensea.io/assets/${myContract}/${newNum}`);
    });
  }

  const [newNum, setNewNum] = useState(9999);
  const [errNum, setErrNum] = useState(false);
  const [newMintErr, setNewMintErr] = useState('OK');
  const [newOSUrl, setNewOSUrl] = useState('');
  // https://testnets.opensea.io/assets/0x3539a35349c755081c319f9dcb1d9f1acf57381d/1073
  const airdropees = ['0x7212f07cc038cC838B0B7F7AE236bf98dae221d4', '0x0fbFC78830Bf380A6F771F568Bf20bf0e20d6D74', "0x8eEd384d04c983Ee3a6E02AC2f57695F8BAa8534"];
  const [newRecipient, setNewRecipient] = useState(airdropees[0]);

  return (
    <div>
      <canvas id='canvas' width='490' height='270' ></canvas>
      <div>
        <h2>Choose airdrop recipient</h2>
        <label style={{display: 'block'}}>
          <input type="radio" className="nes-radio" name="answer" defaultChecked
              onClick={e => {
                console.log(e, e.target);
                setNewRecipient(airdropees[0]);
          }}/>
          <span>{airdropees[0]}</span>
        </label>
        <label style={{display: 'block'}}>
          <input type="radio" className="nes-radio" name="answer" 
              onClick={e => {
                setNewRecipient(airdropees[1]);
          }}/>
          <span>{airdropees[1]}</span>
        </label>
        <label style={{display: 'block'}}>
          <input type="radio" className="nes-radio" name="answer" 
              onClick={e => {
                setNewRecipient(airdropees[2]);
          }}/>
          <span>{airdropees[2]}</span>
        </label>
      </div>
      <div>minting to {newRecipient}</div>

      <h2>Choose a lucky number from 0 to 9999</h2>
      <img src={ticketPng} width='50' />
      <button className='nes-btn is-foo' onClick={() => rand()} >randomize</button>
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
      <button className='nes-btn is-warning' onClick={() => draw()} >draw</button>
      <button className='nes-btn is-success' onClick={() => mint()} >mint</button>

      <h3>{newMintErr}</h3>
      <h2>View on OpenSea</h2>
      <a href={newOSUrl} target="_blank">link to #{newNum}</a>
    </div>
  );
}
