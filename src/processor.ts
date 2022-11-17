import { lookupArchive } from "@subsquid/archive-registry/lib";
import { Store, TypeormDatabase } from "@subsquid/typeorm-store";
import {
  BatchContext,
  BatchProcessorItem,
  SubstrateExtrinsic,
  SubstrateEvent,
  SubstrateBatchProcessor,
  SubstrateBlock,
} from "@subsquid/substrate-processor";
import { In } from "typeorm";
import { Staker, Contract, Transaction } from "./model";
import * as astarBase from "./abi/astarBase";
import * as ss58 from "@subsquid/ss58";
import { arrayify } from "@ethersproject/bytes";

const CHAIN_NODE = "wss://astar.api.onfinality.io/public-ws";
const ASTAR_DEGENS_CONTRACT = "0xd59fc6bfd9732ab19b03664a45dc29b8421bda9a";
const ASTAR_BASE_CONTRACT = "0x8e2fa5a4d4e4f0581b69af2f8f2ef2cf205ae8f0";

const database = new TypeormDatabase();
const processor = new SubstrateBatchProcessor()
  .setBatchSize(100)
  .setBlockRange({ from: 800000 })
  .setDataSource({
    chain: CHAIN_NODE,
    archive: lookupArchive("astar", { release: "FireSquid" }),
  })
  .setTypesBundle("astar")
  .addEvent("DappsStaking.BondAndStake")
  .addEvent("DappsStaking.UnbondAndUnstake")
  .addEvent("DappsStaking.NominationTransfer")
  .addEvent("EVM.Log")
  .addEthereumTransaction(ASTAR_BASE_CONTRACT);
type Item = BatchProcessorItem<typeof processor>;
type Context = BatchContext<Store, Item>;

processor.run(database, async (ctx) => {
  const transactionsData: TransactionData[] = [];
  const mappingsData: MappingData[] = [];

  for (const block of ctx.blocks) {
    for (const item of block.items) {
      if (
        ((item.name === "DappsStaking.BondAndStake" ||
          item.name === "DappsStaking.UnbondAndUnstake") &&
          item.event.args[1].value === ASTAR_DEGENS_CONTRACT) ||
        (item.name === "DappsStaking.NominationTransfer" &&
          (item.event.args[1].value === ASTAR_DEGENS_CONTRACT ||
            item.event.args[3].value === ASTAR_DEGENS_CONTRACT) &&
          item.event.args[1].value !== item.event.args[3].value)
      ) {
        const transaction = handleTransaction(
          item.name,
          block.header,
          item.event,
          item.event.extrinsic!
        );

        transactionsData.push(transaction);
      } else if (
        //native to EVM address mapping
        (item.name === "EVM.Log" &&
          ((block.header.height < 1844803 &&
            item.event.args.address === ASTAR_BASE_CONTRACT) ||
            (block.header.height >= 1844803 &&
              item.event.args.log.address === ASTAR_BASE_CONTRACT))) ||
        item.name === "Ethereum.transact"
      ) {
        if (
          item.name === "EVM.Log" &&
          item.event.call.args.transaction.value.input.startsWith("0xa3747fef")
        ) {
          //  register function

          const decodedInputs = astarBase.functions[
            "register(bytes,bytes)"
          ].decode(item.event.call.args.transaction.value.input);

          const publicKey = decodedInputs[0];
          const senderAddressTemp =
            block.header.height < 1844803
              ? item.event.args.data
              : item.event.args.log.data;
          const evmAddress = "0x".concat(senderAddressTemp.slice(26, 66));
          const nativeAccount = ss58.codec("astar").encode(arrayify(publicKey));
          const mapping: MappingData = {
            action: "mapAddress",
            accounts: {
              id: String(publicKey),
              nativeAddress: nativeAccount,
              evmAddress: evmAddress,
            },
          };
          mappingsData.push(mapping);
        }

        if (item.name === "Ethereum.transact") {
          if (
            (block.header.height < 525050 &&
              (item.call.args.transaction.input.startsWith("0x26d7b3b4") ||
                item.call.args.transaction.input.startsWith("0x7107fa18"))) ||
            (block.header.height >= 525050 &&
              (item.call.args.transaction.value.input.startsWith(
                "0x26d7b3b4"
              ) ||
                item.call.args.transaction.value.input.startsWith(
                  "0x7107fa18"
                )))
          ) {
            //unregister and sudoUnregister functions
            const unregisteredEvmAddress =
              block.header.height < 525050
                ? item.call.args.transaction.input
                : item.call.args.transaction.value.input;
            const evmAddress = "0x".concat(
              unregisteredEvmAddress.slice(34, 74)
            );

            const existingMappings: Staker[] = await ctx.store.findBy(Staker, {
              evmAddress: In([evmAddress]),
            });

            for (const existingMapping of existingMappings) {
              const mapping: MappingData = {
                action: "unmapAddress",
                accounts: {
                  id: existingMapping.id,
                  nativeAddress: null,
                  evmAddress: evmAddress,
                },
              };

              mappingsData.push(mapping);
            }
          }
        }
      }
    }
  }
  await saveTransfers(ctx, transactionsData);
  await saveMappings(ctx, mappingsData);
});

type TransactionData = {
  id: string;
  action: string;
  user: string;
  timestamp: bigint;
  block: number;
  transactionHash: string;
  amount: bigint;
};

type MappingData = {
  action: string;
  accounts: {
    id: string | null;
    nativeAddress: string | null;
    evmAddress: string;
  };
};

function handleTransaction(
  action: string,
  block: SubstrateBlock,
  event: SubstrateEvent,
  extrinsic: SubstrateExtrinsic
): TransactionData {
  let txAction: string = action;
  if (action === "DappsStaking.NominationTransfer") {
    if (event.args[1].value === ASTAR_DEGENS_CONTRACT)
      txAction = "DappsStaking.NominationTransfer_fromAD";
    else txAction = "DappsStaking.NominationTransfer_toAD";
  }
  const transaction: TransactionData = {
    id: event.id!,
    action: txAction,
    user: event.args[0],
    timestamp: BigInt(block.timestamp),
    block: block.height,
    transactionHash: extrinsic.hash,
    amount: BigInt(event.args[2]),
  };

  return transaction;
}

async function saveTransfers(
  ctx: Context,
  transactionsData: TransactionData[]
) {
  const stakersIds: Set<string> = new Set();

  for (const transactionData of transactionsData) {
    stakersIds.add(transactionData.user);
  }

  const transactions: Set<Transaction> = new Set();

  const stakers: Map<string, Staker> = new Map(
    (await ctx.store.findBy(Staker, { id: In([...stakersIds]) })).map(
      (user) => [user.id, user]
    )
  );

  const contracts: Map<string, Contract> = new Map(
    (await ctx.store.findBy(Contract, { id: ASTAR_DEGENS_CONTRACT })).map(
      (contract) => [contract.id, contract]
    )
  );

  let contract = contracts.get(ASTAR_DEGENS_CONTRACT);

  if (contract == null) {
    contract = new Contract({
      id: ASTAR_DEGENS_CONTRACT,
      name: "Astar Degens",
      totalStaked: BigInt(0),
    });
  }

  for (const transactionData of transactionsData) {
    let user = stakers.get(transactionData.user);
    if (user == null) {
      const nativeAccount = ss58
        .codec("astar")
        .encode(arrayify(transactionData.user));
      user = new Staker({
        id: transactionData.user,
        nativeAddress: nativeAccount,
        balance: BigInt(0),
      });
      stakers.set(user.id, user);
    }

    if (
      transactionData.action === "DappsStaking.BondAndStake" ||
      transactionData.action === "DappsStaking.NominationTransfer_toAD"
    ) {
      user.balance = user.balance! + transactionData.amount;
      contract.totalStaked = contract.totalStaked + transactionData.amount;
      stakers.set(user.id, user);
      contracts.set(contract.id, contract);
    }

    if (
      transactionData.action === "DappsStaking.UnbondAndUnstake" ||
      transactionData.action === "DappsStaking.NominationTransfer_fromAD"
    ) {
      user.balance = user.balance! - transactionData.amount;
      contract.totalStaked = contract.totalStaked - transactionData.amount;
      stakers.set(user.id, user);
      contracts.set(contract.id, contract);
    }

    const { id, block, transactionHash, timestamp, action, amount } =
      transactionData;

    const transaction = new Transaction({
      id,
      action,
      user,
      block,
      timestamp,
      transactionHash,
      amount,
    });

    transactions.add(transaction);
  }

  await ctx.store.save([...stakers.values()]);
  await ctx.store.save([...transactions]);
  await ctx.store.save([...contracts.values()]);
}

async function saveMappings(ctx: Context, mappingsData: MappingData[]) {
  const stakersIds: Set<string> = new Set();

  for (const mappingData of mappingsData) {
    stakersIds.add(mappingData.accounts.id!);
  }

  const stakers: Map<string, Staker> = new Map(
    (await ctx.store.findBy(Staker, { id: In([...stakersIds]) })).map(
      (user) => [user.id, user]
    )
  );

  for (const mappingData of mappingsData) {
    let user = stakers.get(mappingData.accounts.id!);

    if (user == null && mappingData.action === "mapAddress") {
      user = new Staker({
        id: mappingData.accounts.id!,
        nativeAddress: mappingData.accounts.nativeAddress!,
        balance: BigInt(0),
      });
      stakers.set(user.id, user);
    }

    if (mappingData.action === "mapAddress")
      user!.evmAddress = mappingData.accounts.evmAddress;
    else user!.evmAddress = null;

    stakers.set(user!.id, user!);
  }

  await ctx.store.save([...stakers.values()]);
}
