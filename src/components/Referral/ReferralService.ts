import { ReferralProvider } from "@jup-ag/referral-sdk";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

export class ReferralService {
    private provider: ReferralProvider;
    private referralPubkey: PublicKey;

    constructor(connection: Connection) {
        this.provider = new ReferralProvider(connection);
        this.referralPubkey = new PublicKey('6sBhr7PvQNizNDzin66r1WhznJXXqpGtpHct6ZamfHUe');
    }

    async initializeReferralTokenAccount(mint: string, payerPubKey: PublicKey) {
        try {
            console.log('Creating referral token account for mint:', mint);
            const result = await this.provider.initializeReferralTokenAccount({
                payerPubKey,
                referralAccountPubKey: this.referralPubkey,
                mint: new PublicKey(mint)
            });
            console.log('Created referral token account:', result.referralTokenAccountPubKey.toString());
            return result;
        } catch (error) {
            console.error('ReferralService error for mint:', mint, error);
            return null;
        }
    }
}