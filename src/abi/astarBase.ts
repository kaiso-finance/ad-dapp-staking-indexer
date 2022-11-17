import * as ethers from "ethers";
import assert from "assert";

export const abi = new ethers.utils.Interface(getJsonAbi());

export type AstarBaseRegistered0Event = ([newEntry: string] & {newEntry: string})

export type ContractVersion0Event = ([newValue: ethers.BigNumber] & {newValue: ethers.BigNumber})

export type OwnershipTransferred0Event = ([previousOwner: string, newOwner: string] & {previousOwner: string, newOwner: string})

export interface EvmLog {
  data: string;
  topics: string[];
}

function decodeEvent(signature: string, data: EvmLog): any {
  return abi.decodeEventLog(
    abi.getEvent(signature),
    data.data || "",
    data.topics
  );
}

export const events = {
  "AstarBaseRegistered(address)": {
    topic: abi.getEventTopic("AstarBaseRegistered(address)"),
    decode(data: EvmLog): AstarBaseRegistered0Event {
      return decodeEvent("AstarBaseRegistered(address)", data)
    }
  }
  ,
  "ContractVersion(uint256)": {
    topic: abi.getEventTopic("ContractVersion(uint256)"),
    decode(data: EvmLog): ContractVersion0Event {
      return decodeEvent("ContractVersion(uint256)", data)
    }
  }
  ,
  "OwnershipTransferred(address,address)": {
    topic: abi.getEventTopic("OwnershipTransferred(address,address)"),
    decode(data: EvmLog): OwnershipTransferred0Event {
      return decodeEvent("OwnershipTransferred(address,address)", data)
    }
  }
  ,
}

export type Pause0Function = ([_state: boolean] & {_state: boolean})

export type Register0Function = ([ss58PublicKey: string, signedMsg: string] & {ss58PublicKey: string, signedMsg: string})

export type SetBeneficiary0Function = ([_newBeneficiary: string] & {_newBeneficiary: string})

export type SetPrecompileAddresses0Function = ([dapps: string, sr25529: string, ecdsa: string] & {dapps: string, sr25529: string, ecdsa: string})

export type SetUnregisterFee0Function = ([_newCost: ethers.BigNumber] & {_newCost: ethers.BigNumber})

export type SudoUnRegister0Function = ([evmAddress: string] & {evmAddress: string})

export type TransferOwnership0Function = ([newOwner: string] & {newOwner: string})


function decodeFunction(data: string): any {
  return abi.decodeFunctionData(data.slice(0, 10), data)
}

export const functions = {
  "getVersion()": {
    sighash: abi.getSighash("getVersion()"),
  }
  ,
  "initialize()": {
    sighash: abi.getSighash("initialize()"),
  }
  ,
  "pause(bool)": {
    sighash: abi.getSighash("pause(bool)"),
    decode(input: string): Pause0Function {
      return decodeFunction(input)
    }
  }
  ,
  "register(bytes,bytes)": {
    sighash: abi.getSighash("register(bytes,bytes)"),
    decode(input: string): Register0Function {
      return decodeFunction(input)
    }
  }
  ,
  "renounceOwnership()": {
    sighash: abi.getSighash("renounceOwnership()"),
  }
  ,
  "setBeneficiary(address)": {
    sighash: abi.getSighash("setBeneficiary(address)"),
    decode(input: string): SetBeneficiary0Function {
      return decodeFunction(input)
    }
  }
  ,
  "setPrecompileAddresses(address,address,address)": {
    sighash: abi.getSighash("setPrecompileAddresses(address,address,address)"),
    decode(input: string): SetPrecompileAddresses0Function {
      return decodeFunction(input)
    }
  }
  ,
  "setUnregisterFee(uint256)": {
    sighash: abi.getSighash("setUnregisterFee(uint256)"),
    decode(input: string): SetUnregisterFee0Function {
      return decodeFunction(input)
    }
  }
  ,
  "sudoUnRegister(address)": {
    sighash: abi.getSighash("sudoUnRegister(address)"),
    decode(input: string): SudoUnRegister0Function {
      return decodeFunction(input)
    }
  }
  ,
  "transferOwnership(address)": {
    sighash: abi.getSighash("transferOwnership(address)"),
    decode(input: string): TransferOwnership0Function {
      return decodeFunction(input)
    }
  }
  ,
  "unRegister()": {
    sighash: abi.getSighash("unRegister()"),
  }
  ,
  "withdraw()": {
    sighash: abi.getSighash("withdraw()"),
  }
  ,
}

interface ChainContext  {
  _chain: Chain
}

interface BlockContext  {
  _chain: Chain
  block: Block
}

interface Block  {
  height: number
}

interface Chain  {
  client:  {
    call: <T=any>(method: string, params?: unknown[]) => Promise<T>
  }
}

export class Contract  {
  private readonly _chain: Chain
  private readonly blockHeight: number
  readonly address: string

  constructor(ctx: BlockContext, address: string)
  constructor(ctx: ChainContext, block: Block, address: string)
  constructor(ctx: BlockContext, blockOrAddress: Block | string, address?: string) {
    this._chain = ctx._chain
    if (typeof blockOrAddress === 'string')  {
      this.blockHeight = ctx.block.height
      this.address = ethers.utils.getAddress(blockOrAddress)
    }
    else  {
      assert(address != null)
      this.blockHeight = blockOrAddress.height
      this.address = ethers.utils.getAddress(address)
    }
  }

  async DAPPS_STAKING(): Promise<string> {
    return this.call("DAPPS_STAKING", [])
  }

  async ECDSAContract(): Promise<string> {
    return this.call("ECDSAContract", [])
  }

  async SR25519Contract(): Promise<string> {
    return this.call("SR25519Contract", [])
  }

  async addressMap(arg0: string): Promise<string> {
    return this.call("addressMap", [arg0])
  }

  async beneficiary(): Promise<string> {
    return this.call("beneficiary", [])
  }

  async checkStakerStatus(evmAddress: string): Promise<ethers.BigNumber> {
    return this.call("checkStakerStatus", [evmAddress])
  }

  async checkStakerStatusOnContract(evmAddress: string, stakingContract: string): Promise<ethers.BigNumber> {
    return this.call("checkStakerStatusOnContract", [evmAddress, stakingContract])
  }

  async isRegistered(evmAddress: string): Promise<boolean> {
    return this.call("isRegistered", [evmAddress])
  }

  async owner(): Promise<string> {
    return this.call("owner", [])
  }

  async paused(): Promise<boolean> {
    return this.call("paused", [])
  }

  async registeredCnt(): Promise<ethers.BigNumber> {
    return this.call("registeredCnt", [])
  }

  async ss58Map(arg0: string): Promise<string> {
    return this.call("ss58Map", [arg0])
  }

  async unregisterFee(): Promise<ethers.BigNumber> {
    return this.call("unregisterFee", [])
  }

  async version(): Promise<ethers.BigNumber> {
    return this.call("version", [])
  }

  private async call(name: string, args: any[]) : Promise<any> {
    const fragment = abi.getFunction(name)
    const data = abi.encodeFunctionData(fragment, args)
    const result = await this._chain.client.call('eth_call', [{to: this.address, data}, this.blockHeight])
    const decoded = abi.decodeFunctionResult(fragment, result)
    return decoded.length > 1 ? decoded : decoded[0]
  }
}

function getJsonAbi(): any {
  return [
    {
      "type": "event",
      "name": "AstarBaseRegistered",
      "inputs": [
        {
          "type": "address",
          "name": "newEntry",
          "internalType": "address",
          "indexed": false
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ContractVersion",
      "inputs": [
        {
          "type": "uint256",
          "name": "newValue",
          "internalType": "uint256",
          "indexed": false
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "type": "address",
          "name": "previousOwner",
          "internalType": "address",
          "indexed": true
        },
        {
          "type": "address",
          "name": "newOwner",
          "internalType": "address",
          "indexed": true
        }
      ],
      "anonymous": false
    },
    {
      "type": "function",
      "stateMutability": "view",
      "outputs": [
        {
          "type": "address",
          "name": "",
          "internalType": "contract DappsStaking"
        }
      ],
      "name": "DAPPS_STAKING",
      "inputs": []
    },
    {
      "type": "function",
      "stateMutability": "view",
      "outputs": [
        {
          "type": "address",
          "name": "",
          "internalType": "contract ECDSA"
        }
      ],
      "name": "ECDSAContract",
      "inputs": []
    },
    {
      "type": "function",
      "stateMutability": "view",
      "outputs": [
        {
          "type": "address",
          "name": "",
          "internalType": "contract SR25519"
        }
      ],
      "name": "SR25519Contract",
      "inputs": []
    },
    {
      "type": "function",
      "stateMutability": "view",
      "outputs": [
        {
          "type": "bytes",
          "name": "",
          "internalType": "bytes"
        }
      ],
      "name": "addressMap",
      "inputs": [
        {
          "type": "address",
          "name": "",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "function",
      "stateMutability": "view",
      "outputs": [
        {
          "type": "address",
          "name": "",
          "internalType": "address"
        }
      ],
      "name": "beneficiary",
      "inputs": []
    },
    {
      "type": "function",
      "stateMutability": "view",
      "outputs": [
        {
          "type": "uint128",
          "name": "",
          "internalType": "uint128"
        }
      ],
      "name": "checkStakerStatus",
      "inputs": [
        {
          "type": "address",
          "name": "evmAddress",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "function",
      "stateMutability": "view",
      "outputs": [
        {
          "type": "uint128",
          "name": "",
          "internalType": "uint128"
        }
      ],
      "name": "checkStakerStatusOnContract",
      "inputs": [
        {
          "type": "address",
          "name": "evmAddress",
          "internalType": "address"
        },
        {
          "type": "address",
          "name": "stakingContract",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "function",
      "stateMutability": "nonpayable",
      "outputs": [],
      "name": "getVersion",
      "inputs": []
    },
    {
      "type": "function",
      "stateMutability": "nonpayable",
      "outputs": [],
      "name": "initialize",
      "inputs": []
    },
    {
      "type": "function",
      "stateMutability": "view",
      "outputs": [
        {
          "type": "bool",
          "name": "",
          "internalType": "bool"
        }
      ],
      "name": "isRegistered",
      "inputs": [
        {
          "type": "address",
          "name": "evmAddress",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "function",
      "stateMutability": "view",
      "outputs": [
        {
          "type": "address",
          "name": "",
          "internalType": "address"
        }
      ],
      "name": "owner",
      "inputs": []
    },
    {
      "type": "function",
      "stateMutability": "nonpayable",
      "outputs": [],
      "name": "pause",
      "inputs": [
        {
          "type": "bool",
          "name": "_state",
          "internalType": "bool"
        }
      ]
    },
    {
      "type": "function",
      "stateMutability": "view",
      "outputs": [
        {
          "type": "bool",
          "name": "",
          "internalType": "bool"
        }
      ],
      "name": "paused",
      "inputs": []
    },
    {
      "type": "function",
      "stateMutability": "nonpayable",
      "outputs": [],
      "name": "register",
      "inputs": [
        {
          "type": "bytes",
          "name": "ss58PublicKey",
          "internalType": "bytes"
        },
        {
          "type": "bytes",
          "name": "signedMsg",
          "internalType": "bytes"
        }
      ]
    },
    {
      "type": "function",
      "stateMutability": "view",
      "outputs": [
        {
          "type": "uint256",
          "name": "_value",
          "internalType": "uint256"
        }
      ],
      "name": "registeredCnt",
      "inputs": []
    },
    {
      "type": "function",
      "stateMutability": "nonpayable",
      "outputs": [],
      "name": "renounceOwnership",
      "inputs": []
    },
    {
      "type": "function",
      "stateMutability": "nonpayable",
      "outputs": [],
      "name": "setBeneficiary",
      "inputs": [
        {
          "type": "address",
          "name": "_newBeneficiary",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "function",
      "stateMutability": "nonpayable",
      "outputs": [],
      "name": "setPrecompileAddresses",
      "inputs": [
        {
          "type": "address",
          "name": "dapps",
          "internalType": "address"
        },
        {
          "type": "address",
          "name": "sr25529",
          "internalType": "address"
        },
        {
          "type": "address",
          "name": "ecdsa",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "function",
      "stateMutability": "nonpayable",
      "outputs": [],
      "name": "setUnregisterFee",
      "inputs": [
        {
          "type": "uint256",
          "name": "_newCost",
          "internalType": "uint256"
        }
      ]
    },
    {
      "type": "function",
      "stateMutability": "view",
      "outputs": [
        {
          "type": "address",
          "name": "",
          "internalType": "address"
        }
      ],
      "name": "ss58Map",
      "inputs": [
        {
          "type": "bytes",
          "name": "",
          "internalType": "bytes"
        }
      ]
    },
    {
      "type": "function",
      "stateMutability": "nonpayable",
      "outputs": [],
      "name": "sudoUnRegister",
      "inputs": [
        {
          "type": "address",
          "name": "evmAddress",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "function",
      "stateMutability": "nonpayable",
      "outputs": [],
      "name": "transferOwnership",
      "inputs": [
        {
          "type": "address",
          "name": "newOwner",
          "internalType": "address"
        }
      ]
    },
    {
      "type": "function",
      "stateMutability": "payable",
      "outputs": [],
      "name": "unRegister",
      "inputs": []
    },
    {
      "type": "function",
      "stateMutability": "view",
      "outputs": [
        {
          "type": "uint256",
          "name": "",
          "internalType": "uint256"
        }
      ],
      "name": "unregisterFee",
      "inputs": []
    },
    {
      "type": "function",
      "stateMutability": "view",
      "outputs": [
        {
          "type": "uint256",
          "name": "",
          "internalType": "uint256"
        }
      ],
      "name": "version",
      "inputs": []
    },
    {
      "type": "function",
      "stateMutability": "payable",
      "outputs": [],
      "name": "withdraw",
      "inputs": []
    }
  ]
}
