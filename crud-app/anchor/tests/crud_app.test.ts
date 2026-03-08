import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { CrudApp } from '../target/types/crud_app'

describe('crud-app', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.CrudApp as Program<CrudApp>

  it('CreateJournalEntry', async () => {
    const title = 'Bootcamp';
    const message = "I'm learning Solana!";

    const [jounalEntryPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from(title),payer.publicKey.toBytes()],program.programId);

    await program.methods
      .createJournalEntry(title, message)
      .accounts({
        owner: payer.publicKey,
        journalEntry: jounalEntryPda,
      })
      .rpc()

    const journalEntry = await program.account.journalEntry.fetch(jounalEntryPda)
    expect(journalEntry.owner).toEqual(payer.publicKey)
    expect(journalEntry.title).toEqual('Bootcamp')
    expect(journalEntry.message).toEqual("I'm learning Solana!")
  })

  it('UpdateJournalEntry', async () => {
    const title = 'Bootcamp'
    const message = "Good luck!"

    const [jounalEntryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(title), payer.publicKey.toBytes()],
      program.programId,
    )

    await program.methods
      .updateJournalEntry(title, message)
      .accounts({
        owner: payer.publicKey,
        journalEntry: jounalEntryPda,
      })
      .rpc()

    const journalEntry = await program.account.journalEntry.fetch(jounalEntryPda)
    expect(journalEntry.owner).toEqual(payer.publicKey)
    expect(journalEntry.title).toEqual('Bootcamp')
    expect(journalEntry.message).toEqual('Good luck!')
  })


})
