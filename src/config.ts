import { ProcessorConfig } from './types/custom/processorConfig'

const config: ProcessorConfig = {
    chainName: 'moonbase-alpha',
    prefix: '',
    dataSource: {
        archive: 'https://moonbase.archive.subsquid.io/graphql',
        chain: 'wss://wss.api.moonbase.moonbeam.network',
    },
    typesBundle: 'moonbeam',
    batchSize: 100,
    // blockRange: {
    //     from: 7828270,
    // },
}

export default config
