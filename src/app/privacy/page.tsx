const sections = [
  {
    title: "1. Information We Collect",
    body: "We may collect the following categories of information:",
    groups: [
      {
        heading: "a. Personal Information",
        items: [
          "Full name",
          "Email address",
          "Phone number",
          "Date of birth for age verification",
          "Billing and payment information",
        ],
      },
      {
        heading: "b. Identity Verification Information",
        items: [
          "Government-issued identification",
          "Proof of address",
          "Selfie or biometric verification, if required",
        ],
      },
      {
        heading: "c. Technical & Usage Data",
        items: [
          "IP address",
          "Device information",
          "Browser type",
          "Location data",
          "Website usage activity",
        ],
      },
      {
        heading: "d. Transaction Information",
        items: [
          "Purchase history",
          "Game activity",
          "Deposits and withdrawals",
        ],
      },
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: "We use your information to:",
    items: [
      "Provide and operate our services",
      "Process transactions and payments",
      "Verify identity and prevent fraud",
      "Monitor platform activity and enforce rules",
      "Communicate with users",
      "Improve user experience",
      "Comply with legal and regulatory obligations",
    ],
  },
  {
    title: "3. Sweepstakes Model Compliance",
    body: "Monaco Gameroom operates under a promotional sweepstakes model:",
    items: [
      "No purchase is necessary to participate",
      "Purchasing Gold Coins does not increase chances of winning",
      "Sweeps Coins are provided through promotional methods",
    ],
    closing:
      "Your data may be used to ensure compliance with these rules and to prevent abuse of the system.",
  },
  {
    title: "4. How We Share Your Information",
    body: "We may share your information with:",
    items: [
      "Payment processors, including Coinflow",
      "Identity verification providers, including KYC services",
      "Fraud detection and compliance partners",
      "Legal authorities when required by law",
    ],
    closing: "We do not sell your personal data.",
  },
  {
    title: "5. Cookies & Tracking Technologies",
    body: "We use cookies and similar technologies to:",
    items: [
      "Analyze website traffic",
      "Improve performance",
      "Personalize user experience",
    ],
    closing: "You can disable cookies through your browser settings.",
  },
  {
    title: "6. Data Security",
    body: "We implement appropriate security measures to protect your information, including:",
    items: ["Encryption", "Secure servers", "Access controls"],
    closing: "However, no system is 100% secure.",
  },
  {
    title: "7. User Rights",
    body: "Depending on your location, you may have rights to:",
    items: [
      "Access your data",
      "Request correction",
      "Request deletion",
      "Opt out of communications",
    ],
    closing:
      "To exercise these rights, contact us at support@monacogameroom.com.",
  },
  {
    title: "8. Data Retention",
    body: "We retain your information as long as necessary to:",
    items: [
      "Provide services",
      "Comply with legal obligations",
      "Resolve disputes",
    ],
  },
  {
    title: "9. Age Restrictions",
    body: "Our platform is intended for users 18+ or 21+ where required. We do not knowingly collect data from minors.",
  },
  {
    title: "10. Geographic Restrictions",
    body: "Our services are available only in permitted jurisdictions. We use geolocation tools to restrict access where required.",
  },
  {
    title: "11. Third-Party Links",
    body: "Our website may contain links to third-party services. We are not responsible for their privacy practices.",
  },
  {
    title: "12. Changes to This Policy",
    body: "We may update this Privacy Policy at any time. Updates will be posted on this page.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>

      <div className="mb-8 space-y-2 text-foreground/90">
        <p>Effective Date: 15-02-2026</p>
        <p>Last Updated: 1-04-2026</p>
      </div>

      <p className="mb-8 text-foreground/90">
        Monaco Gameroom, operated by Earthwalk Holdings LLC, respects your
        privacy and is committed to protecting your personal information. This
        Privacy Policy explains how we collect, use, disclose, and safeguard
        your information when you access or use our website and services.
      </p>

      {sections.map((section) => (
        <section key={section.title} className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">{section.title}</h2>
          <p className="mb-3 text-foreground/90">{section.body}</p>

          {section.groups?.map((group) => (
            <div key={group.heading} className="mb-5">
              <h3 className="mb-2 font-semibold text-foreground/90">
                {group.heading}
              </h3>
              <ul className="list-disc space-y-2 pl-6 text-foreground/90">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          {section.items ? (
            <ul className="mb-3 list-disc space-y-2 pl-6 text-foreground/90">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}

          {section.closing ? (
            <p className="text-foreground/90">{section.closing}</p>
          ) : null}
        </section>
      ))}

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">13. Contact Us</h2>
        <p className="mb-3 text-foreground/90">
          If you have questions, contact us at:
        </p>
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
