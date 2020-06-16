const Timeout = require('await-timeout');

const TIMEOUT_TIME_MS = 10000;

// Staking
async function getStakingValidators(api) {
    return await Promise.race([
        api.derive.staking.validators(),
        Timeout.set(TIMEOUT_TIME_MS, 'API call staking/validators failed.')]);
}


module.exports = {
    deriveAPI: async function (api, param1=null, param2=null, param3=null) {
        switch (param1) {
            // Staking
            case 'staking/validators':
                try {
                    return {'result': await getStakingValidators(api)};
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
