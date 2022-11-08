import { UnknownVersionError } from '../../../common/errors'
import { encodeId } from '../../../common/tools'
import {HistoryElement, Round, RoundCollator, Collator} from '../../../model'
import { ParachainStakingCandidateBondedLessEvent } from '../../../types/generated/events'
import { EventContext, EventHandlerContext } from '../../types/contexts'
import {createStaker, getOrCreateStaker} from "../../util/entities";

interface EventData {
    account: Uint8Array
    amount: bigint
    newTotal: bigint
}

function getEventData(ctx: EventContext): EventData {
    const event = new ParachainStakingCandidateBondedLessEvent(ctx)

    if (event.isV1001) {
        const [account, amount, newTotal] = event.asV1001
        return {
            account,
            amount,
            newTotal,
        }
    } else if (event.isV1300) {
        const { candidate: account, amount, newBond: newTotal } = event.asV1300
        return {
            account,
            amount,
            newTotal,
        }
    }
    throw new UnknownVersionError(event.constructor.name)
}

export async function handleBondedLess(ctx: EventHandlerContext) {
    const data = getEventData(ctx)
    const accountId = encodeId(data.account)
    const round = await ctx.store.get(Round, { where: {}, order: { index: 'DESC' } })

    const staker = await getOrCreateStaker(ctx, accountId)
    if (!staker) {
        await createStaker(ctx, {
            stashId: accountId,
            activeBond: 0n,
            role: 'collator'
        })
    }
    const collator = await ctx.store.get(Collator, {where: {id: accountId }})

    await ctx.store.insert(new HistoryElement({
        id: ctx.event.id,
        blockNumber: ctx.block.height,
        timestamp: new Date(ctx.block.timestamp),
        type: 1,
        round: round,
        amount: data.amount,
        staker: staker,
        collator: collator
    }))

    if (round && staker) {
        const collatorRound = await ctx.store.get(RoundCollator, {where: {id: `${round.index}-${staker?.stashId}` }})
        if (collatorRound) {
            collatorRound.round = round
            collatorRound.totalBond = data.newTotal
            await ctx.store.save(collatorRound)
        }
    }

}
