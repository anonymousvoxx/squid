import { UnknownVersionError } from '../../../common/errors'
import { encodeId } from '../../../common/tools'
import {HistoryElement, Round, RoundCollator, Collator, Delegator} from '../../../model'
import { ParachainStakingDelegationEvent } from '../../../types/generated/events'
import { EventContext, EventHandlerContext } from '../../types/contexts'
import { createStaker, getOrCreateStaker } from '../../util/entities'

interface EventData {
    account: Uint8Array
    amount: bigint
    candidate: Uint8Array
}

function getEventData(ctx: EventContext): EventData {
    const event = new ParachainStakingDelegationEvent(ctx)

    if (event.isV1001) {
        const [account, amount, candidate] = event.asV1001
        return {
            account,
            amount,
            candidate,
        }
    } else if (event.isV1300) {
        const { delegator: account, lockedAmount: amount, candidate } = event.asV1300
        return {
            account,
            amount,
            candidate,
        }
    }
    throw new UnknownVersionError(event.constructor.name)
}

export async function handleDelegation(ctx: EventHandlerContext) {
    const data = getEventData(ctx)

    const accountId = encodeId(data.account)

    const staker = await getOrCreateStaker(ctx, accountId)
    if (!staker) {
        await createStaker(ctx, {
            stashId: accountId,
            activeBond: 0n,
            role: 'delegator'
        })
    }

    const round = await ctx.store.get(Round, { where: {}, order: { index: 'DESC' } })
    const delegator = await ctx.store.get(Delegator, {where: {id: accountId }})


    await ctx.store.insert(new HistoryElement({
        id: ctx.event.id,
        blockNumber: ctx.block.height,
        timestamp: new Date(ctx.block.timestamp),
        type: 0,
        round: round,
        amount: data.amount,
        staker: staker,
        delegator: delegator
    }))

    const collatorRound = await ctx.store.get(RoundCollator, {where: {id: `${round?.index}-${staker?.stashId}` }})
    if (collatorRound) {
        collatorRound.totalBond = collatorRound.totalBond + data.amount
        await ctx.store.save(collatorRound)
    }
}
