import { useEffect, useState } from "react";
import { Alert } from "antd";
import { CHAINS } from "../constants";

export const NetworkCheck = ({ targetChainId, injectedChainId }) => {
  // console.log("NetworkCheck", targetChainId, injectedChainId);
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    if (targetChainId && injectedChainId) {
      setDisplay(targetChainId !== injectedChainId);
    }
  }, [targetChainId, injectedChainId]);

  return display ? (
    <div style={{ zIndex: 2, position: "absolute", right: 0, top: 65, padding: 16 }}>
      <Alert
        message="⚠️ Wrong Network Selected"
        description={
          <div style={{ paddingLeft: 40, paddingRight: 40 }}>
            {injectedChainId && CHAINS[injectedChainId] && <div>You seem to be on {CHAINS[injectedChainId]}.</div>}
            <div>
              <b>Please switch to {CHAINS[targetChainId]}.</b>
            </div>
          </div>
        }
        type="error"
        closable={true}
        onClose={() => setDisplay(false)}
      />
    </div>
  ) : null;
};
