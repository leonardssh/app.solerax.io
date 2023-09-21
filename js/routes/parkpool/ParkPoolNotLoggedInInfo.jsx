/** @jsxImportSource @emotion/react */
import React from "react";
import { Button } from "antd";
import { PageWrap } from "../../components/PageWrap";

export const ParkPoolNotLoggedInInfo = ({ loadWeb3Modal }) => {
  return (
    <PageWrap>
      <div css={{ maxWidth: 400, margin: "0 auto" }}>
        <h2>Connect with your wallet to see details</h2>

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
