import config from './config'
import { SubstrateProcessor } from '@subsquid/substrate-processor'
import { DEFAULT_BATCH_SIZE, DEFAULT_PORT } from './common/consts'
import * as modules from './mappings'
import { TypeormDatabase } from '@subsquid/typeorm-store'

const database = new TypeormDatabase()
const processor = new SubstrateProcessor(database)

processor.setTypesBundle(config.typesBundle)
processor.setBatchSize(config.batchSize || DEFAULT_BATCH_SIZE)
processor.setDataSource(config.dataSource)
processor.setPrometheusPort(config.port || DEFAULT_PORT)
processor.setBlockRange(config.blockRange || { from: 0 })

//events handlers
processor.addEventHandler('ParachainStaking.NewRound', modules.staking.events.handleNewRound)
processor.addEventHandler('ParachainStaking.Rewarded', modules.staking.events.handleRewarded)
processor.addEventHandler('ParachainStaking.CandidateBondedMore', modules.staking.events.handleBondedMore)
processor.addEventHandler('ParachainStaking.CandidateBondedLess', modules.staking.events.handleBondedLess)
processor.addEventHandler('ParachainStaking.Delegation', modules.staking.events.handleDelegation)
processor.addEventHandler('ParachainStaking.DelegationDecreased', modules.staking.events.handleDelegationDecreased)
processor.addEventHandler('ParachainStaking.DelegationIncreased', modules.staking.events.handleDelegationIncreased)
processor.addEventHandler('ParachainStaking.DelegationRevoked', modules.staking.events.handleDelegationRevoked)

processor.run()