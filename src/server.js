const express = require('express');
const ConfigParser = require('configparser');
const {ApiPromise, WsProvider} = require('@polkadot/api');

const substrateRPC = require('./interface/substrate_rpc');
const substrateQuery = require('./interface/substrate_query');
const substrateDerive = require('./interface/substrate_derive');
const timeoutUtils = require('./utils/timeout');


const TIMEOUT_TIME_MS = 10000;
const REQUEST_SUCCESS_STATUS = 200;
const REQUEST_ERROR_STATUS = 400;


function errorNeedToSetUpAPIMsg(websocket) {
    return {'error': `An API for ${websocket} `
            + 'needs to be setup before it can be queried'}
}

async function startListen(websocket) {
    try {
        console.log(`Connecting to ${websocket}`);
        // connect to the WebSocket once and reuse that connection
        let provider = new WsProvider(websocket);
        // open an API connection with the provider
        let api = await timeoutUtils.callFnWithTimeoutSafely(
            ApiPromise.create, [{provider}], TIMEOUT_TIME_MS,
            'Connection could not be established.'
        );
        return {api: api, provider: provider};
    } catch (e) {
        console.log(e.toString());
    }
}

async function startPolkadotAPI() {
    // Start up the API
    const app = express();
    await app.use(express.json());

    // declare a dictionary which will contain all the apis and providers that
    // correspond to the IPs submitted by the user in the format
    // websocket_ip -> { api, provider }
    let apiProviderDict = {};

    // Read the configuration file (user_config_main.ini)
    // create a ConfigParser object which can read the config file
    const user_config_main = new ConfigParser();
    // specify the config file from which to read the configuration
    user_config_main.read('../config/user_config_main.ini');

    // read which API Port to use from the main config
    const API_PORT = await user_config_main.get('api_server', 'port');

    // Read the configuration file (user_config_nodes.ini)
    // create a ConfigParser object which can read the config file
    const user_config_nodes = new ConfigParser();
    // specify the config file from which to read the configuration
    user_config_nodes.read('../config/user_config_nodes.ini');

    // iterate over every node defined in the nodes config
    for (let i = 0; i < user_config_nodes.sections().length; i++) {
        // read the node's websocket from the config file
        const websocket = user_config_nodes.get(
            user_config_nodes.sections()[i], 'ws_url');

        // check whether an api has already been connected for that websocket_ip
        if (websocket in apiProviderDict) {
            console.log(`An API for ${websocket} has already been set up`);
        } else {
            // add the api and provider to the dictionary apiProviderDict so
            // that it can be accessed using its websocket ip as its key
            apiProviderDict[websocket] = await startListen(websocket);
            // check if an API connection was successfully established
            if (apiProviderDict.hasOwnProperty(websocket)
                && apiProviderDict[websocket]) {
                console.log(`Successfully Connected to ${websocket}`);
            }
        }
    }

    await app.listen(API_PORT);
    console.log(`API running on port ${API_PORT}`);

    // Miscellaneous Endpoints
    app.get('/api/pingApi', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            return res.status(REQUEST_SUCCESS_STATUS).send({'result': 'pong'});
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/pingNode', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateRPC.rpcAPI(
                    apiProviderDict[websocket].api, "system/chain"
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(
                        {'result': 'pong'});
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'API call pingNode failed.'});
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/getConnectionsList', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            let websocket_api_list = [];
            // iterate over each key in the map of websocket_ip ->
            // {api, provider}
            for (let websocket_ip in apiProviderDict) {
                // check if API is defined (so it is not returned in the list
                // if a connection was never established)
                if (apiProviderDict.hasOwnProperty(websocket_ip)
                    && apiProviderDict[websocket_ip]) {
                    // add the ip to the list of ips
                    websocket_api_list.push(websocket_ip)
                }
            }
            return res.status(REQUEST_SUCCESS_STATUS).send(
                {'result': websocket_api_list});
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    // RPC API Endpoints
    // Chain
    app.get('/api/rpc/chain/getBlockHash', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // extract the blockNumber passed in the query (optional)
            const blockNumber = req.query.block_number;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateRPC.rpcAPI(
                    apiProviderDict[websocket].api, "chain/getBlockHash",
                    blockNumber
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/rpc/chain/getFinalizedHead', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateRPC.rpcAPI(
                    apiProviderDict[websocket].api, "chain/getFinalizedHead");
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/rpc/chain/getHeader', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // extract the hash passed in the query (optional)
            const hash = req.query.hash;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateRPC.rpcAPI(
                    apiProviderDict[websocket].api, "chain/getHeader", hash);
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    // RPC
    app.get('/api/rpc/rpc/methods', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateRPC.rpcAPI(
                    apiProviderDict[websocket].api, "rpc/methods");
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    // System
    app.get('/api/rpc/system/chain', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateRPC.rpcAPI(
                    apiProviderDict[websocket].api, "system/chain");
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/rpc/system/health', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateRPC.rpcAPI(
                    apiProviderDict[websocket].api, "system/health");
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/rpc/system/networkState', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateRPC.rpcAPI(
                    apiProviderDict[websocket].api, "system/networkState");
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/rpc/system/properties', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateRPC.rpcAPI(
                    apiProviderDict[websocket].api, "system/properties");
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    // Query API Endpoints
    // Balances
    app.get('/api/query/balances/totalIssuance', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "balances/totalIssuance");
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    // Council
    app.get('/api/query/council/members', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "council/members");
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/query/council/proposalCount', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "council/proposalCount");
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/query/council/proposalOf', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // extract the hash passed in the query
            const hash = req.query.hash;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "council/proposalOf", hash);
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/query/council/proposals', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "council/proposals");
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    // Democracy
    app.get('/api/query/democracy/publicPropCount', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "democracy/publicPropCount"
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/query/democracy/referendumCount', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "democracy/referendumCount"
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/query/democracy/referendumInfoOf', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // extract the referendumIndex passed in the query
            const referendumIndex = req.query.referendum_index;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api,
                    "democracy/referendumInfoOf", referendumIndex
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    // ImOnline
    app.get('/api/query/imOnline/authoredBlocks', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // extract the sessionIndex passed in the query
            const sessionIndex = req.query.session_index;
            // extract the validatorId passed in the query
            const validatorId = req.query.validator_id;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "imOnline/authoredBlocks",
                    sessionIndex, validatorId
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/query/imOnline/receivedHeartbeats', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // extract the sessionIndex passed in the query
            const sessionIndex = req.query.session_index;
            // extract the validatorId passed in the query
            const authIndex = req.query.auth_index;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api,
                    "imOnline/receivedHeartbeats", sessionIndex, authIndex
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    // Session
    app.get('/api/query/session/currentIndex', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "session/currentIndex");
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/query/session/disabledValidators', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "session/disabledValidators"
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/query/session/validators', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "session/validators");
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    // Staking
    app.get('/api/query/staking/activeEra', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "staking/activeEra");
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/query/staking/bonded', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // extract the accountId passed in the query
            const accountId = req.query.account_id;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "staking/bonded",
                    accountId
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/query/staking/erasRewardPoints', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // extract the eraIndex passed in the query (optional)
            const eraIndex = req.query.era_index;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "staking/erasRewardPoints",
                    eraIndex
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/query/staking/erasStakers', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // extract the accountId passed in the query
            const accountId = req.query.account_id;
            // extract the eraIndex passed in the query (optional)
            const eraIndex = req.query.era_index;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "staking/erasStakers",
                    accountId, eraIndex
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/query/staking/erasTotalStake', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // extract the eraIndex passed in the query (optional)
            const eraIndex = req.query.era_index;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "staking/erasTotalStake",
                    eraIndex
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/query/staking/erasValidatorReward', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // extract the eraIndex passed in the query (optional)
            const eraIndex = req.query.era_index;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api,
                    "staking/erasValidatorReward", eraIndex
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/query/staking/payee', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // extract the accountId passed in the query
            const accountId = req.query.account_id;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "staking/payee",
                    accountId
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/query/staking/unappliedSlashes', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // extract the eraIndex passed in the query (optional)
            const eraIndex = req.query.era_index;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api,
                    "staking/unappliedSlashes", eraIndex
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    app.get('/api/query/staking/validators', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // extract the accountId passed in the query
            const accountId = req.query.account_id;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "staking/validators",
                    accountId
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    // System
    app.get('/api/query/system/events', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // extract the blockHash passed in the query (optional)
            const blockHash = req.query.block_hash;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "system/events", blockHash);
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    // Custom Endpoints
    app.get('/api/custom/getSlashAmount', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // extract the blockHash passed in the query (optional)
            const blockHash = req.query.block_hash;
            // extract the accountAddress passed in the query
            const accountAddress = req.query.account_address;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateQuery.queryAPI(
                    apiProviderDict[websocket].api, "custom/getSlashAmount",
                    blockHash, accountAddress
                );
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });

    // API Derive Endpoints
    // Staking
    app.get('/api/derive/staking/validators', async function (req, res) {
        console.log('Received request for %s', req.url);
        try {
            // extract the web socket passed in the query
            const websocket = req.query.websocket;
            // check whether an api has been connected for that websocket
            if (websocket in apiProviderDict) {
                const apiResult = await substrateDerive.deriveAPI(
                    apiProviderDict[websocket].api, "staking/validators");
                if ('result' in apiResult) {
                    return res.status(REQUEST_SUCCESS_STATUS).send(apiResult);
                } else {
                    if (apiProviderDict[websocket].provider.isConnected) {
                        return res.status(REQUEST_ERROR_STATUS).send(apiResult);
                    } else {
                        return res.status(REQUEST_ERROR_STATUS).send(
                            {'error': 'Lost connection with node.'});
                    }
                }
            } else {
                return res.status(REQUEST_ERROR_STATUS).send(
                    errorNeedToSetUpAPIMsg(websocket))
            }
        } catch (e) {
            return res.status(REQUEST_ERROR_STATUS).send(
                {'error': e.toString()});
        }
    });
}

startPolkadotAPI();
