use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Offer {
    pub id: u64,
    pub maker: Pubkey,
    pub mint_token_a: Pubkey,
    pub mint_token_b: Pubkey,
    pub token_b_wanted_amount: u64,
    pub bump: u8,
}