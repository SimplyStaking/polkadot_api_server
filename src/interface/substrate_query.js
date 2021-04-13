const timeoutUtils = require('../utils/timeout');

const TIMEOUT_TIME_MS = 10000;

// From: https://polkadot.js.org/docs/substrate/storage
// Balances
async function getBalancesTotalIssuance(api) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.balances.totalIssuance, [], TIMEOUT_TIME_MS,
        'API call balances/totalIssuance failed.'
    );
}

// Council
async function getCouncilMembers(api) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.council.members, [], TIMEOUT_TIME_MS,
        'API call council/members failed.'
    );
}

async function getCouncilProposalCount(api) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.council.proposalCount, [], TIMEOUT_TIME_MS,
        'API call council/proposalCount failed.'
    );
}

async function getCouncilProposalOf(api, hash) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.council.proposalOf, [hash], TIMEOUT_TIME_MS,
        'API call council/proposalOf failed.'
    );
}

async function getCouncilProposals(api) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.council.proposals, [], TIMEOUT_TIME_MS,
        'API call council/proposals failed.'
    );
}

// Democracy
async function getDemocracyPublicPropCount(api) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.democracy.publicPropCount, [], TIMEOUT_TIME_MS,
        'API call democracy/publicPropCount failed.'
    );
}

async function getDemocracyReferendumCount(api) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.democracy.referendumCount, [], TIMEOUT_TIME_MS,
        'API call democracy/referendumCount failed.'
    );
}

async function getDemocracyReferendumInfoOf(api, referendumIndex) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.democracy.referendumInfoOf, [referendumIndex],
        TIMEOUT_TIME_MS, 'API call democracy/referendumInfoOf failed.'
    );
}

// ImOnline
async function getImOnlineAuthoredBlocks(api, sessionIndex, validatorId) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.imOnline.authoredBlocks, [sessionIndex, validatorId],
        TIMEOUT_TIME_MS, 'API call imOnline/authoredBlocks failed.'
    );
}

async function getImOnlineReceivedHeartBeats(api, sessionIndex, authIndex) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.imOnline.receivedHeartbeats, [sessionIndex, authIndex],
        TIMEOUT_TIME_MS, 'API call imOnline/receivedHeartbeats failed.'
    );
}

// Session
async function getSessionCurrentIndex(api) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.session.currentIndex, [], TIMEOUT_TIME_MS,
        'API call session/currentIndex failed.'
    );
}

async function getSessionDisabledValidators(api) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.session.disabledValidators, [], TIMEOUT_TIME_MS,
        'API call session/disabledValidators failed.'
    );
}

async function getSessionValidators(api) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.session.validators, [], TIMEOUT_TIME_MS,
        'API call session/validators failed.'
    );
}

// Staking
async function getStakingActiveEra(api) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.staking.activeEra, [], TIMEOUT_TIME_MS,
        'API call staking/activeEra failed.'
    );
}

async function getStakingBonded(api, accountId) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.staking.bonded, [accountId], TIMEOUT_TIME_MS,
        'API call staking/bonded failed.'
    );
}

async function getStakingErasRewardPoints(api, eraIndex) {
    if (eraIndex) {
        return await timeoutUtils.callFnWithTimeoutSafely(
            api.query.staking.erasRewardPoints, [eraIndex], TIMEOUT_TIME_MS,
            'API call staking/erasRewardPoints failed.'
        );
    } else {
        let activeEraIndex;
        try {
            activeEraIndex = await getActiveEraIndex(api);
        } catch (e) {
            console.log('Function call to getActiveEraIndex failed.');
            throw 'API call staking/erasRewardPoints failed.';
        }
        return await timeoutUtils.callFnWithTimeoutSafely(
            api.query.staking.erasRewardPoints, [activeEraIndex],
            TIMEOUT_TIME_MS, 'API call staking/erasRewardPoints failed.'
        );
    }
}

async function getStakingErasStakers(api, accountId, eraIndex) {
    // check if eraIndex has been provided or not
    if (eraIndex) {
        return await timeoutUtils.callFnWithTimeoutSafely(
            api.query.staking.erasStakers, [eraIndex, accountId],
            TIMEOUT_TIME_MS, 'API call staking/erasStakers failed.'
        );
    } else {
        let activeEraIndex;
        try {
            activeEraIndex = await getActiveEraIndex(api);
        } catch (e) {
            console.log('Function call to getActiveEraIndex failed.');
            throw 'API call staking/erasStakers failed.';
        }
        return await timeoutUtils.callFnWithTimeoutSafely(
            api.query.staking.erasStakers, [activeEraIndex, accountId],
            TIMEOUT_TIME_MS, 'API call staking/erasStakers failed.'
        );
    }
}

async function getStakingErasTotalStake(api, eraIndex) {
    // check if eraIndex has been provided or not
    if (eraIndex) {
        return await timeoutUtils.callFnWithTimeoutSafely(
            api.query.staking.erasTotalStake, [eraIndex], TIMEOUT_TIME_MS,
            'API call staking/erasStakers failed.'
        );
    } else {
        let activeEraIndex;
        try {
            activeEraIndex = await getActiveEraIndex(api);
        } catch (e) {
            console.log('Function call to getActiveEraIndex failed.');
            throw 'API call staking/erasTotalStake failed.';
        }
        return await timeoutUtils.callFnWithTimeoutSafely(
            api.query.staking.erasTotalStake, [activeEraIndex], TIMEOUT_TIME_MS,
            'API call staking/erasTotalStake failed.'
        );
    }
}

async function getStakingErasValidatorReward(api, eraIndex) {
    if (eraIndex) {
        return await timeoutUtils.callFnWithTimeoutSafely(
            api.query.staking.erasValidatorReward, [eraIndex], TIMEOUT_TIME_MS,
            'API call staking/erasValidatorReward failed.'
        );
    } else {
        let activeEraIndex;
        try {
            activeEraIndex = await getActiveEraIndex(api);
        } catch (e) {
            console.log('Function call to getActiveEraIndex failed.');
            throw 'API call staking/erasValidatorReward failed.';
        }
        return await timeoutUtils.callFnWithTimeoutSafely(
            api.query.staking.erasValidatorReward, [activeEraIndex-1],
            TIMEOUT_TIME_MS, 'API call staking/erasValidatorReward failed.'
        );
    }
}

async function getStakingPayee(api, accountId) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.staking.payee, [accountId], TIMEOUT_TIME_MS,
        'API call staking/payee failed.'
    );
}

async function getStakingUnappliedSlashes(api, eraIndex) {
    // check if eraIndex has been provided or not
    if (eraIndex) {
        return await timeoutUtils.callFnWithTimeoutSafely(
            api.query.staking.unappliedSlashes, [eraIndex], TIMEOUT_TIME_MS,
            'API call staking/unappliedSlashes failed.'
        );
    } else {
        let activeEraIndex;
        try {
            activeEraIndex = await getActiveEraIndex(api);
        } catch (e) {
            console.log('Function call to getActiveEraIndex failed.');
            throw 'API call staking/unappliedSlashes failed.';
        }
        return await timeoutUtils.callFnWithTimeoutSafely(
            api.query.staking.unappliedSlashes, [activeEraIndex],
            TIMEOUT_TIME_MS, 'API call staking/unappliedSlashes failed.'
        );
    }
}

async function getStakingValidators(api, accountId) {
    return await timeoutUtils.callFnWithTimeoutSafely(
        api.query.staking.validators, [accountId], TIMEOUT_TIME_MS,
        'API call staking/validators failed.'
    );
}

// System
async function getSystemEvents(api, blockHash) {
    // check if blockHash has been provided or not
    if (blockHash) {
        return await timeoutUtils.callFnWithTimeoutSafely(
            api.query.system.events.at, [blockHash], TIMEOUT_TIME_MS,
            'API call system/events failed.'
        );
    } else {
        return await timeoutUtils.callFnWithTimeoutSafely(
            api.query.system.events, [], TIMEOUT_TIME_MS,
            'API call system/events failed.'
        );
    }
}

// Custom
async function getActiveEraIndex(api) {
    let activeEra = await timeoutUtils.callFnWithTimeoutSafely(
        getStakingActiveEra, [api], TIMEOUT_TIME_MS,
        'API call custom/getActiveEraIndex failed.'
    );
    try {
        return activeEra.toJSON()['index'];
    } catch (e) {
        throw 'API call custom/getActiveEraIndex failed.';
    }
}

async function getSlashAmount(api, blockHash, accountAddress) {
    let events;
    try {
        events = await getSystemEvents(api, blockHash);
    } catch (e) {
        throw 'API call custom/getSlashAmount failed.';
    }
    let slashAmount = 0;
    // check every event to look for a staking:Slash event
    for (const record of events) {
        // extract the event and the event types
        const event = record.event;
        // check if the current event is a staking:Slash event
        if (event.section == 'staking' && event.method == 'Slash') {
            const event_str = event.data.toString();
            // remove the [ and ] from the string.
            // split the string into two elements by the ','
            const event_arr = event_str.slice(1, event_str.length-1).split(',');
            // remove the " from the ends of the account id
            event_arr[0] = event_arr[0].slice(1,event_arr[0].length-1);

            // check if the accountAddress of the current slashing event is the
            // one being queried
            if (event_arr[0] == accountAddress) {
                // if it is, add the slashed amount in the event to the total
                slashAmount += parseInt(event_arr[1]);
            }
        }
    }
    return slashAmount;
}


module.exports = {
    queryAPI: async function (api, param1=null, param2=null, param3=null) {
        switch (param1) {
            // Balances
            case 'balances/totalIssuance':
                try {
                    return {'result': await getBalancesTotalIssuance(api)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            // Council
            case 'council/members':
                try {
                    return {'result': await getCouncilMembers(api)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'council/proposalCount':
                try {
                    return {'result': await getCouncilProposalCount(api)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'council/proposalOf':
                if (!param2) {
                    return {'error': 'You did not enter the hash.'};
                }
                try {
                    return {'result': await getCouncilProposalOf(api, param2)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'council/proposals':
                try {
                    return {'result': await getCouncilProposals(api)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            // Democracy
            case 'democracy/publicPropCount':
                try {
                    return {'result': await getDemocracyPublicPropCount(api)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'democracy/referendumCount':
                try {
                    return {'result': await getDemocracyReferendumCount(api)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'democracy/referendumInfoOf':
                if (!param2) {
                    return {'error': 'You did not enter the referendum index.'};
                }
                try {
                    return {'result': await getDemocracyReferendumInfoOf(api,
                            param2)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            // ImOnline
            case 'imOnline/authoredBlocks':
                if (!param2) {
                    return {'error': 'You did not enter the session index.'};
                }
                if (!param3){
                    return {'error': 'You did not enter the stash account '
                            + 'address of the validator that needs to be '
                            + 'queried'};
                }
                try {
                    return {'result': await getImOnlineAuthoredBlocks(api,
                            param2, param3)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'imOnline/receivedHeartbeats':
                if (!param2) {
                    return {'error': 'You did not enter the session index.'};
                }
                if (!param3){
                    return {'error': 'You did not enter the index of the ' +
                            'validator in the list returned by ' +
                            'session.validators()'};
                }
                try {
                    return {'result': await getImOnlineReceivedHeartBeats(api,
                            param2, param3)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            // Session
            case 'session/currentIndex':
                try {
                    return {'result': await getSessionCurrentIndex(api)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'session/disabledValidators':
                try {
                    return {'result': await getSessionDisabledValidators(api)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'session/validators':
                try {
                    return {'result': await getSessionValidators(api)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            // Staking
            case 'staking/activeEra':
                try {
                    return {'result': await getStakingActiveEra(api)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'staking/bonded':
                if (!param2) {
                        return {'error': 'You did not enter the stash '
                                + 'address that needs to be queried'};
                }
                try {
                    return {'result': await getStakingBonded(api, param2)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'staking/erasRewardPoints':
                try {
                    return {'result': await getStakingErasRewardPoints(api,
                            param2)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'staking/erasStakers':
                if (!param2) {
                    return {'error': 'You did not enter the stash account '
                            + 'address of the validator that needs to be '
                            + 'queried'};
                }
                try {
                    return {'result': await getStakingErasStakers(api, param2,
                            param3)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'staking/erasTotalStake':
                try {
                    return {'result': await getStakingErasTotalStake(api,
                            param2)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'staking/erasValidatorReward':
                try {
                    return {'result': await getStakingErasValidatorReward(api,
                            param2)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'staking/payee':
                if (!param2) {
                    return {'error': 'You did not enter the stash '
                            + 'address that needs to be queried'};
                }
                try {
                    return {'result': await getStakingPayee(api, param2)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'staking/unappliedSlashes':
                try {
                    return {'result': await getStakingUnappliedSlashes(api,
                            param2)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            case 'staking/validators':
                if (!param2) {
                    return {'error': 'You did not enter the stash '
                            + 'address that needs to be queried'};
                }
                try{
                    return {'result': await getStakingValidators(api, param2)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            // System
            case 'system/events':
                try {
                    return {'result': await getSystemEvents(api, param2)};
                } catch (e) {
                    return {'error': e.toString()};
                }
            // Custom Endpoints
            case 'custom/getSlashAmount':
                try {
                    if (!param3) {
                        return {'error': 'You did not enter the account '
                                + 'address of the validator that needs to be '
                                + 'queried'};
                    }
                    return {'result': await getSlashAmount(api, param2,
                            param3)};
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
