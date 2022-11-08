import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_, OneToOne as OneToOne_} from "typeorm"
import {Reward} from "./reward.model"
import {Staker} from "./staker.model"

@Entity_()
export class Account {
  constructor(props?: Partial<Account>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @OneToMany_(() => Reward, e => e.account)
  rewards!: Reward[]

  @OneToOne_(() => Staker)
  stakingInfo!: Staker | undefined | null

  @Column_("int4", {nullable: false})
  lastUpdateBlock!: number
}
