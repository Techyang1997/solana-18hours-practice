import { ActionPostRequest, ActionGetResponse, ACTIONS_CORS_HEADERS, createPostResponse } from '@solana/actions'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { Voting } from 'anchor/target/types/voting'
import { BN, Program } from '@coral-xyz/anchor'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const IDL = require("@/../anchor/target/idl/voting.json");

export const OPTIONS = GET;

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: 'https://strapi-data.sfo2.cdn.digitaloceanspaces.com/uploads/8e3cefb00e8c04b1f903dc9f4a5a4b5c.jpg',
    title: 'Vote for your favorite types of peanut butter!',
    description: 'Vote between smooth and crunchy peanut butter.',
    label: 'Vote',
    links: {
      actions: [
        { href: '/api/vote?candidate=smooth', label: 'Vote for smooth' },
        { href: '/api/vote?candidate=crunchy', label: 'Vote for crunchy' },
      ],
    },
  }
  return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");
  if (candidate != 'smooth' && candidate != 'crunchy') {
    return new Response('Invalid candidate!', { status: 400, headers: ACTIONS_CORS_HEADERS })
  }

  const connection = new Connection("http://127.0.0.1:8899","confirmed");
  const program: Program<Voting> = new Program<Voting>(IDL,{connection});
  const body: ActionPostRequest = await request.json();
  let voter;
  try {
    voter = new PublicKey(body.account)
  } catch (e) {
    return new Response('Invalid candidate!', { status:400 , headers: ACTIONS_CORS_HEADERS });
  }
  const instruction = await program.methods.vote(candidate,new BN(1)).accounts({signer:voter}).instruction();

  const blockHash = await connection.getLatestBlockhash();

  const transaction: Transaction = new Transaction({
    feePayer: voter,
    blockhash: blockHash.blockhash,
    lastValidBlockHeight: blockHash.lastValidBlockHeight,
  }).add(instruction);

  const response: ActionPostResponse = await createPostResponse({
    fields: {
      transaction: transaction,
    },
  })
  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}
