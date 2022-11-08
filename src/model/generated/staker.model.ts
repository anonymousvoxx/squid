import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToOne as OneToOne_, Index as Index_, JoinColumn as JoinColumn_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {Account} from "./account.model"
import {RoundCollator} from "./roundCollator.model"
import {RoundNominator} from "./roundNominator.model"
import {Reward} from "./reward.model"

@Entity_()
export class Staker {
  constructor(props?: Partial<Staker>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("text", {nullable: false})
  stashId!: string

  @Index_({unique: true})
  @OneToOne_(() => Account, {nullable: false})
  @JoinColumn_()
  stash!: Account

  @Column_("text", {nullable: true})
  role!: string | undefined | null

  @Column_("numeric", {nullable: true})
  commission!: number | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  activeBond!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  totalReward!: bigint

  @Column_("numeric", {nullable: true})
  apr24h!: number | undefined | null

  @OneToMany_(() => RoundCollator, e => e.staker)
  collatorHistory!: RoundCollator[]

  @OneToMany_(() => RoundNominator, e => e.staker)
  nominatorHistory!: RoundNominator[]

  @OneToMany_(() => Reward, e => e.staker)
  rewards!: Reward[]
}
