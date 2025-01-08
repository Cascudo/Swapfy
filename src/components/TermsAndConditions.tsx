import React from 'react';
import Head from 'next/head';
import { AlertTriangle } from 'lucide-react';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#13111C] to-[#170F2D] relative overflow-hidden">
      <Head>
        <title>Swapfy | Terms and Conditions</title>
        <meta name="description" content="Terms and conditions for using the Swapfy decentralized exchange platform on Solana." />
      </Head>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#9945FF] opacity-10 blur-[150px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#14F195] opacity-10 blur-[150px] translate-x-1/2" />

      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#14F195] bg-clip-text text-transparent">
            Terms and Conditions
          </h1>
        </div>

        {/* Beta Notice */}
        <div className="backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10 max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-4 mb-4">
            <AlertTriangle className="text-[#14F195]" size={24} />
            <h2 className="text-xl font-semibold text-white">Beta Version Notice</h2>
          </div>
          <p className="text-[#C4C4F3] leading-relaxed">
            This website is currently a mainnet-beta version. Certain functionalities may be limited or subject to change. Please be aware that during the Beta phase, there may be interruptions or incomplete features.
          </p>
        </div>

        {/* Restricted Territories Warning */}
        <div className="backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-[#9945FF]/30 max-w-4xl mx-auto mb-8">
          <p className="text-white font-semibold mb-4">
            CERTAIN SERVICES OR CONTENT, INCLUDING THE TRADING WIDGET, ARE NOT OFFERED TO PERSONS OR ENTITIES WHO RESIDE IN, ARE CITIZENS OF, ARE LOCATED IN, ARE INCORPORATED IN, OR HAVE A REGISTERED OFFICE IN THE UNITED STATES OF AMERICA (COLLECTIVELY, &quot;US PERSONS&quot;).
          </p>
          <div className="mb-4">
            <h3 className="text-[#14F195] mb-2">Restricted Territories include, but are not limited to:</h3>
            <ul className="text-[#C4C4F3] list-disc pl-6 space-y-1">
              <li>Cuba</li>
              <li>Iran</li>
              <li>North Korea</li>
              <li>Syria</li>
              <li>Crimea region of Ukraine</li>
              <li>Donetsk People&apos;s Republic (DNR) region of Ukraine</li>
              <li>Luhansk People&apos;s Republic (LNR) region of Ukraine</li>
              <li>Other regions or countries identified in OFAC&apos;s Sanctions Programs</li>
            </ul>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Modifications Section */}
          <section className="backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">1. Modifications to These Terms</h2>
            <p className="text-[#C4C4F3] leading-relaxed">
              We reserve the right, in our sole discretion, to modify these Terms from time to time. All such modifications are effective immediately upon posting the updated Terms. Your continued use of the Site and the Services after the updated Terms are posted will confirm your acceptance of the changes.
            </p>
          </section>

          {/* Use of Services Section */}
          <section className="backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">2. Use of Services</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-[#14F195] mb-2">2.1. User Representations and Warranties</h3>
                <ul className="text-[#C4C4F3] space-y-2">
                  <li>• You are of legal age in your jurisdiction</li>
                  <li>• You are not a US Person</li>
                  <li>• You are not a Sanctioned Person</li>
                  <li>• You will not use VPN to circumvent restrictions</li>
                </ul>
              </div>
              <div>
                <h3 className="text-[#14F195] mb-2">2.2. Service Conditions</h3>
                <ul className="text-[#C4C4F3] space-y-2">
                  <li>• Services may be periodically inaccessible</li>
                  <li>• We reserve the right to modify access</li>
                  <li>• You are responsible for your transactions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Risks Section */}
          <section className="backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Risks</h2>
            <ul className="text-[#C4C4F3] space-y-2">
              <li>• <span className="text-[#14F195]">Volatility:</span> Digital asset prices can be highly volatile</li>
              <li>• <span className="text-[#14F195]">Regulatory Risk:</span> Changes in regulations may impact services</li>
              <li>• <span className="text-[#14F195]">Security:</span> Blockchain transactions are irreversible</li>
              <li>• <span className="text-[#14F195]">Technology Risks:</span> Potential vulnerabilities in blockchain protocols</li>
              <li>• <span className="text-[#14F195]">Network Congestion:</span> Transactions may be delayed</li>
            </ul>
          </section>

          {/* Contact Section */}
          <div className="text-center mt-12">
            <div className="backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">
                Questions about these Terms?
              </h2>
              <a 
                href="mailto:legal@swapfy.fun" 
                className="text-[#14F195] hover:underline"
              >
                Contact legal@swapfy.fun
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;