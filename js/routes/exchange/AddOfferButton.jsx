/** @jsxImportSource @emotion/react */
import React, { useState } from "react";
import styled from "@emotion/styled";
import { PlusCircleOutlined } from "@ant-design/icons";

const ListingBackground = styled.div(({ shadow, onClick }) => ({
  // background: "linear-gradient(62.31deg,#723ae8 -4.28%,#3a6ee8 36.81%)",
  background: "rgba(255, 255, 255, 0.1)",
  borderRadius: 10,
  border: `dashed 2px #3a6ee8`,
  padding: "10px 5px",
  textAlign: "left",
  // boxShadow: shadow ? `rgba(0, 0, 0, 0.19) 0px 1px 2px, rgba(0, 0, 0, 0.23) 0px 4px 6px` : "none",
  // boxShadow: `rgba(0, 0, 0, 0.19) 0px 1px 2px, rgba(0, 0, 0, 0.23) 0px 4px 6px`,
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
}));

export const AddOfferButton = ({ onClick }) => {
  return (
    <>
      <div css={{ width: 150 }}>
        <ListingBackground onClick={onClick} css={{ width: "100%", height: 104, opacity: 1 }}>
          <PlusCircleOutlined style={{ fontSize: 25, color: "rgb(44, 170, 217)" }} />
          <div
            css={{
              marginTop: 10,
              fontSize: 20,
            }}
          >
            Sell SOLX
          </div>
        </ListingBackground>
      </div>
    </>
  );
};
