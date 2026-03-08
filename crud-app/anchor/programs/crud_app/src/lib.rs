#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("5zRTM9ZfCk7uX4mfdnxLBqyd2GVH2wMqFmuahnh81Yvp");

#[program]
pub mod crud_app {
    use super::*;

    pub fn create_journal_entry( ctx:Context<CreateJournalEntry>, title: String, message: String) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = *ctx.accounts.owner.key;
        journal_entry.title = title;
        journal_entry.message = message;
        Ok(())
    }

    pub fn update_journal_entry( ctx:Context<UpdateJournalEntry>,  _title:String, message: String) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.message = message;
        Ok(())
    }

    pub fn delete_journal_entry( _ctx:Context<DeleteJournalEntry>,  _title: String) -> Result<()> {
        Ok(())
    }
}


#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateJournalEntry<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
    init,
    payer = owner,
    seeds = [title.as_bytes(),owner.key().as_ref()],
    bump,
    space = 8 + JournalEntry::INIT_SPACE
    )]
    pub journal_entry: Account<'info, JournalEntry>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateJournalEntry<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [title.as_bytes(),owner.key().as_ref()],
        bump,
        realloc = 8 + JournalEntry::INIT_SPACE,
        realloc::payer = owner,
        realloc::zero = true
    )]
    pub journal_entry: Account<'info, JournalEntry>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteJournalEntry<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
    seeds = [title.as_bytes(),owner.key().as_ref()],
    bump,
    close = owner,
    )]
    pub journal_entry: Account<'info, JournalEntry>,
    pub system_program: Program<'info, System>,
}


#[account]
#[derive(InitSpace)]
pub struct JournalEntry {
    pub owner: Pubkey,
    #[max_len(50)]
    pub title: String,
    #[max_len(1024)]
    pub message: String,
}

