/** @jsxImportSource @emotion/react */
import React from "react";
import { Button } from "antd";
import { PageWrap } from "../../components/PageWrap";

export const GenericVestingInfo = ({ loadWeb3Modal }) => {
  return (
    <PageWrap>
      <div css={{ maxWidth: 400, margin: "0 auto" }}>
        <h1>SOLX tokens purchased before 21 January 2022 are subject to a 12 months vesting period.</h1>
        <h2>Connect with your wallet to claim your vested tokens</h2>

        <Button
          key="loginbutton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
          shape="round"
          size="large"
          /* type={minimized ? "default" : "primary"}     too many people just defaulting to MM and having a bad time */
          onClick={loadWeb3Modal}
        >
          connect
        </Button>
      </div>
    </PageWrap>
  );
};
