/** @jsxImportSource @emotion/react */
import React from "react";
import styled from "@emotion/styled";
import { pricePerSolx } from "./exchange-utils";
import { withDecimals } from "../../utils/big-number";
import { cssResetButtonStyle } from "../../utils/style-utils";
import { CloseCircleFilled } from "@ant-design/icons";

const ListingInfo = styled.div({
  background: `rgba(255, 255, 255, 0.2)`,
  // border: "solid 1px #3a6ee8",
  borderRadius: 5,
  margin: "-4px 10px 0 10px",
  padding: "5px 7px 2px 7px",
  fontSize: 12,
  color: "#efefef",
});

const ListingBackground = styled.div(({ shadow, onClick, showBorder }) => ({
  display: "inline-block",
  background: "linear-gradient(62.31deg,#723ae8 -4.28%,#3a6ee8 106.81%)",
  borderRadius: 10,
  border: showBorder ? `solid 1px white` : "none",
  padding: "10px 5px",
  textAlign: "left",
  boxShadow: shadow ? `rgba(0, 0, 0, 0.19) 0px 1px 2px, rgba(0, 0, 0, 0.23) 0px 4px 6px` : "none",
  // boxShadow: `rgba(0, 0, 0, 0.19) 0px 1px 2px, rgba(0, 0, 0, 0.23) 0px 4px 6px`,
  cursor: onClick ? "pointer" : "auto",
}));

const DeleteButton = ({ onClick }) => {
  return (
    <button
      css={{
        ...cssResetButtonStyle,
        top: -10,
        right: -10,
        position: "absolute",
      }}
      onClick={onClick}
    >
      <CloseCircleFilled style={{ fontSize: 25, background: "#333", borderRadius: "50%" }} />
    </button>
  );
};

export const Listing = ({ listing, onClick, onDeleteClick, busdPriceBN, shadow = true, note, styles = {} }) => {
  // const displayAddress = listing.seller?.substr(0, 2) + "..." + listing.seller?.substr(-4);
  const price = pricePerSolx(listing);

  return (
    <div css={{ width: 150, ...styles, position: "relative" }}>
      <ListingBackground
        {...{ shadow, onClick }}
        showBorder={!!onDeleteClick}
        css={{ width: "100%" }}
        onClick={() => onClick?.(listing)}
      >
        <div css={{ textAlign: "center" }}>
          <span css={{ fontSize: 20, fontWeight: "bold" }}>{withDecimals(listing.solxQuantity, 1)}</span>{" "}
          <span>SOLX</span>
        </div>
        <div css={{ textAlign: "center" }}>for</div>
        <div css={{ textAlign: "center" }}>
          <span css={{ fontSize: 20, fontWeight: "bold" }}>{withDecimals(busdPriceBN || listing.totalPrice, 2)}</span>{" "}
          <span>BUSD</span>
        </div>
      </ListingBackground>
      <ListingInfo>
        {note || (
          <div css={{ display: "flex" }}>
            <div>Price:</div>
            <div css={{ flexGrow: 1, textAlign: "right" }}>${price}</div>
          </div>
        )}
        {/*<div css={{ display: "flex" }}>*/}
        {/*  <div>From:</div>*/}
        {/*  <div css={{ flexGrow: 1, textAlign: "right" }}>{displayAddress}</div>*/}
        {/*</div>*/}
      </ListingInfo>
      {onDeleteClick && <DeleteButton onClick={() => onDeleteClick(listing)} />}
    </div>
  );
};
