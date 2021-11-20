import { List } from "antd";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { Address } from "../components";
import { utils, BigNumber } from "ethers";

/*
  ~ What it does? ~

  Displays a lists of events

  ~ How can I use? ~

  <Events
    contracts={readContracts}
    contractName="YourContract"
    eventName="SetPurpose"
    localProvider={localProvider}
    mainnetProvider={mainnetProvider}
    startBlock={1}
  />
*/

export default function SendPrizeEvents({ contracts, contractName, eventName, localProvider, mainnetProvider, startBlock }) {
  // 📟 Listen for broadcast events
  const events = useEventListener(contracts, contractName, eventName, localProvider, startBlock);

  return (
    <div className="nes-container with-title is-rounded" style={{ marginTop: 32, marginBottom: 32  }}>
      <p className="title">Recent Winners</p>
    {/*<div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>*/}
      <List
        bordered
        dataSource={events}
        renderItem={item => {
          console.log(item);
          return (
            <List.Item key={item.blockNumber + "_" + item.args.sender + "_" + item.args.purpose} style={{justifyContent: 'normal'}}>
              <Address address={item.args[0]} ensProvider={mainnetProvider} fontSize={16} />
              <span> won </span>
              <span style={{fontSize: 30}}>{utils.formatEther(item.args[1])}</span>
              <i className="nes-icon coin "></i>
            </List.Item>
          );
        }}
      />
    </div>
  );
}
