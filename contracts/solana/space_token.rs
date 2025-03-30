//! Program to create a SPL token called SPACE for the SpaceNexus platform

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("SpacENexus111111111111111111111111111111");

#[program]
pub mod space_token {
    use super::*;

    pub fn initialize_mint(
        ctx: Context<InitializeMint>,
        name: String,
        symbol: String,
        uri: String,
        decimals: u8,
    ) -> Result<()> {
        // Set token metadata
        let space_token = &mut ctx.accounts.space_token;
        space_token.name = name;
        space_token.symbol = symbol;
        space_token.uri = uri;
        space_token.decimals = decimals;
        space_token.authority = ctx.accounts.authority.key();
        space_token.supply = 0;

        // Initialize SPL token mint
        let cpi_accounts = token::InitializeMint {
            mint: ctx.accounts.mint.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::initialize_mint(cpi_ctx, decimals, &space_token.authority, Some(&space_token.authority))?;

        Ok(())
    }

    pub fn mint_tokens(
        ctx: Context<MintTokens>,
        amount: u64,
    ) -> Result<()> {
        // Increase total supply
        let space_token = &mut ctx.accounts.space_token;
        space_token.supply = space_token.supply.checked_add(amount).unwrap();

        // Mint SPL tokens
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, amount)?;

        Ok(())
    }

    pub fn update_metadata(
        ctx: Context<UpdateMetadata>,
        name: Option<String>,
        symbol: Option<String>,
        uri: Option<String>,
    ) -> Result<()> {
        let space_token = &mut ctx.accounts.space_token;
        
        // Ensure caller is token authority
        require!(
            space_token.authority == ctx.accounts.authority.key(),
            ErrorCode::Unauthorized
        );

        // Update metadata
        if let Some(name) = name {
            space_token.name = name;
        }
        if let Some(symbol) = symbol {
            space_token.symbol = symbol;
        }
        if let Some(uri) = uri {
            space_token.uri = uri;
        }

        Ok(())
    }

    pub fn transfer_authority(
        ctx: Context<TransferAuthority>,
        new_authority: Pubkey,
    ) -> Result<()> {
        let space_token = &mut ctx.accounts.space_token;
        
        // Ensure caller is token authority
        require!(
            space_token.authority == ctx.accounts.authority.key(),
            ErrorCode::Unauthorized
        );

        // Update authority
        space_token.authority = new_authority;

        Ok(())
    }
}

#[account]
#[derive(Default)]
pub struct SpaceToken {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
    pub authority: Pubkey,
    pub supply: u64,
}

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(init, payer = payer, space = 8 + 32 + 4 + 200)]
    pub space_token: Account<'info, SpaceToken>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub space_token: Account<'info, SpaceToken>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateMetadata<'info> {
    #[account(mut)]
    pub space_token: Account<'info, SpaceToken>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferAuthority<'info> {
    #[account(mut)]
    pub space_token: Account<'info, SpaceToken>,
    
    pub authority: Signer<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
}