# Change Log

## Unreleased

## 1.29.1

Released on 23rd July 2021

* Updated @polkadot/api and @polkadot/api-derive packages to v5.1.1.
* Updated node version in dockerfile to v14.

## 1.28.1

Released on 7th May 2021

* Updated @polkadot/api and @polkadot/api-derive packages to v4.9.2.

## 1.27.1

Released on 13th April 2021

* Updated @polkadot/api and @polkadot/api-derive packages to v4.3.1.
* Added `staking/bonded`. This returns the controller account assigned to the stash account with the specified `account_id`.
* Added `staking/payee`. This returns the reward destination address assigned to the stash with the specified `account_id`.
* Added `staking/validators`. This returns the preferences of the validator whose stash is the specified `account_id`.

## 1.26.1

Released on 28th January 2021

* Added the `staking/unappliedSlashes`. This returns all the unapplied slashes in the specified era, or the active era if an era index is not specified.
* Fixed width of images in the documentation.
* Updated @polkadot/api and @polkadot/api-derive packages to v3.6.4.

## 1.25.1

Released on 15th October 2020

* Updated @polkadot/api and @polkadot/api-derive packages to v2.2.1.
* Since `provider.isConnected` is now a variable in the polkadot-js/api packages, we updated this in the server code.

## 1.24.1

Released on 12th October 2020

* Updated @polkadot/api and @polkadot/api-derive packages to v2.1.1.

## 1.23.1

Released on 10th July 2020

* Included the `--rpc-cors=all` flag in the `INSTALL_AND_RUN.md` guide. Note: All nodes to be added to the API server must run with this flag.
* Updated @polkadot/api and @polkadot/api-derive packages to v1.23.1.
* Code refactoring.
* All endpoints now clear the timers to avoid memory leaks.
* Every endpoint will now return a `Lost connection with node.` error message whenever the WebSocket connection is lost with the querying node.

## 1.18.1

Released on 9th June 2020

Updated @polkadot/api and @polkadot/api-derive packages to v1.18.1

## 1.16.1

Released on 27th May 2020

Updated @polkadot/api and @polkadot/api-derive packages to v1.16.1
Updated error logging for API calls with nested calls to other endpoints

## 1.13.1

Released on 7th May 2020

Updated to @polkadot/api package v1.13.1

## 1.11.1

Released on 28th April 2020

Updated to @polkadot/api package v1.11.1

## 1.10.1

Released on 13th April 2020

Updated to @polkadot/api package v1.10.1

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
