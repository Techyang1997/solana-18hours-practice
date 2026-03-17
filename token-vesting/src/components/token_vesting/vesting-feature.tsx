'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useTokenVestingProgram } from './vesting-data-access'
import { VestingCreate, VestingList } from './vesting-ui'
import { AppHero } from '../app-hero'
import { ellipsify } from '@/lib/utils'

export default function VestingFeature() {
  const { publicKey } = useWallet()
  const { programId } = useTokenVestingProgram()

  return publicKey ? (
    <div>
      <AppHero
        title="Vesting Smart Contract"
        subtitle={
          'Create a new token_vesting account below.'
        }
      >
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <VestingCreate />
      </AppHero>
      <VestingList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  )
}
