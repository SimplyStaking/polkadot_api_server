# Change Log

## Unreleased

### Additions:
* `/api/rpc/rpc/methods` has been added, which returns the `version` and `methods`, a list of RPC methods that are exposed by the node.
* `/api/rpc/system/networkState` has been added, which returns the current state of the network, namely the `peerId`, `listenedAddresses`, `externalAddresses` and `connectedPeers` for the specified node.
* `/api/rpc/system/properties` has been added, which returns the properties defined in the chain spec, namely the `ss58Format`, `tokenDecimals` and `tokenSymbol` for the network of the specified node.
* `/api/query/balances/totalIssuance` has been added, which returns the total amount of units issued in the chain. Value may be in Hex.
* `/api/query/staking/erasTotalStake` has been added, which returns the total amount staked in the specified `era index`, or in the `active` one if it is not specified. Value may be in Hex.

## 1.9.1

Released on 7th April 2020

Updated to @polkadot/api package v1.9.1

### Additions:
* `/api/query/staking/erasRewardPoints` has been added, which returns the `total` and `individual` rewards in the specified `era index`, or in the `active` one if it is not specified.
* `/api/query/staking/erasValidatorReward` has been added, which returns the total validator era payout in the specified `era index`, or in the last finished era (active era - 1) if it is not specified.

## 1.8.1

Released on 25th March 2020

Updated to @polkadot/api package v1.8.1

### Breaking Changes:
* `/api/query/staking/stakers` has been changed to `/api/query/staking/erasStakers`. The `account_address` parameter has been changed to `account_id` and the optional parameter `era_index` has been added.
* `/api/query/staking/currentElected` has been changed to `/api/derive/staking/validators`. The new endpoint now returns both `validators`, the list of validators which are active in the current `session`, as well as `nextElected`, the list of `validators` which will be active in the next `session`.

### Additions:
* `/api/query/staking/activeEra` has been added, which returns the `index` and `start` of the `active era`

## 1.4.1

Released on 26th February 2020

### Added

* Updated @polkadot/api package version to use the latest stable version (v1.4.1)
* Updated docs to refer to the latest docker image version

## 1.2.1

Released on 17th February 2020

### Added

* Updated @polkadot/api package version to use the latest stable version (v1.2.1)
* Updated docs to refer to the latest docker image version

## 1.1.1

Released on 6th February 2020

### Added

* Updated @polkadot/api package version to use the latest stable version (v1.1.1)
* Updated docs to refer to the latest docker image version
* Changed license specified in package.json to Apache 2.0

### Other

* Separated the Polkadot API Server from the [PANIC for Polkadot](https://github.com/SimplyVC/panic_polkadot) repo

## 1.0.0

Released on 21st January 2020

### Added

* First version of the Polkadot API Server