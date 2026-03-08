'use client' // 标记此文件为客户端组件

import { getCounterProgram, getCounterProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'

// 定义程序级别的 Hook，用于管理整个 Solana 程序的基础设施
export function useCounterProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster() // 获取当前网络环境 (devnet/mainnet/localnet)
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider() // 获取 Anchor 提供者（包含钱包信息）

  // 缓存 Program ID，仅在 cluster 变更时重新计算
  const programId = useMemo(() => getCounterProgramId(cluster.network as Cluster), [cluster])
  // 缓存 Program 实例，作为与智能合约交互的核心对象
  const program = useMemo(() => getCounterProgram(provider, programId), [provider, programId])

  // React Query：抓取所有名为 "counter" 的账户数据
  const accounts = useQuery({
    queryKey: ['crud-app', 'all', { cluster }],
    queryFn: () => program.account.counter.all(),
  })

  // React Query：检查程序账户信息，常用于确认程序是否已部署
  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  // 这里的 Mutation 用于触发合约的初始化逻辑
  const initialize = useMutation({
    mutationKey: ['crud-app', 'initialize', { cluster }],
    // 执行合约的 initialize 指令
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ counter: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: async (signature) => {
      transactionToast(signature) // 弹出交易成功的提示
      await accounts.refetch() // 交易成功后，刷新列表数据
    },
    onError: () => {
      toast.error('Failed to initialize account')
    },
  })

  return { program, programId, accounts, getProgramAccount, initialize }
}

// 定义账户级别的 Hook，用于操作具体的某一个计数器账户
export function useCounterProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCounterProgram() // 复用程序级 Hook 的方法

  // 查询单个特定账户的最新状态
  const accountQuery = useQuery({
    queryKey: ['counter', 'fetch', { cluster, account }],
    queryFn: () => program.account.counter.fetch(account),
  })

  // 调用合约的 close 方法销毁账户
  const closeMutation = useMutation({
    mutationKey: ['counter', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ counter: account }).rpc(),
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accounts.refetch() // 销毁后重新获取所有账户列表
    },
  })

  // 调用合约的 decrement 方法减少计数
  const decrementMutation = useMutation({
    mutationKey: ['counter', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ counter: account }).rpc(),
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accountQuery.refetch() // 仅刷新当前账户数据
    },
  })

  // 调用合约的 increment 方法增加计数
  const incrementMutation = useMutation({
    mutationKey: ['counter', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ counter: account }).rpc(),
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accountQuery.refetch()
    },
  })

  // 调用合约的 set 方法设置特定数值
  const setMutation = useMutation({
    mutationKey: ['counter', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ counter: account }).rpc(),
    onSuccess: async (tx) => {
      transactionToast(tx)
      await accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
