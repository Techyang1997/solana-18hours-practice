// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TokenVestingIDL from '../target/idl/token_vesting.json'
import type { TokenVesting } from '../target/types/token_vesting'

// Re-export the generated IDL and type
export { TokenVesting, TokenVestingIDL }

// The programId is imported from the program IDL.
export const TokenVesting_PROGRAM_ID = new PublicKey(TokenVestingIDL.address)

export function getTokenVestingProgram(provider: AnchorProvider, address?: PublicKey): Program<TokenVesting> {
  return new Program({ ...TokenVestingIDL, address: address ? address.toBase58() : TokenVestingIDL.address } as TokenVesting, provider)
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getTokenVestingProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey('Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe')
    case 'mainnet-beta':
    default:
      return TokenVesting_PROGRAM_ID
  }
}
