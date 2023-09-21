import React, { useState } from "react";
import { PageWrap } from "../../components/PageWrap";
import { Listings } from "./Listings";
import { CreateListingModal } from "./modals/CreateListingModal";
import { Modal } from "antd";

const Exchange = ({ readContracts, address, tx, writeContracts, loadWeb3Modal, solxAddress }) => {
  const [createListingModalVisible, setCreateListingModalVisible] = useState(false);

  const onAddOfferClick = () => {
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
      setCreateListingModalVisible(true);
    }
  };

  return (
    <>
      <PageWrap>
        <Listings {...{ readContracts, writeContracts, tx, address, loadWeb3Modal, onAddOfferClick }} />
      </PageWrap>

      {createListingModalVisible && (
        <CreateListingModal
          {...{ readContracts, writeContracts, tx }}
          sellerAddress={address}
          onClose={() => setCreateListingModalVisible(false)}
        />
      )}
    </>
  );
};

export default Exchange;
