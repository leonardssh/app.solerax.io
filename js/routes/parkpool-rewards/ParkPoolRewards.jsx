/** @jsxImportSource @emotion/react */
import React from "react";
import { useContractReader } from "eth-hooks";
import { Timeline } from "antd";
import { withDecimals } from "../../utils/big-number";
import format from "date-fns/format";

const ParkPoolRewards = ({ readContracts }) => {
  const rewards = useContractReader(readContracts, "ParkPool", "getRewardsDeposits");
  console.log({ rewards });

  if (!rewards) {
    return null;
  }

  const items = [];
  rewards.map(reward => {
    items.push({
      text: `${withDecimals(reward.amount)} BNB was deposited`,
      label: format(new Date(reward.timestamp.toNumber() * 1000), "d MMM yyyy"),
    });
  });
  console.log({ items });

  return (
    <div>
      <h2 css={{ marginBottom: 30 }}>SOLX Rewards</h2>
      <Timeline mode={"right"}>
        {items.map((item, i) => (
          <Timeline.Item key={i} label={item.label}>
            {item.text}
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

export default ParkPoolRewards;
