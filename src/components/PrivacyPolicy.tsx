import React from 'react';
import Head from 'next/head';
import { Shield } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      title: "1. Data We Collect",
      content: "We collect non-identifiable information to enhance your experience and optimize our services. This may include:",
      list: [
        "Website performance metrics",
        "Feature usage patterns",
        "Technical data such as browser type, device type, and session duration"
      ]
    },
    {
      title: "2. How We Use Collected Data",
      content: "The data collected is used solely to:",
      list: [
        "Improve website functionality",
        "Monitor website performance",
        "Address potential technical issues"
      ]
    },
    {
      title: "3. Cookies and Tracking Technologies",
      content: "Swapfy.fun uses cookies and similar tools to understand website performance and enhance user experience. You can control your cookie preferences in your browser settings."
    },
    {
      title: "4. Children's Privacy",
      content: "Our platform is not intended for individuals under the age of 18. We do not knowingly collect data from minors."
    },
    {
      title: "5. Data Sharing",
      content: "We do not share your data with third parties. Any collected data is used internally to improve our services."
    },
    {
      title: "6. Security",
      content: "We employ reasonable measures to protect the limited data we collect from unauthorized access or misuse."
    },
    {
      title: "7. Changes to This Privacy Notice",
      content: "We may update this Privacy Notice from time to time. Changes will be posted on this page with an updated \"Last updated\" date. Your continued use of Swapfy.fun signifies your acceptance of any changes."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#13111C] to-[#170F2D] relative overflow-hidden">
      <Head>
        <title>Swapfy | Privacy Policy</title>
        <meta name="description" content="Privacy policy for the Swapfy decentralized exchange platform." />
      </Head>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#9945FF] opacity-10 blur-[150px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#14F195] opacity-10 blur-[150px] translate-x-1/2" />

      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#14F195] bg-clip-text text-transparent">
            Privacy Policy
          </h1>
        </div>

        {/* Last Updated */}
        <div className="backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10 max-w-4xl mx-auto mb-8 text-center">
          <p className="text-[#C4C4F3]">Last updated: December 6, 2024</p>
        </div>

        {/* Introduction */}
        <div className="backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10 max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="text-[#14F195]" size={24} />
            <h2 className="text-xl font-semibold text-white">Privacy at Swapfy.fun</h2>
          </div>
          <p className="text-[#C4C4F3] leading-relaxed">
            At Swapfy.fun, your privacy is important to us. We do not collect personal data from our users. Any data collected is strictly for improving website features and performance.
          </p>
        </div>

        {/* Main Content Sections */}
        <div className="max-w-4xl mx-auto space-y-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className="backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#14F195]/50 transition-all duration-300"
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                {section.title}
              </h2>
              <p className="text-[#C4C4F3] leading-relaxed mb-4">
                {section.content}
              </p>
              {section.list && (
                <ul className="list-disc pl-6 space-y-2">
                  {section.list.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-[#C4C4F3]">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
            <h2 className="text-xl font-semibold text-white mb-4">
              Contact Us
            </h2>
            <p className="text-[#C4C4F3] mb-4">
              For questions about this Privacy Notice or concerns about data use, please reach out to us at:
            </p>
            <a 
              href="mailto:support@swapfy.fun" 
              className="text-[#14F195] hover:underline"
            >
              support@swapfy.fun
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;