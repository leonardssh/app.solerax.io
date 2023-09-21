import React from "react";
import { useParams } from "react-router-dom";
import { Listings } from "../exchange/Listings";

const Exchange = ({ readContracts, address, tx, writeContracts, loadWeb3Modal }) => {
  const { listingKey } = useParams();

  return (
    <Listings {...{ readContracts, writeContracts, tx, address, loadWeb3Modal, listingKey, showAddListing: false }} />
  );
};

export default Exchange;
