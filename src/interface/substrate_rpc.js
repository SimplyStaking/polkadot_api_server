const timeoutUtils = require('../utils/timeout');

const TIMEOUT_TIME_MS = 10000;

// From: https://polkadot.js.org/docs/substrate/rpc
// Chain
async function getChainGetBlockHash(api, blockNumber){
    // check if blockNumber has been provided or not
    if (blockNumber) {
        return await timeoutUtils.callFnWithTimeoutSafely(
            api.rpc.chain.getBlockHash, [blockNumber], TIMEOUT_TIME_MS,
            'API call chain/getBlockHash failed.'
        );
    } else {
        return await timeoutUtils.callFnWithTimeoutSafely(
            api.rpc.chain.getBlockHash, [], TIMEOUT_TIME_MS,
            'API call chain/getBlockHash failed.'
        );
    }
}

async function getChainGetFinalizedHead(api){
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.rpc.chain.getFinalizedHead, [], TIMEOUT_TIME_MS,
        'API call chain/getFinalizedHead failed.'
    );
}

async function getChainGetHeader(api, hash){
    // check if hash has been provided or not
    if (hash) {
        return await timeoutUtils.callFnWithTimeoutSafely(
            api.rpc.chain.getHeader, [hash], TIMEOUT_TIME_MS,
            'API call chain/getHeader failed.'
        );
    } else {
        return await timeoutUtils.callFnWithTimeoutSafely(
            api.rpc.chain.getHeader, [], TIMEOUT_TIME_MS,
            'API call chain/getHeader failed.'
        );
    }
}

// RPC
async function getRPCMethods(api){
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.rpc.rpc.methods, [], TIMEOUT_TIME_MS, 'API call rpc/methods failed.'
    );
}

// System
async function getSystemChain(api){
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.rpc.system.chain, [], TIMEOUT_TIME_MS,
        'API call system/chain failed.'
    );
}

async function getSystemHealth(api){
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.rpc.system.health, [], TIMEOUT_TIME_MS,
        'API call system/health failed.'
    );
}

async function getSystemNetworkState(api){
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.rpc.system.networkState, [], TIMEOUT_TIME_MS,
        'API call system/networkState failed.'
    );
}

async function getSystemProperties(api){
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.rpc.system.properties, [], TIMEOUT_TIME_MS,
        'API call system/properties failed.'
    );
}


module.exports = {
    rpcAPI: async function (api, param1=null, param2=null) {
        switch (param1) {
            // Chain
            case 'chain/getBlockHash':
                try {
                    return {'result': await getChainGetBlockHash(api, param2)};
                } catch (e) {
                    return {'error': e.toString()}
                }
            case 'chain/getFinalizedHead':
                try {
                    return {'result': await getChainGetFinalizedHead(api)};
                } catch (e) {
                    return {'error': e.toString()}
                }
            case 'chain/getHeader':
                try {
                    return {'result': await getChainGetHeader(api, param2)};
                } catch (e) {
                    return {'error': e.toString()}
                }
            // RPC
            case 'rpc/methods':
                try {
                    return {'result': await getRPCMethods(api)};
                } catch (e) {
                    return {'error': e.toString()}
                }
            // System
            case 'system/chain':
                try {
                    return {'result': await getSystemChain(api)}
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'system/health':
                try {
                    return {'result': await getSystemHealth(api)};
                } catch (e) {
                    return {'error': e.toString()}
                }
            case 'system/networkState':
                try {
                    return {'result': await getSystemNetworkState(api)};
                } catch (e) {
                    return {'error': e.toString()}
                }
            case 'system/properties':
                try {
                    return {'result': await getSystemProperties(api)};
                } catch (e) {
                    return {'error': e.toString()}
                }
            default:
                if (!param1) {
                    return {'error': "You did not enter a method."};
                } else {
                    return {'error': "Invalid API method."};
                }
        }
    }
};
