import { AlchemyProvider, BlockscoutProvider, 
//    AnkrProvider,
//    CloudflareProvider,
ChainstackProvider, EtherscanProvider, InfuraProvider, 
//    PocketProvider,
//    QuickNodeProvider,
JsonRpcProvider, FallbackProvider, isError, } from "../index.js";
import { inspect } from "./utils-debug.js";
import { INFURA_APIKEY } from "./utils.js";
;
const ethNetworks = ["default", "mainnet", "sepolia"];
//const maticNetworks = [ "matic", "maticmum" ];
const ProviderCreators = [
    {
        name: "AlchemyProvider",
        networks: ethNetworks,
        create: function (network) {
            return new AlchemyProvider(network, "YrPw6SWb20vJDRFkhWq8aKnTQ8JRNRHM");
        }
    },
    {
        name: "BlockscoutProvider",
        //networks: ethNetworks,  // @TODO: they are backfilling some Sepolia txs
        networks: ["mainnet"],
        create: function (network) {
            //return new BlockscoutProvider(network);
            return new BlockscoutProvider(network, "fdbfa288-1695-454e-a369-4501253a120");
        }
    },
    /*
    {
        name: "AnkrProvider",
        networks: ethNetworks.concat([ "matic", "arbitrum" ]),
        create: function(network: string) {
            return new AnkrProvider(network);
        }
    },
    */
    /*
    {
        name: "CloudflareProvider",
        networks: [ "default", "mainnet" ],
        create: function(network: string) {
            return new CloudflareProvider(network);
        }
    },
    */
    {
        name: "ChainstackProvider",
        networks: ["default", "mainnet", "arbitrum", "bnb", "matic"],
        create: function (network) {
            return new ChainstackProvider(network);
        }
    },
    {
        name: "EtherscanProvider",
        networks: ethNetworks,
        create: function (network) {
            return new EtherscanProvider(network, "FPFGK6JSW2UHJJ2666FG93KP7WC999MNW7");
        }
    },
    {
        name: "InfuraProvider",
        networks: ethNetworks,
        create: function (network) {
            return new InfuraProvider(network, INFURA_APIKEY || undefined);
        }
    },
    /*
    {
        name: "InfuraWebsocketProvider",
        networks: ethNetworks,
        create: function(network: string) {
            return InfuraProvider.getWebSocketProvider(network, "49a0efa3aaee4fd99797bfa94d8ce2f1");
        }
    },
    */
    /*
        {
            name: "PocketProvider",
            networks: ethNetworks,
            create: function(network: string) {
                return new PocketProvider(network);
            }
        },
    */
    /*
        {
            name: "QuickNodeProvider",
            networks: ethNetworks,
            create: function(network: string) {
                return new QuickNodeProvider(network);
            }
        },
    */
    {
        name: "FallbackProvider",
        networks: ethNetworks,
        create: function (network) {
            const providers = [];
            for (const providerName of ["AlchemyProvider", "AnkrProvider", "EtherscanProvider", "InfuraProvider"]) {
                const provider = getProvider(providerName, network);
                if (provider) {
                    providers.push(provider);
                }
            }
            if (providers.length === 0) {
                throw new Error("UNSUPPORTED NETWORK");
            }
            return new FallbackProvider(providers);
        }
    },
];
let setup = false;
const cleanup = [];
export function setupProviders() {
    after(function () {
        for (const func of cleanup) {
            func();
        }
    });
    setup = true;
}
export const providerNames = Object.freeze(ProviderCreators.map((c) => (c.name)));
function getCreator(provider) {
    const creators = ProviderCreators.filter((c) => (c.name === provider));
    if (creators.length === 1) {
        return creators[0];
    }
    return null;
}
export function getProviderNetworks(provider) {
    const creator = getCreator(provider);
    if (creator) {
        return creator.networks;
    }
    return [];
}
export function getProvider(provider, network) {
    if (setup == false) {
        throw new Error("MUST CALL setupProviders in root context");
    }
    const creator = getCreator(provider);
    try {
        if (creator) {
            const provider = creator.create(network);
            if (provider) {
                cleanup.push(() => { provider.destroy(); });
            }
            return provider;
        }
    }
    catch (error) {
        if (!isError(error, "INVALID_ARGUMENT")) {
            throw error;
        }
    }
    return null;
}
export function checkProvider(provider, network) {
    const creator = getCreator(provider);
    return (creator != null && creator.networks.indexOf(network) >= 0);
}
export function getDevProvider() {
    class HikackEnsProvider extends JsonRpcProvider {
        async resolveName(name) {
            if (name === "tests.eth") {
                return "0x228568EA92aC5Bc281c1E30b1893735c60a139F1";
            }
            return super.resolveName(name);
        }
    }
    const provider = new HikackEnsProvider("http:/\/127.0.0.1:8545");
    provider.on("error", (error) => {
        setTimeout(() => {
            if (error && error.event === "initial-network-discovery") {
                console.log(inspect(error));
            }
            provider.off("error");
        }, 100);
    });
    return provider;
}
export function connect(network) {
    const provider = getProvider("InfuraProvider", network);
    if (provider == null) {
        throw new Error(`could not connect to ${network}`);
    }
    return provider;
}
//# sourceMappingURL=create-provider.js.map