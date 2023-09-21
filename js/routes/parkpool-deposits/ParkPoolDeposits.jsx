import React from "react";
import { useContractReader } from "eth-hooks";
import { Table } from "antd";
import { PageWrap } from "../../components/PageWrap";
import { userPoolShare, withDecimals } from "../../utils/big-number";

// function to display first 8 characters of an address and last 4
const shortenAddress = address => {
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
};

const ShortAddressLink = ({ address, network }) => {
  if (!address) {
    return null;
  }

  return (
    <a href={`${network.blockExplorer}/address/${address}`} target={"_blank"}>
      {shortenAddress(address)}
    </a>
  );
};

const ParkPoolDeposits = ({ readContracts, network }) => {
  const totalDepositSolxBN = useContractReader(readContracts, "ParkPool", "totalDeposited");
  const totalDepositSOLX = withDecimals(totalDepositSolxBN);
  const result = useContractReader(readContracts, "ParkPool", "getDepositorsWithBalance");

  if (!result) {
    return null;
  }

  const [depositors, balances] = result;
  // console.log({ depositors, balances });

  const dataSource = [];
  depositors.map((address, index) => {
    const balance = withDecimals(balances[index]);
    dataSource.push({
      key: index,
      address: <ShortAddressLink address={address} network={network} />,
      balance,
      poolPercent: userPoolShare(+balance, +totalDepositSOLX) + "%",
    });
  });

  const columns = [
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "SOLX",
      dataIndex: "balance",
      key: "balance",
    },
    {
      title: "Pool Share",
      dataIndex: "poolPercent",
      key: "poolPercent",
    },
  ];

  return (
    <PageWrap css={{ maxWidth: 360 }}>
      <h3>SOLX Deposits</h3>
      <Table dataSource={dataSource} columns={columns} />
    </PageWrap>
  );
};

export default ParkPoolDeposits;
