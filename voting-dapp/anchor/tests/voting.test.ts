import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { Voting } from '../target/types/voting'

describe('voting', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Voting as Program<Voting>

  const pollId = new anchor.BN(1)
  it('Initialize Poll', async () => {
    const description = "What is your favorite type of peanut butter?";
    const pollStart = new anchor.BN(1772350000);
    const pollEnd = new anchor.BN(1772350925);

    const [pollPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('poll'), pollId.toArrayLike(Buffer, 'le', 8)],
      program.programId,
    )
    await program.methods
      .initPoll(pollId, description, pollStart, pollEnd)
      .accounts({
        signer: payer.publicKey,
        poll: pollPda,
      })
      .rpc()

    const poll = await program.account.poll.fetch(pollPda);

    expect(poll.description).toEqual('What is your favorite type of peanut butter?');
  })

  it('Initialize Candidate', async () => {

    const [pollPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('poll'), pollId.toArrayLike(Buffer, 'le', 8)],
      program.programId,
    )

    const [smoothPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('candidate'), Buffer.from("smooth"),pollId.toArrayLike(Buffer, 'le', 8)],
      program.programId,
    )
    await program.methods
      .initCandidate('smooth', pollId)
      .accounts({
        signer: payer.publicKey,
        poll: pollPda,
        candidate: smoothPda,
      })
      .rpc()

    const [crunchyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('candidate'), Buffer.from('crunchy'), pollId.toArrayLike(Buffer, 'le', 8)],
      program.programId,
    )
    await program.methods
      .initCandidate('crunchy', pollId)
      .accounts({
        signer: payer.publicKey,
        poll: pollPda,
        candidate: crunchyPda,
      })
      .rpc()

    const smooth = await program.account.candidate.fetch(smoothPda)
    const crunchy = await program.account.candidate.fetch(crunchyPda)

    expect(smooth.candidateName).toEqual('smooth')
    expect(smooth.candidateVotes.toNumber()).toEqual(0)
    expect(crunchy.candidateName).toEqual('crunchy')
    expect(crunchy.candidateVotes.toNumber()).toEqual(0)
  })

  // it('Vote', async () => {
  //   const [pollPda] = PublicKey.findProgramAddressSync(
  //     [Buffer.from('poll'), pollId.toArrayLike(Buffer, 'le', 8)],
  //     program.programId,
  //   )
  //
  //   const [smoothPda] = PublicKey.findProgramAddressSync(
  //     [Buffer.from('candidate'), Buffer.from('smooth'), pollId.toArrayLike(Buffer, 'le', 8)],
  //     program.programId,
  //   )
  //   await program.methods
  //     .vote('smooth', pollId)
  //     .accounts({
  //       signer: payer.publicKey,
  //       poll: pollPda,
  //       candidate: smoothPda,
  //     })
  //     .rpc()
  //
  //   const [crunchyPda] = PublicKey.findProgramAddressSync(
  //     [Buffer.from('candidate'), Buffer.from('crunchy'), pollId.toArrayLike(Buffer, 'le', 8)],
  //     program.programId,
  //   )
  //
  //   const smooth = await program.account.candidate.fetch(smoothPda)
  //   const crunchy = await program.account.candidate.fetch(crunchyPda)
  //
  //   expect(smooth.candidateName).toEqual('smooth')
  //   expect(smooth.candidateVotes.toNumber()).toEqual(1)
  //   expect(crunchy.candidateName).toEqual('crunchy')
  //   expect(crunchy.candidateVotes.toNumber()).toEqual(0)
  // })
})
