const sections = [
  {
    title: "1. Eligibility",
    items: [
      "You must be at least 18 years old, or 21 where required by law",
      "You must reside in a jurisdiction where access to the platform is permitted",
      "You agree to provide accurate and truthful information",
    ],
  },
  {
    title: "2. Nature of the Services (IMPORTANT)",
    body: "Monaco Gameroom operates a promotional sweepstakes platform for entertainment purposes only. The platform uses a dual-currency system:",
    items: [
      "Gold Coins are used for gameplay only and have no monetary value",
      "Sweeps Coins are promotional entries that may be redeemed for prizes, subject to rules",
    ],
    subheading: "Key Rules:",
    subitems: [
      "No purchase is necessary to participate or win",
      "Purchasing Gold Coins does not increase chances of winning",
      "Sweeps Coins are provided through promotional methods",
    ],
  },
  {
    title: "3. User Accounts",
    items: [
      "You are responsible for maintaining the confidentiality of your account",
      "You agree not to share or transfer your account",
      "We may suspend or terminate accounts for violations of these Terms",
    ],
  },
  {
    title: "4. Purchases & Virtual Currency",
    items: [
      "Gold Coins are digital, non-redeemable items used for entertainment",
      "All purchases are final and non-refundable, except where required by law",
      "Gold Coins cannot be exchanged for cash or real-world value",
    ],
  },
  {
    title: "5. Sweepstakes & Prizes",
    body: "Sweeps Coins may be used to participate in promotional sweepstakes. Prize redemption is subject to:",
    items: [
      "Identity verification (KYC)",
      "Compliance checks",
      "Minimum thresholds",
    ],
    subheading: "We reserve the right to:",
    subitems: [
      "Verify user eligibility",
      "Deny or delay redemption if suspicious activity is detected",
    ],
  },
  {
    title: "6. Prohibited Conduct",
    body: "Users may not:",
    items: [
      "Create multiple accounts to gain unfair advantage",
      "Use bots, scripts, or automation",
      "Attempt fraud, chargebacks, or abuse of the system",
      "Misrepresent identity or location",
      "Access the platform from restricted jurisdictions",
    ],
  },
  {
    title: "7. Verification & Compliance",
    body: "We may require users to:",
    items: [
      "Provide identification documents",
      "Verify location",
      "Undergo fraud and compliance checks",
    ],
    subheading: "Failure to comply may result in:",
    subitems: [
      "Account suspension",
      "Denial of withdrawals",
      "Account termination",
    ],
  },
  {
    title: "8. Payments & Transactions",
    items: [
      "Payments are processed through third-party providers",
      "We are not responsible for errors caused by payment providers",
      "Chargebacks may result in account suspension",
    ],
  },
  {
    title: "9. Geographic Restrictions",
    body: "Our services are only available in permitted jurisdictions. We use IP monitoring and geolocation tools to restrict access where required.",
  },
  {
    title: "10. Intellectual Property",
    body: "All content on the platform is owned by the Company. You may not:",
    items: [
      "Copy, reproduce, or distribute content",
      "Reverse engineer or exploit the platform",
    ],
  },
  {
    title: "11. Third-Party Services",
    body: "We may integrate with third-party services, including payments and verification. We are not responsible for their services or their policies.",
  },
  {
    title: "12. Disclaimer of Warranties",
    body: "The platform is provided as is and as available. We do not guarantee:",
    items: ["Continuous availability", "Error-free operation"],
  },
  {
    title: "13. Limitation of Liability",
    body: "To the maximum extent permitted by law, we are not liable for:",
    items: ["Indirect or incidental damages", "Loss of data or profits"],
  },
  {
    title: "14. Account Suspension & Termination",
    body: "We reserve the right to suspend or terminate accounts, void transactions, or restrict access if we detect:",
    items: ["Fraud", "Abuse", "Violations of Terms"],
  },
  {
    title: "15. Responsible Use",
    body: "Our platform is for entertainment. We encourage users to play responsibly and set limits.",
  },
  {
    title: "16. Changes to Terms",
    body: "We may update these Terms at any time. Continued use of the platform means acceptance of changes.",
  },
  {
    title: "17. Governing Law",
    body: "These Terms are governed by the laws of the State of Georgia, United States.",
  },
];

export default function TermsOfServicePage() {
  return (
    <main className="max-w-4xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>

      <div className="mb-8 space-y-2 text-foreground/90">
        <p>Effective Date: 15-02-2026</p>
        <p>Last Updated: 01-04-2026</p>
      </div>

      <p className="mb-8 text-foreground/90">
        These Terms of Service (&quot;Terms&quot;) govern your access to and use
        of the website and services provided by Monaco Gameroom, operated by
        Earthwalk Holdings LLC (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;,
        or &quot;us&quot;). By accessing or using our platform, you agree to be
        bound by these Terms.
      </p>

      {sections.map((section) => (
        <section key={section.title} className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">{section.title}</h2>
          {section.body ? (
            <p className="mb-3 text-foreground/90">{section.body}</p>
          ) : null}
          {section.items ? (
            <ul className="mb-3 list-disc space-y-2 pl-6 text-foreground/90">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {section.subheading ? (
            <p className="mb-3 font-semibold text-foreground/90">
              {section.subheading}
            </p>
          ) : null}
          {section.subitems ? (
            <ul className="mb-3 list-disc space-y-2 pl-6 text-foreground/90">
              {section.subitems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">
          18. Contact Information
        </h2>
        <p className="mb-3 text-foreground/90">For questions or support:</p>
        <div className="space-y-2 text-foreground/90">
          <p>
            Email:{" "}
            <a
              href="mailto:support@monacogameroom.com"
              className="text-primary hover:underline"
            >
              support@monacogameroom.com
            </a>
          </p>
          <p>
            Website:{" "}
            <a
              href="https://monacogameroom.com"
              className="text-primary hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              https://monacogameroom.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
