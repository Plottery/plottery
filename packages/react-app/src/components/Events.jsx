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

export default function Events({ contracts, contractName, eventName, localProvider, mainnetProvider, startBlock }) {
  // 📟 Listen for broadcast events
  const events = useEventListener(contracts, contractName, eventName, localProvider, startBlock);

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <List
        bordered
        dataSource={events}
        renderItem={item => {
          console.log(item);
          return (
            <List.Item key={item.blockNumber + "_" + item.args.sender + "_" + item.args.purpose}>
              {/*<Address address={item.args[0]} ensProvider={mainnetProvider} fontSize={16} />*/}
            {/* XXX brittle assumptions */}
              {item.args[1] ? (<Address address={item.args[0]} />) : ''}
              {item.args[1] ? utils.formatEther(item.args[1]) : item.args[0].toString()}
            </List.Item>
          );
        }}
      />
    </div>
  );
}
