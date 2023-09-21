import { Menu } from "antd";
import "antd/dist/antd.css";
import { useBalance, useContractLoader, useUserProviderAndSigner } from "eth-hooks";
import React, { useCallback, useEffect, useState } from "react";
import { Link, Redirect, Route, Switch, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import "./App.css";
import { Account, Contract, Faucet, Header, NetworkDisplay, NetworkSwitch } from "./components";
import { NETWORKS, ALCHEMY_KEY, CHAINS } from "./constants";
import externalContracts from "./contracts/external_contracts";
import deployedContracts from "./contracts/hardhat_contracts.json";
import foundryContracts from "./contracts/foundry_contracts.js";
import { Transactor, Web3ModalSetup } from "./helpers";
import { Exchange, ExchangeListing, Vesting } from "./routes";
import { useStaticJsonRPC } from "./hooks";
import { NetworkCheck } from "./components/NetworkCheck";
import { SolxToken } from "./components/SolxToken";
import { Admin } from "./routes/admin/Admin";
import ParkPool from "./routes/parkpool/ParkPool";
import ParkPoolDeposits from "./routes/parkpool-deposits/ParkPoolDeposits";
import ParkPoolRewards from "./routes/parkpool-rewards/ParkPoolRewards";

const USE_BURNER_WALLET = false; // toggle burner wallet feature
const SHOW_ADMIN = true;
const NETWORK_CHECK = true;
const LOCAL_FAUCET = true;

// Merge foundry contracts with deployed contracts
deployedContracts["31337"]["localhost"].contracts.ParkPool = foundryContracts["31337"].contracts.ParkPool;
deployedContracts["31337"]["localhost"].contracts.SoleraX = foundryContracts["31337"].contracts.SoleraX;

deployedContracts["97"]["testnet"].contracts.ParkPool = foundryContracts["97"].contracts.ParkPool;
externalContracts["97"].contracts.SoleraX.address = foundryContracts["97"].contracts.SoleraX.address;

deployedContracts["56"]["mainnet"].contracts.ParkPool = foundryContracts["56"].contracts.ParkPool;

const getSolxAddress = chainId => {
  if (chainId && externalContracts[chainId]) {
    return externalContracts[chainId].contracts.SoleraX.address;
  } else if (chainId && deployedContracts[chainId]) {
    return deployedContracts[chainId].localhost.contracts.SoleraX.address;
  }
  return null;
};

const web3Modal = Web3ModalSetup();

function App() {
  const networkOptions = [NETWORKS.mainnet.name, NETWORKS.testnet.name, NETWORKS.localhost.name];

  const [targetNetworkName, setTargetNetworkName] = useState(
    (typeof localStorage !== "undefined" && localStorage.getItem("targetNetworkName")) || networkOptions[0],
  );
  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const isOperator = isAdmin || isOwner;
  const location = useLocation();
  const [SHOW_NETWORK_SELECTOR] = useState(location?.search?.indexOf("networkSelector") > -1);
  const [SHOW_PARK_POOL] = useState(
    location?.search?.indexOf("parkPool") > -1 || new Date().getTime() > new Date("2023-04-30"),
  );

  const targetNetwork = NETWORKS[targetNetworkName];
  const targetNetworkProvider = useStaticJsonRPC(targetNetwork ? [targetNetwork.rpcUrl] : []);
  const faucetAvailable = targetNetworkProvider?.connection && targetNetwork.name.indexOf("local") !== -1;

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  const saveTargetNetworkName = name => {
    setTargetNetworkName(name);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("targetNetworkName", name);
    }
  };

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, null, USE_BURNER_WALLET);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  useEffect(() => {
    async function getRoles() {
      if (address) {
        try {
          const isAdmin = await readContracts.Vesting.isAdmin(address);
          setIsAdmin(isAdmin);
          const owner = await readContracts.Vesting.owner();
          setIsOwner(owner?.toLowerCase() === address.toLowerCase());
        } catch (e) {}
      }
    }
    if (address && readContracts.Vesting) {
      getRoles();
    } else {
      setIsAdmin(false);
      setIsOwner(false);
    }
  }, [address]);

  // You can warn the user if you would like them to be on a specific network
  const targetChainId =
    targetNetworkProvider && targetNetworkProvider._network && targetNetworkProvider._network.chainId;
  const injectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  const solxAddress = getSolxAddress(targetChainId);

  // The transactor wraps transactions and provides notifications
  const tx = Transactor(userSigner);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const balance = useBalance(targetNetworkProvider, address);

  // const contractConfig = useContractConfig();
  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(targetNetworkProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, injectedChainId);

  // If you want to call a function on a new block
  // useOnBlock(mainnetProvider, () => {
  //   console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  // });

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    console.log("🏠 targetChainId", targetChainId, `(${CHAINS[targetChainId]})`, "📝 readContracts", readContracts);
  }, [targetChainId, readContracts]);

  useEffect(() => {
    console.log(
      `👩‍💼 injected address ${address} on chain ${injectedChainId} (${CHAINS[injectedChainId]}) with balance: `,
      balance ? ethers.utils.formatEther(balance) : "...",
    );
    console.log("🔐 writeContracts", writeContracts);
  }, [address, balance, injectedChainId]);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header>
        {SHOW_NETWORK_SELECTOR && (
          <div style={{ marginRight: 20, marginTop: 4 }}>
            <NetworkSwitch
              networkOptions={networkOptions}
              selectedNetwork={targetNetworkName}
              setSelectedNetwork={saveTargetNetworkName}
            />
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ marginRight: 15, marginTop: 4 }}>
            <SolxToken {...{ solxAddress, readContracts }} />
          </div>
          <Account
            address={address}
            provider={targetNetworkProvider}
            userSigner={userSigner}
            web3Modal={web3Modal}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
            blockExplorer={targetNetwork?.blockExplorer}
          />
        </div>
      </Header>
      {NETWORK_CHECK && (
        <NetworkCheck
          targetChainId={targetChainId}
          injectedChainId={injectedChainId}
          targetNetwork={targetNetwork}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
        />
      )}

      <Menu
        style={{
          textAlign: "center",
          marginTop: 40,
          background: "none",
          borderBottom: 0,
          marginBottom: "1em",
          color: "red",
        }}
        selectedKeys={[location.pathname]}
        mode="horizontal"
      >
        {/*<Menu.Item key="/">*/}
        {/*  <Link to="/">PUBLIC SALE</Link>*/}
        {/*</Menu.Item>*/}
        {SHOW_PARK_POOL && (
          <Menu.Item key="/parkPool">
            <Link to="/">PARK POOL</Link>
          </Menu.Item>
        )}
        <Menu.Item key="/exchange">
          <Link to="/exchange">EXCHANGE</Link>
        </Menu.Item>
        <Menu.Item key="/vesting">
          <Link to="/vesting">VESTING</Link>
        </Menu.Item>
        {isOperator && SHOW_ADMIN && (
          <Menu.Item key="/a">
            <Link to="/a">ADMIN</Link>
          </Menu.Item>
        )}
        {/*<Menu.Item key="/subgraph">*/}
        {/*  <Link to="/subgraph">Subgraph</Link>*/}
        {/*</Menu.Item>*/}
      </Menu>

      <Switch>
        {/*<Route exact path="/">*/}
        {/*  <PublicSale*/}
        {/*    {...{ readContracts, address, tx, writeContracts, loadWeb3Modal, solxAddress, balanceBNB: balance }}*/}
        {/*  />*/}
        {/*</Route>*/}
        <Route exact path="/">
          <Redirect to={SHOW_PARK_POOL ? "/parkPool" : "/exchange"} />
        </Route>
        <Route exact path="/vesting">
          <Vesting {...{ balance, readContracts, address, tx, writeContracts, loadWeb3Modal }} />
        </Route>
        <Route exact path="/exchange/:listingKey">
          <ExchangeListing {...{ balance, readContracts, address, tx, writeContracts, loadWeb3Modal }} />
        </Route>
        <Route exact path="/exchange">
          <Exchange {...{ balance, readContracts, address, tx, writeContracts, loadWeb3Modal }} />
        </Route>
        {SHOW_PARK_POOL && (
          <Route exact path="/parkPool">
            <ParkPool {...{ readContracts, address, tx, writeContracts, loadWeb3Modal }} />
          </Route>
        )}
        <Route exact path="/parkpool/deposits">
          <ParkPoolDeposits {...{ readContracts, address }} network={targetNetwork} />
        </Route>
        <Route exact path="/parkpool/rewards">
          <ParkPoolRewards {...{ readContracts, address }} />
        </Route>
        {
          /*isOperator &&*/ SHOW_ADMIN && (
            <Route exact path="/a">
              <Admin {...{ readContracts, tx, writeContracts, address }} network={targetNetwork} />
              {/*<Contract*/}
              {/*  name="Vesting"*/}
              {/*  signer={userSigner}*/}
              {/*  provider={targetNetworkProvider}*/}
              {/*  address={address}*/}
              {/*  blockExplorer={targetNetwork?.blockExplorer}*/}
              {/*  contractConfig={contractConfig}*/}
              {/*/>*/}
            </Route>
          )
        }
        {/*<Route path="/subgraph">*/}
        {/*  <Subgraph*/}
        {/*    subgraphUri={props.subgraphUri}*/}
        {/*    tx={tx}*/}
        {/*    writeContracts={writeContracts}*/}
        {/*    mainnetProvider={mainnetProvider}*/}
        {/*  />*/}
        {/*</Route>*/}
      </Switch>

      {/*<ThemeSwitch />*/}

      {LOCAL_FAUCET && faucetAvailable && <Faucet />}
    </div>
  );
}

export default App;
