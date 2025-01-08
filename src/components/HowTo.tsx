import React, { useState } from 'react';
import Head from 'next/head';
import Collapse from 'src/components/Collapse';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 overflow-hidden mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
      >
        <h3 className="text-xl font-semibold text-white">{question}</h3>
        {isExpanded ? (
          <ChevronUpIcon className="text-[#14F195] w-6 h-6" />
        ) : (
          <ChevronDownIcon className="text-[#14F195] w-6 h-6" />
        )}
      </button>
      <Collapse 
        expanded={isExpanded}
        height={0}
        maxHeight={500}
      >
        <div className="px-6 pb-6 text-[#C4C4F3] leading-relaxed">
          {answer}
        </div>
      </Collapse>
    </div>
  );
};

const faqItems = [
  {
    question: "What tokens can I trade on Swapfy?",
    answer: "Swapfy supports all major tokens on the Solana blockchain. Through our advanced routing, we scan multiple DEXs to find you the best available liquidity and rates across the entire Solana ecosystem."
  },
  {
    question: "How does Swapfy ensure the best rates?",
    answer: "Our smart routing system automatically scans multiple liquidity sources across the Solana network to find you the optimal trading route with the best possible rates and minimal slippage."
  },
  {
    question: "Are there any trading limits?",
    answer: "There are no imposed trading limits on Swapfy. However, trades are naturally limited by available liquidity in the pools. Our interface will show you the maximum possible trade size for any pair."
  },
  {
    question: "How secure is Swapfy?",
    answer: "Swapfy is non-custodial, meaning we never hold your funds. All trades happen directly through smart contracts on the Solana blockchain, and you always maintain complete control of your assets through your wallet."
  }
];

const quickGuideSteps = [
  {
    title: "Install a Web3 Wallet",
    content: "Before trading, you'll need a Solana wallet. We recommend Phantom or Solflare - both are free and easy to install from their official websites. Remember to securely store your recovery phrase!",
    important: "Never share your recovery phrase with anyone."
  },
  {
    title: "Add Funds to Your Wallet",
    content: "Transfer SOL (Solana's main currency) to your wallet. You'll need this for trades and small transaction fees. You can buy SOL from exchanges like Coinbase or Binance.",
    important: "Only transfer from trusted exchanges and verify wallet addresses carefully."
  },
  {
    title: "Connect Your Wallet",
    content: "Look for the blue 'Connect Wallet' button on the exchange interface. Click it and select your wallet from the options. Approve the connection request in your wallet popup.",
    important: "Always verify you're on the correct website before connecting."
  },
  {
    title: "Verify Token Addresses",
    content: "Before swapping, always verify token contract addresses. You can find official addresses on sites like Solscan or CoinGecko. Never trade tokens without verifying their authenticity.",
    important: "Scammers often create fake tokens with similar names."
  },
  {
    title: "Start Small",
    content: "For your first trade, start with a small amount to get comfortable with the process. Select your tokens, enter the amount, and review all details carefully.",
    important: "Take your time to understand fees and rates."
  },
  {
    title: "Review & Confirm",
    content: "Double-check everything: token amounts, fees, and estimated output. When ready, click 'Swap' and approve the transaction in your wallet. Wait for confirmation.",
    important: "Never rush transactions or skip verification steps."
  }
];

const HowTo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#13111C] to-[#170F2D] relative overflow-hidden">
      <Head>
        <title>How to Use Swapfy | Comprehensive DEX Trading Guide</title>
        <meta name="description" content="Learn how to trade efficiently on Swapfy - The fastest DEX on Solana. Comprehensive guide to swapping tokens, understanding liquidity, and optimizing trades." />
        <meta name="keywords" content="Swapfy guide, DEX tutorial, Solana trading, token swap guide, DeFi trading" />
      </Head>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#9945FF] opacity-10 blur-[150px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#14F195] opacity-10 blur-[150px] translate-x-1/2" />

      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#14F195] bg-clip-text text-transparent">
            How to Use Swapfy
          </h1>
          <p className="text-xl text-[#C4C4F3] max-w-3xl mx-auto">
            Fast, secure token swaps on Solana with the best rates across all DEXs
          </p>
        </div>

        {/* Quick Guide Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Complete Beginner&apos;s Guide to DEX Trading</h2>
          <div className="space-y-6">
              {quickGuideSteps.map((step, index) => (
                  <div key={index} className="backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#14F195]/50 transition-all duration-300">
                      <div className="flex items-start gap-4">
                          <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center text-white font-bold text-lg">
                              {index + 1}
                          </div>
                          <div className="space-y-2">
                              <h3 className="text-xl font-semibold text-[#14F195]">
                                  {step.title}
                              </h3>
                              <p className="text-[#C4C4F3] leading-relaxed">
                                  {step.content}
                              </p>
                              {step.important && (
                                  <div className="mt-3 p-3 bg-white/5 rounded-lg border border-[#9945FF]/30">
                                      <p className="text-sm text-[#14F195] flex items-center gap-2">
                                          <span className="text-[#9945FF]">⚠️</span>
                                          {step.important}
                                      </p>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          {faqItems.map((item, index) => (
            <FAQItem key={index} {...item} />
          ))}
        </div>

        {/* Long Form Content */}
        {/* Cornerstone Content Section */}
        <article className="max-w-4xl mx-auto mt-24">
          {/* Main Introduction */}
          <div className="backdrop-blur-sm bg-white/5 p-8 rounded-2xl border border-white/10 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Understanding Decentralized Exchanges (DEX)</h2>
              <div className="text-[#C4C4F3] space-y-6">
                  <p>
                      Decentralized Exchanges (DEXs) are transforming how we trade cryptocurrencies by offering a non-custodial, permissionless, and transparent environment for swapping digital assets. Unlike centralized exchanges, DEXs allow you to maintain full control of your private keys, trade directly from your wallet, and access a broader range of tokens—often without stringent Know Your Customer (KYC) requirements.
                  </p>
              </div>
          </div>

          {/* Key Benefits Section */}
          <div className="backdrop-blur-sm bg-white/5 p-8 rounded-2xl border border-white/10 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Key Advantages of Decentralized Trading</h2>
              <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-[#14F195]">Full Control of Your Funds</h3>
                      <p className="text-[#C4C4F3]">
                          With DEXs, you connect a non-custodial wallet, meaning you hold your private keys and retain complete ownership of your assets. There&apos;s no need to deposit funds onto the platform, reducing the risk of hacks or exchange insolvency.
                      </p>
                  </div>
                  <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-[#14F195]">Permissionless Access</h3>
                      <p className="text-[#C4C4F3]">
                          Anyone with a compatible wallet and internet connection can trade on a DEX, regardless of their location. There&apos;s typically no KYC requirement, which makes accessing new tokens and markets faster and more convenient.
                      </p>
                  </div>
                  <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-[#14F195]">Vast Token Selection</h3>
                      <p className="text-[#C4C4F3]">
                          While centralized exchanges often list only well-known cryptocurrencies, DEXs allow users to trade a wide array of tokens, including emerging altcoins. This broader selection can provide early access to promising projects.
                      </p>
                  </div>
                  <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-[#14F195]">Transparent Trading</h3>
                      <p className="text-[#C4C4F3]">
                          All transactions occur on-chain and are visible to anyone. Without a central authority, you rely on code rather than a company to ensure trades are fair and secure.
                      </p>
                  </div>
              </div>
          </div>

          {/* Advanced Concepts */}
          <div className="backdrop-blur-sm bg-white/5 p-8 rounded-2xl border border-white/10 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Essential DEX Concepts</h2>
              <div className="text-[#C4C4F3] space-y-6">
                  <div className="mb-6">
                      <h3 className="text-xl font-semibold text-[#14F195] mb-3">Liquidity Pools</h3>
                      <p>
                          Liquidity pools are the backbone of decentralized exchanges. These pools contain pairs of tokens that traders can swap between. Liquidity providers deposit equal values of two tokens into a pool, enabling trading and earning fees from trades.
                      </p>
                  </div>
                  <div className="mb-6">
                      <h3 className="text-xl font-semibold text-[#14F195] mb-3">Slippage and Price Impact</h3>
                      <p>
                          Slippage refers to the difference between the expected price of a trade and its execution price. Larger trades typically experience more slippage due to their bigger impact on the liquidity pool&apos;s balance.
                      </p>
                  </div>
                  <div className="mb-6">
                      <h3 className="text-xl font-semibold text-[#14F195] mb-3">Smart Contracts</h3>
                      <p>
                          DEXs operate using smart contracts - self-executing programs on the blockchain that automatically facilitate trades according to predetermined rules. This automation eliminates the need for intermediaries and ensures transparency.
                      </p>
                  </div>
              </div>
          </div>

          {/* Security Considerations */}
          <div className="backdrop-blur-sm bg-white/5 p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Security Best Practices</h2>
              <div className="text-[#C4C4F3] space-y-6">
                  <p>
                      When trading on decentralized exchanges, security should be your top priority. Always verify contract addresses through official sources, use hardware wallets for large holdings, and never share your private keys or seed phrases with anyone.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-[#14F195]">Do:</h3>
                          <ul className="list-disc pl-6 space-y-2">
                              <li>Verify smart contract addresses</li>
                              <li>Start with small test transactions</li>
                              <li>Use hardware wallets for large amounts</li>
                              <li>Keep your seed phrase offline</li>
                          </ul>
                      </div>
                      <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-[#14F195]">Don&apos;t:</h3>
                          <ul className="list-disc pl-6 space-y-2">
                              <li>Share private keys or seed phrases</li>
                              <li>Trust direct messages about trades</li>
                              <li>Click on unknown token approval requests</li>
                              <li>Trade tokens without research</li>
                          </ul>
                      </div>
                  </div>
              </div>
          </div>

          {/* Add some spacing before comparison */}
          <div className="mt-16">
            {/* DEX vs CEX Comparison */}
            <div className="backdrop-blur-sm bg-white/5 p-8 rounded-2xl border border-white/10 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">DEX vs Centralized Exchange: Understanding the Differences</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                  {/* DEX Column */}
                  <div className="space-y-6">
                      <div className="bg-gradient-to-r from-[#9945FF] to-[#14F195] p-[1px] rounded-xl">
                          <div className="bg-[#13111C] p-6 rounded-xl">
                              <h3 className="text-xl font-bold text-[#14F195] mb-4">Decentralized Exchange (DEX)</h3>
                              <ul className="space-y-4 text-[#C4C4F3]">
                                  <li className="flex items-start gap-2">
                                      <span className="text-[#14F195] mt-1">•</span>
                                      <span>You maintain custody of your funds through your own wallet</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                      <span className="text-[#14F195] mt-1">•</span>
                                      <span>No KYC requirements - trade instantly with just a wallet</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                      <span className="text-[#14F195] mt-1">•</span>
                                      <span>Access to wide range of tokens as soon as they launch</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                      <span className="text-[#14F195] mt-1">•</span>
                                      <span>Transparent, on-chain transactions visible to all</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                      <span className="text-[#14F195] mt-1">•</span>
                                      <span>Smart contract automation eliminates intermediaries</span>
                                  </li>
                              </ul>
                          </div>
                      </div>
                  </div>

                  {/* CEX Column */}
                  <div className="space-y-6">
                      <div className="bg-white/10 p-[1px] rounded-xl">
                          <div className="bg-[#13111C] p-6 rounded-xl">
                              <h3 className="text-xl font-bold text-white mb-4">Centralized Exchange (CEX)</h3>
                              <ul className="space-y-4 text-[#C4C4F3]">
                                  <li className="flex items-start gap-2">
                                      <span className="text-white mt-1">•</span>
                                      <span>Exchange holds custody of your funds after deposit</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                      <span className="text-white mt-1">•</span>
                                      <span>Requires KYC verification process to trade</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                      <span className="text-white mt-1">•</span>
                                      <span>Limited to tokens approved by the exchange</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                      <span className="text-white mt-1">•</span>
                                      <span>Transaction details typically private or limited</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                      <span className="text-white mt-1">•</span>
                                      <span>Relies on exchange staff and systems</span>
                                  </li>
                              </ul>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Key Considerations */}
              <div className="mt-8 space-y-6">
                  <h3 className="text-xl font-bold text-white mb-4">Key Considerations When Choosing</h3>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                      <div className="backdrop-blur-sm bg-white/5 p-6 rounded-xl border border-white/10">
                          <h4 className="text-lg font-semibold text-[#14F195] mb-3">Security Trade-offs</h4>
                          <p className="text-[#C4C4F3]">
                              DEXs put security in your hands through self-custody, while CEXs handle security but create single points of failure. Choose based on your comfort with managing private keys.
                          </p>
                      </div>

                      <div className="backdrop-blur-sm bg-white/5 p-6 rounded-xl border border-white/10">
                          <h4 className="text-lg font-semibold text-[#14F195] mb-3">Trading Experience</h4>
                          <p className="text-[#C4C4F3]">
                              CEXs offer familiar interfaces and customer support. DEXs require more technical knowledge but provide greater financial sovereignty.
                          </p>
                      </div>

                      <div className="backdrop-blur-sm bg-white/5 p-6 rounded-xl border border-white/10">
                          <h4 className="text-lg font-semibold text-[#14F195] mb-3">Asset Availability</h4>
                          <p className="text-[#C4C4F3]">
                              DEXs offer immediate access to new tokens, while CEXs carefully curate listings. Consider your trading goals and risk tolerance.
                          </p>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </article>

        {/* Add bottom spacing after the entire article */}
        <div className="pb-16"></div>
      </div>
    </div>
  );
};

export default HowTo;
