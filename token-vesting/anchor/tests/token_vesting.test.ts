import * as anchor from '@coral-xyz/anchor'
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { TokenVesting } from '../target/types/token_vesting'
import { createMint, mintTo, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { BN } from 'bn.js'

describe('token_vesting', () => {

  const companyName = 'Company'

  let employerProvider: AnchorProvider;
  let employer: Keypair;
  let connection: Connection;
  let beneficiary: Keypair;
  let beneficiaryProvider: AnchorProvider;
  let employerProgram: Program<TokenVesting>;
  let beneficiaryProgram: Program<TokenVesting>;
  let mint: PublicKey;
  let vestingAccountKey: PublicKey;
  let treasuryTokenAccount: PublicKey;
  let employeeAccount: PublicKey;

  beforeAll(async () => {
    employerProvider = anchor.AnchorProvider.env();
    anchor.setProvider(employerProvider);

    employer = (employerProvider.wallet as Wallet).payer;

    connection = employerProvider.connection;

    mint = await createMint(connection,employer,employer.publicKey,null,2);

    beneficiary = Keypair.generate()

    beneficiaryProvider = new AnchorProvider(
      connection,
      new NodeWallet(beneficiary),
      AnchorProvider.defaultOptions(),
    );

    employerProgram = new Program<TokenVesting>(anchor.workspace.TokenVesting.idl, employerProvider);

    beneficiaryProgram = new Program<TokenVesting>(anchor.workspace.TokenVesting.idl, beneficiaryProvider);

    [vestingAccountKey] = PublicKey.findProgramAddressSync([Buffer.from(companyName)],employerProgram.programId);

    [treasuryTokenAccount] = PublicKey.findProgramAddressSync([Buffer.from('vesting_treasury'), Buffer.from(companyName)],employerProgram.programId);

    [employeeAccount] = PublicKey.findProgramAddressSync([Buffer.from('employee_vesting'),beneficiary.publicKey.toBuffer(),vestingAccountKey.toBuffer()],beneficiaryProgram.programId);

  })
  it('create a vesting token account', async () => {
      const tx = employerProgram.methods.createVestingAccount(companyName).accounts({
        signer: employer.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      }).rpc({commitment:"confirmed"});

      const vestingAccountData = await employerProgram.account.vestingAccount.fetch(vestingAccountKey,"confirmed");

    console.log('Vesting Account Data:', JSON.stringify(vestingAccountData, null, 2));

    console.log('Create Vesting Account Transaction Signature:', tx);
  })

  it('create a treasury token account', async () => {
    const amount = 10_000 * 10 ** 9;
    const mintTx = await mintTo(connection, employer, mint, treasuryTokenAccount,employer.publicKey, amount)
    console.log("Mint to treasury token account:",mintTx);
  })

  it('create an employee vesting account', async () => {
    const tx2 = await employerProgram.methods
      .createEmployeeAccount(new BN(0), new BN(100), new BN(100), new BN(0))
      .accounts({
        beneficiary: beneficiary.publicKey,
        vestingAccount: vestingAccountKey,
      })
      .rpc({ commitment: 'confirmed', skipPreflight: true })

    console.log('Create Employee Account Transaction Signature:', tx2)
    console.log('Employee account', employeeAccount.toBase58())
  })

  it('claim tokens', async () => {

    console.log('Employee account', employeeAccount.toBase58())

    const tx3 = await beneficiaryProgram.methods
      .claimTokens(companyName)
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: 'confirmed' })

    console.log('Claim Tokens transaction signature', tx3)
  })
})
