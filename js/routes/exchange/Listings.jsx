/** @jsxImportSource @emotion/react */
import React, { useEffect, useState } from "react";
import { useContractReader } from "eth-hooks";
import styled from "@emotion/styled";
import { BuyListingModal } from "./modals/BuyListingModal";
import { Modal, notification } from "antd";
import { Listing } from "./Listing";
import { AddOfferButton } from "./AddOfferButton";
import { orderListingByPrice } from "./exchange-utils";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { logTransactionUpdate } from "../../utils/evm-utils";

const BATCH_SIZE = 50; // how many listings to fetch at a time

const ListingsWrapper = styled.div({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gridRowGap: 16,
  margin: "0 auto",
  width: 320,

  "@media (min-width: 520px)": {
    gridTemplateColumns: "1fr 1fr 1fr",
    gridRowGap: 20,
    width: 500,
  },

  "@media (min-width: 780px)": {
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gridRowGap: 25,
    width: 675,
  },
});

export const Listings = ({
  readContracts,
  writeContracts,
  tx,
  address,
  loadWeb3Modal,
  onAddOfferClick,
  showAddListing = true,
  listingKey,
}) => {
  const listingsCount = useContractReader(readContracts, "Exchange", "listingsCount");
  const [listings, setListings] = useState([]);
  const [expandedListing, setExpandedListing] = useState(null);

  // Fetch listings in batches
  const fetchListings = async count => {
    const pages = Math.ceil(count / BATCH_SIZE);

    let _listings = [];
    for (let i = 0; i < pages; i++) {
      let _start = i * BATCH_SIZE;
      let _stop = (i + 1) * BATCH_SIZE;
      try {
        _listings = _listings.concat(await readContracts.Exchange.getListingsByRange(_start, _stop));
      } catch (e) {
        console.warn(e);
      }
    }

    _listings = orderListingByPrice(_listings); // order by price - ASC
    // _listings = _listings.filter(l => l.seller === address); // filter by user's address

    setListings(_listings);
  };

  const fetchListingByKey = async key => {
    let _listing;
    try {
      _listing = await readContracts.Exchange.listingByKey(key);
    } catch (e) {
      console.warn(e);
    }

    if (_listing) {
      setListings([_listing]);
    }
  };

  useEffect(() => {
    const count = parseInt(listingsCount?.toString());
    if (address && !isNaN(count) && !listingKey) {
      fetchListings(count);
    } else if (listingKey) {
      fetchListingByKey(listingKey);
    }
  }, [listingsCount, address, listingKey]);

  const onListingClick = listing => {
    console.log(`buy listing`, listing.key);
    if (!address) {
      Modal.info({
        title: "Your are not logged in",
        content: (
          <div>
            <p>Please connect with your wallet in order to add your SOLX sell offer</p>
          </div>
        ),
        okText: "Connect",
        onOk() {
          loadWeb3Modal();
        },
        // cancelText: "Cancel",
        // onCancel() {},
      });
    } else {
      setExpandedListing(listing);
    }
  };

  const removeOffer = listing => {
    if (!writeContracts.Exchange) {
      console.warn(`writeContracts.Exchange not defined`);

      notification.warn({
        message: "Wrong network?",
        description: `Exchange contract not found - are you connected to the Binance Smart Chain?`,
        placement: "bottomRight",
      });

      return;
    }

    tx(writeContracts.Exchange.removeListing(listing.key), update => {
      console.log("📡 Remove Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        logTransactionUpdate(update, "removeListing()");

        notification.success({
          message: "Offer removed",
          description: `Your offer has been removed and SOLX was sent to your wallet`,
          placement: "bottomRight",
        });
      }
    });
  };

  const onListingRemove = listing => {
    Modal.confirm({
      title: "Do you want to remove this offer?",
      icon: <ExclamationCircleOutlined />,
      content: "Your offer will be removed from the Exchange and SOLX will be returned to your wallet",
      onOk() {
        removeOffer(listing);
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const onBuyModalClose = () => {
    setExpandedListing(null);
  };

  return (
    <>
      <div>
        {/*<h3>Available offers: {listingsCount?.toString()}</h3>*/}
        <ListingsWrapper>
          {showAddListing && <AddOfferButton onClick={onAddOfferClick} />}
          {listings.map(listing => (
            <Listing
              key={listing.key}
              onClick={onListingClick}
              {...{ listing }}
              onDeleteClick={listing.seller === address ? onListingRemove : null}
            />
          ))}
        </ListingsWrapper>
      </div>
      {!!expandedListing && (
        <BuyListingModal
          {...{ readContracts, writeContracts, tx }}
          listing={expandedListing}
          onClose={onBuyModalClose}
          buyerAddress={address}
        />
      )}
    </>
  );
};
