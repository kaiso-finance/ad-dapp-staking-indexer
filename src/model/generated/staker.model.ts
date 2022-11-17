import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class Staker {
  constructor(props?: Partial<Staker>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("text", {nullable: false})
  nativeAddress!: string

  @Column_("text", {nullable: true})
  evmAddress!: string | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  balance!: bigint
}
