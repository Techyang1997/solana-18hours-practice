'use client'

import { getCrudAppProgram, getCrudAppProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'
import { signature } from '@solana/web3.js/src/layout'

interface CreateJournalEntryArgs {
  owner: PublicKey,
  title: string,
  message: string,
}
export function useCrudAppProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCrudAppProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getCrudAppProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['crud-app', 'all', { cluster }],
    queryFn: () => program.account.journalEntry.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createJournalEntry = useMutation<string,Error,CreateJournalEntryArgs>({
    mutationKey: [`journalEntry`,`create`,{cluster}],
    mutationFn: async({owner,title,message}) => {
      return program.methods.createJournalEntry(title,message).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Creating Journal Entry Error: ${error.message}`);
    }
  });
  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createJournalEntry
  }
}

export function useCrudAppProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program,programId, accounts } = useCrudAppProgram()

  const accountQuery = useQuery({
    queryKey: ['journalEntry', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntry.fetch(account),
  })

  const updateEntry = useMutation<string, Error, CreateJournalEntryArgs>({
    mutationKey: ['journalEntry', 'update', { cluster }],
    mutationFn: async ({ owner, title, message }) => {
      const [journalEntryAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(title), owner.toBuffer()],
        programId,
      )

      return program.methods.updateJournalEntry(title, message).rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      accounts.refetch()
    },
    onError: (error) => {
      toast.error(`Failed to update journal entry: ${error.message}`)
    },
  });

  const deleteEntry = useMutation({
    mutationKey: ['journal', 'delete', { cluster, account }],
    mutationFn: (title: string) => program.methods.deleteJournalEntry(title).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  }
}
