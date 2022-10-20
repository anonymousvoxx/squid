import assert from 'assert'
import { UnknownVersionError } from '../../../common/errors'
import { encodeId } from '../../../common/tools'
import { Reward, Round, RoundCollator} from '../../../model'
import { ParachainStakingRewardedEvent } from '../../../types/generated/events'
import { CommonHandlerContext, EventContext, EventHandlerContext } from '../../types/contexts'
import { ActionData } from '../../types/data'
import { getMeta } from '../../util/actions'
import { RewardPaymentDelay } from '../../util/consts'
import { getOrCreateStaker } from '../../util/entities'

interface EventData {
    amount: bigint
    account: Uint8Array
}

function getEventData(ctx: EventContext): EventData {
    const event = new ParachainStakingRewardedEvent(ctx)

    if (event.isV900) {
        const [account, amount] = event.asV900
        return {
            account,
            amount,
        }
    } else if (event.isV1300) {
        const { account, rewards: amount } = event.asV1300
        return {
            account,
            amount,
        }
    } else {
        throw new UnknownVersionError(event.constructor.name)
    }
}

export async function handleRewarded(ctx: EventHandlerContext) {
    const data = getEventData(ctx)

    await saveReward(ctx, {
        id: ctx.event.id,
        blockNumber: ctx.block.height,
        timestamp: new Date(ctx.block.timestamp),
        extrinsicHash: ctx.event.extrinsic?.hash,
        accountId: encodeId(data.account),
        amount: data.amount,
    })
}

export interface RewardData extends ActionData {
    amount: bigint
    accountId: string
}

export async function saveReward(ctx: CommonHandlerContext, data: RewardData) {
    const staker = await getOrCreateStaker(ctx, data.accountId)
    assert (staker != null)
    if (staker != null) {
        staker.totalReward += data.amount

        await ctx.store.save(staker)

        const round = await ctx.store.get(Round, { where: {}, order: { index: 'DESC' } })
        assert(round != null)

        const collatorRound = await ctx.store.get(RoundCollator, {
            where: {id: `${round.index-2}-${staker.stashId}` }})
        if (collatorRound != null) {
            if (collatorRound.selfBond && collatorRound.totalBond != null && collatorRound.totalBond > 0) {
                const colStakeShare = collatorRound.selfBond / collatorRound.totalBond
                const amountDue = Number(data.amount) / (0.2 + 0.5 * Number(colStakeShare))
                const colRew = 0.2 * amountDue + 0.5 * amountDue * Number(colStakeShare)
                const colAnnualRew = colRew * Number(1460)
                collatorRound.apr = colAnnualRew / Number(collatorRound.selfBond)
                collatorRound.round = round
                    await ctx.store.save(collatorRound)
                const collatorLastRound = await ctx.store.get(RoundCollator, {
                    where: {id: `${round.index-4}-${staker.stashId}` }
                })
                if (collatorLastRound != null) {
                    if (collatorLastRound.apr != null) {
                        const lastApr = staker.apr24h || 0
                        const avgApr = lastApr * 4
                        if (lastApr > 0) {
                            staker.apr24h = (avgApr - collatorLastRound.apr + collatorRound.apr) / 4
                        }
                        else {
                            const collatorLastRound3 = await ctx.store.get(RoundCollator, {
                                where: {id: `${round.index-3}-${staker.stashId}` }})
                            const collatorLastRound3Apr = collatorLastRound3?.apr || 0
                            const collatorLastRound2 = await ctx.store.get(RoundCollator, {
                                where: {id: `${round.index-2}-${staker.stashId}` }})
                            const collatorLastRound2Apr = collatorLastRound2?.apr || 0
                            const collatorLastRound1 = await ctx.store.get(RoundCollator, {
                                where: {id: `${round.index-1}-${staker.stashId}` }})
                            const collatorLastRound1Apr = collatorLastRound1?.apr || 0
                            staker.apr24h = (
                                collatorLastRound3Apr + collatorLastRound2Apr + collatorLastRound1Apr + collatorRound.apr
                            ) / 4
                        }
                    }
                    else {
                        staker.apr24h = (collatorRound.apr) / 4
                    }
                    await ctx.store.save(staker)
                }
            }




            await ctx.store.insert(
                new Reward({
                    ...getMeta(data),
                    account: staker.stash,
                    amount: data.amount,
                    round: Math.min((round?.index || 0) - RewardPaymentDelay, 0),
                    staker,
                })
            )
        }
    }
}
