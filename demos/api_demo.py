import requests

# defining the api-endpoint
API_ENDPOINT: str = "http://localhost:3000"
# API_ENDPOINT: str = "http://5.6.7.8:3000"

websocket: str = 'ws://1.2.3.4:9944'

# Miscellaneous Endpoints
print('Miscellaneous Endpoints:')

print('/api/pingApi')
r = requests.get(url=API_ENDPOINT + '/api/pingApi')
print(r.text)

print('/api/pingNode')
r = requests.get(url=API_ENDPOINT + '/api/pingNode',
                 params={'websocket': websocket})
print(r.text)

print('/api/getConnectionsList')
r = requests.get(url=API_ENDPOINT + '/api/getConnectionsList')
print(r.text)

print()

# RPC API
# Chain
print('Chain:')

print('/api/rpc/chain/getBlockHash')
r = requests.get(url=API_ENDPOINT + '/api/rpc/chain/getBlockHash',
                 params={'websocket': websocket})
print(r.text)
r = requests.get(url=API_ENDPOINT + '/api/rpc/chain/getBlockHash',
                 params={'websocket': websocket,
                         'block_number': '36430'})
print(r.text)

print('/api/rpc/chain/getFinalizedHead')
r = requests.get(url=API_ENDPOINT + '/api/rpc/chain/getFinalizedHead',
                 params={'websocket': websocket})
print(r.text)

print('/api/rpc/chain/getHeader')
r = requests.get(url=API_ENDPOINT + '/api/rpc/chain/getHeader',
                 params={'websocket': websocket})
print(r.text)
r = requests.get(url=API_ENDPOINT + '/api/rpc/chain/getHeader',
                 params={'websocket': websocket,
                         'hash': '0xdd661348a4971e0cf75d89da69de01907e81070cb8099dddc12b611c18371679'})
print(r.text)

# RPC
print('RPC:')

print('/api/rpc/rpc/methods')
r = requests.get(url=API_ENDPOINT + '/api/rpc/rpc/methods',
                 params={'websocket': websocket})
print(r.text)

# System
print('System:')

print('/api/rpc/system/chain')
r = requests.get(url=API_ENDPOINT + '/api/rpc/system/chain',
                 params={'websocket': websocket})
print(r.text)

print('/api/rpc/system/health')
r = requests.get(url=API_ENDPOINT + '/api/rpc/system/health',
                 params={'websocket': websocket})
print(r.text)

print('/api/rpc/system/networkState')
r = requests.get(url=API_ENDPOINT + '/api/rpc/system/networkState',
                 params={'websocket': websocket})
print(r.text)

print('/api/rpc/system/properties')
r = requests.get(url=API_ENDPOINT + '/api/rpc/system/properties',
                 params={'websocket': websocket})
print(r.text)

print()

# Query API
# Balances
print('Balances:')

print('/api/query/balances/totalIssuance')
r = requests.get(url=API_ENDPOINT + '/api/query/balances/totalIssuance',
                 params={'websocket': websocket})
print(r.text)

# Council
print('Council:')

print('/api/query/council/members')
r = requests.get(url=API_ENDPOINT + '/api/query/council/members',
                 params={'websocket': websocket})
print(r.text)

print('/api/query/council/proposalCount')
r = requests.get(url=API_ENDPOINT + '/api/query/council/proposalCount',
                 params={'websocket': websocket})
print(r.text)

print('/api/query/council/proposalOf')
r = requests.get(url=API_ENDPOINT + '/api/query/council/proposalOf',
                 params={'websocket': websocket,
                         'hash': 'boq'})
print(r.text)

print('/api/query/council/proposals')
r = requests.get(url=API_ENDPOINT + '/api/query/council/proposals',
                 params={'websocket': websocket})
print(r.text)

# Democracy
print('Democracy:')

print('/api/query/democracy/publicPropCount')
r = requests.get(url=API_ENDPOINT + '/api/query/democracy/publicPropCount',
                 params={'websocket': websocket})
print(r.text)

print('/api/query/democracy/referendumCount')
r = requests.get(url=API_ENDPOINT + '/api/query/democracy/referendumCount',
                 params={'websocket': websocket})
print(r.text)

print('/api/query/democracy/referendumInfoOf')
r = requests.get(url=API_ENDPOINT + '/api/query/democracy/referendumInfoOf',
                 params={'websocket': websocket,
                         'referendum_index': '43'})
print(r.text)

# ImOnline
print('ImOnline:')

print('/api/query/imOnline/authoredBlocks')
r = requests.get(url=API_ENDPOINT + '/api/query/imOnline/authoredBlocks',
                 params={'websocket': websocket,
                         'session_index': '3',
                         'validator_id': 'DNDBcYD8zzqAoZEtgNzouVp2sVxsvqzD4UdB5WrAUwjqpL8'})
print(r.text)

print('/api/query/imOnline/receivedHeartbeats')
r = requests.get(url=API_ENDPOINT + '/api/query/imOnline/receivedHeartbeats',
                 params={'websocket': websocket,
                         'session_index': '3',
                         'auth_index': '0'})
print(r.text)

# Session
print('Session:')

print('/api/query/session/currentIndex')
r = requests.get(url=API_ENDPOINT + '/api/query/session/currentIndex',
                 params={'websocket': websocket})
print(r.text)

print('/api/query/session/disabledValidators')
r = requests.get(url=API_ENDPOINT + '/api/query/session/disabledValidators',
                 params={'websocket': websocket})
print(r.text)

print('/api/query/session/validators')
r = requests.get(url=API_ENDPOINT + '/api/query/session/validators',
                 params={'websocket': websocket})
print(r.text)

# Staking
print('Staking:')

print('/api/query/staking/activeEra')
r = requests.get(url=API_ENDPOINT + '/api/query/staking/activeEra',
                 params={'websocket': websocket})
print(r.text)

print('/api/query/staking/erasRewardPoints')
r = requests.get(url=API_ENDPOINT + '/api/query/staking/erasRewardPoints',
                 params={'websocket': websocket})
print(r.text)
r = requests.get(url=API_ENDPOINT + '/api/query/staking/erasRewardPoints',
                 params={'websocket': websocket,
                         'era_index': '630'})
print(r.text)


print('/api/query/staking/erasStakers')
r = requests.get(url=API_ENDPOINT + '/api/query/staking/erasStakers',
                 params={'websocket': websocket,
                         'account_id': 'DNDBcYD8zzqAoZEtgNzouVp2sVxsvqzD4UdB5WrAUwjqpL8'})
print(r.text)
r = requests.get(url=API_ENDPOINT + '/api/query/staking/erasStakers',
                 params={'websocket': websocket,
                         'account_id': 'DNDBcYD8zzqAoZEtgNzouVp2sVxsvqzD4UdB5WrAUwjqpL8',
                         'era_index': '630'})
print(r.text)

print('/api/query/staking/erasTotalStake')
r = requests.get(url=API_ENDPOINT + '/api/query/staking/erasTotalStake',
                 params={'websocket': websocket})
print(r.text)
r = requests.get(url=API_ENDPOINT + '/api/query/staking/erasTotalStake',
                 params={'websocket': websocket,
                         'era_index': '630'})
print(r.text)

print('/api/query/staking/erasValidatorReward')
r = requests.get(url=API_ENDPOINT + '/api/query/staking/erasValidatorReward',
                 params={'websocket': websocket})
print(r.text)
r = requests.get(url=API_ENDPOINT + '/api/query/staking/erasValidatorReward',
                 params={'websocket': websocket,
                         'era_index': '840'})
print(r.text)


# System
print('System:')

print('/api/query/system/events')
r = requests.get(url=API_ENDPOINT + '/api/query/system/events',
                 params={'websocket': websocket})
print(r.text)
r = requests.get(url=API_ENDPOINT + '/api/query/system/events',
                 params={'websocket': websocket,
                         'block_hash': '0x1511c16054f1beaa4995cf8c637d6450f1a77acfa40f9f3f51579bba2b92a6c7'})
print(r.text)

print()

# Custom
print('Custom:')

print('/api/custom/getSlashAmount')
r = requests.get(url=API_ENDPOINT + '/api/custom/getSlashAmount',
                 params={'websocket': websocket,
                         'account_address': 'HsGrsqL4nCBCW2ovc4kKG98c4mFp99BHRFkBSRZW1ETDe3U'})
print(r.text)
r = requests.get(url=API_ENDPOINT + '/api/custom/getSlashAmount',
                 params={'websocket': websocket,
                         'block_hash': '0x1511c16054f1beaa4995cf8c637d6450f1a77acfa40f9f3f51579bba2b92a6c7',
                         'account_address': 'HsGrsqL4nCBCW2ovc4kKG98c4mFp99BHRFkBSRZW1ETDe3U'})
print(r.text)

print()

# Derive
print('Derive:')

print('/api/derive/staking/validators')
r = requests.get(url=API_ENDPOINT + '/api/derive/staking/validators',
                 params={'websocket': websocket})
print(r.text)

print()

# Misc
print('Misc:')
r = requests.get(url=API_ENDPOINT + '/api/query/session/validators',
                 params={'websocket': websocket})
print(r.text)

print()

# Invalid IP
r = requests.get(url=API_ENDPOINT + '/api/query/session/validators',
                 params={'websocket': 'ws://2.3.4.5:9944'})
print(r.text)

# r_text = r.text
# r_json = json.loads(r_text)
#
# print(r.text)
# print(r_json)
# print(r_json['result'])
