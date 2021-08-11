const timeoutUtils = require('../utils/timeout');

const TIMEOUT_TIME_MS = 10000;

// Staking
async function getStakingValidators(api) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.derive.staking.validators, [], TIMEOUT_TIME_MS,
        'API call staking/validators failed.'
    );
}

// Session
async function getSessionProgress(api) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.derive.session.progress, [], TIMEOUT_TIME_MS,
        'API call session/progress failed.'
    );
}

module.exports = {
    deriveAPI: async function (api, param1=null) {
        switch (param1) {
            // Staking
            case 'staking/validators':
                try {
                    return {'result': await getStakingValidators(api)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            // Session
            case 'session/progress':
                try {
                    return {'result': await getSessionProgress(api)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            default:
                if (!param1) {
                    return {'error': 'You did not enter a method.'};
                } else {
                    return {'error': 'Invalid API method.'};
                }
        }
    }
};
