import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/config";
import "dotenv/config";
import "hardhat-gas-reporter";

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY!;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY!;

const config: HardhatUserConfig = {
    solidity: {
        compilers: [{ version: "0.8.9" }, { version: "0.6.6" }, { version: "0.4.19" }, { version: "0.6.12" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: MAINNET_RPC_URL,
            },
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "./generated/gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
    mocha: {
        timeout: 500000,
    },
};

export default config;
