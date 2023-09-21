/** @jsxImportSource @emotion/react */
import React, { useState } from "react";
import { userPoolShare, withDecimals } from "../../utils/big-number";
import { Button, Tooltip } from "antd";
import DepositSOLXModal from "./DepositSOLXModal";
import { useContractReader } from "eth-hooks";
import { InfoCircleOutlined } from "@ant-design/icons";

const ParkPoolDepositButton = ({ onClick, disabled }) => {
  return (
    <Button
      disabled={disabled}
      key="depositButton"
      style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
      shape="round"
      size="large"
      type={"primary"}
      /* type={minimized ? "default" : "primary"}     too many people just defaulting to MM and having a bad time */
      onClick={onClick}
    >
      Deposit SOLX
    </Button>
  );
};

const ParkPoolUserDeposit = ({
  userDepositSOLX,
  totalDepositSOLX,
  readContracts,
  address,
  tx,
  writeContracts,
  depositsOpen,
}) => {
  const percent = userPoolShare(+userDepositSOLX, +totalDepositSOLX);
  const [depositSolxModalVisible, setDepositSolxModalVisible] = useState(false);

  return (
    <div>
      <h2>Your contribution</h2>
      {userDepositSOLX ? (
        <div>
          <div>You have deposited: {userDepositSOLX} SOLX</div>
          <div>
            Your share of the pool is: {percent}%
            <Tooltip title={`Whenever a BNB reward is deposited into the pool you can claim ${percent}% of that`}>
              {" "}
              <InfoCircleOutlined />
            </Tooltip>
          </div>
        </div>
      ) : (
        <div>You have not deposited SOLX into this pool</div>
      )}
      <div css={{ marginTop: 20 }}>
        <div css={{ display: "inline-block" }}>
          <ParkPoolDepositButton disabled={!depositsOpen} onClick={() => setDepositSolxModalVisible(true)} />
          {!depositsOpen && <div css={{ color: "#888" }}>Deposits are closed</div>}
        </div>
        <Button
          key="viewAllDepositsButton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
          shape="round"
          size="large"
          href={"/parkpool/deposits"}
        >
          View all deposits
        </Button>
      </div>
      {depositSolxModalVisible && (
        <DepositSOLXModal
          {...{ readContracts, address, tx, writeContracts }}
          onClose={() => setDepositSolxModalVisible(false)}
        />
      )}
    </div>
  );
};

const ParkPoolUserDepositSC = ({ readContracts, address, tx, writeContracts }) => {
  const depositEndDateBN = useContractReader(readContracts, "ParkPool", "depositEndDate");
  const depositEndDate = depositEndDateBN ? new Date(depositEndDateBN.toNumber() * 1000) : null;
  const depositsOpen = depositEndDate && depositEndDate > new Date();

  const userDepositSolxBN = useContractReader(readContracts, "ParkPool", "depositOf", [address]);
  const userDepositSOLX = withDecimals(userDepositSolxBN);
  // console.log({ userDepositSOLX });

  const totalDepositSolxBN = useContractReader(readContracts, "ParkPool", "totalDeposited");
  const totalDepositSOLX = withDecimals(totalDepositSolxBN);
  // console.log({ totalDepositSOLX });

  if (!userDepositSOLX || !totalDepositSOLX) {
    return null;
  }

  return (
    <ParkPoolUserDeposit
      {...{ userDepositSOLX, totalDepositSOLX, readContracts, address, tx, writeContracts, depositsOpen }}
    />
  );
};

export default ParkPoolUserDepositSC;
