const sections = [
  {
    title: "1. Entertainment-Only Platform",
    body: "Monaco Gameroom is designed for entertainment purposes only.",
    items: [
      "Gold Coins have no monetary value",
      "Sweeps Coins are provided through promotional methods",
      "No purchase is required to participate",
    ],
    closing:
      "We encourage users to treat gameplay as a form of entertainment, not as a source of income.",
  },
  {
    title: "2. Play Responsibly",
    body: "To maintain a healthy experience, we recommend:",
    items: [
      "Set personal time and spending limits",
      "Take regular breaks while playing",
      "Avoid chasing outcomes or losses",
      "Play only with funds you are comfortable using for entertainment",
      "Balance gameplay with other activities",
    ],
    closing:
      "If the experience stops being enjoyable, we encourage you to step away.",
  },
  {
    title: "3. Know Your Limits",
    body: "Users are responsible for managing their own activity on the platform. You should:",
    items: [
      "Monitor your time spent on the platform",
      "Avoid excessive or compulsive use",
      "Stay aware of your gameplay behavior",
    ],
  },
  {
    title: "4. Account Controls",
    body: "We may provide tools to help manage your activity, including:",
    items: [
      "Temporary account restrictions",
      "Account suspension upon request",
      "Limits on gameplay or transactions",
    ],
    closing:
      "You may contact support at any time to request restrictions on your account.",
  },
  {
    title: "5. Self-Exclusion",
    body: "If you feel you need a break, you may request self-exclusion. During self-exclusion:",
    items: [
      "Your account will be temporarily disabled",
      "You will not be able to access gameplay features",
      "The restriction cannot be reversed until the selected period ends",
    ],
    closing: "To request self-exclusion, contact support@monacogameroom.com.",
  },
  {
    title: "6. Behavior Monitoring",
    body: "To maintain a safe platform, we monitor activity for:",
    items: [
      "Excessive usage patterns",
      "Suspicious or abnormal behavior",
      "Potential misuse of the platform",
    ],
    closing:
      "We reserve the right to restrict accounts, request additional verification, or suspend access if necessary.",
  },
  {
    title: "7. Support Resources",
    body: "If you believe your activity is becoming difficult to manage, we encourage seeking help from professional organizations:",
    items: [
      "National Council on Problem Gambling (NCPG): https://www.ncpgambling.org",
      "Gamblers Anonymous: https://www.gamblersanonymous.org",
    ],
    closing: "These organizations provide support, education, and guidance.",
  },
  {
    title: "8. Third-Party Tools",
    body: "Users may also use external tools to control access, including:",
    items: [
      "Website blockers",
      "Screen time limits",
      "Device-level restrictions",
    ],
    closing:
      "We are not responsible for third-party tools but encourage their use where helpful.",
  },
  {
    title: "9. Age Restrictions",
    body: "Our platform is strictly for users 18+ or 21+ where required. We do not knowingly allow minors to access our services.",
    items: ["If a minor is identified, the account will be immediately closed"],
  },
  {
    title: "10. Parental Controls",
    body: "We encourage parents and guardians to:",
    items: [
      "Monitor device usage",
      "Use parental control tools",
      "Restrict access where necessary",
    ],
  },
];

export default function ResponsiblePlayPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-4">Responsible Play Policy</h1>
      <p className="text-lg font-semibold mb-6">Monaco Gameroom</p>

      <p className="mb-8 text-foreground/90">
        Monaco Gameroom is committed to providing a safe, enjoyable, and
        responsible entertainment experience for all users. While our platform
        operates as a promotional sweepstakes and social gaming environment, we
        encourage all users to engage responsibly and maintain control over
        their activity.
      </p>

      {sections.map((section) => (
        <section key={section.title} className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">{section.title}</h2>
          <p className="mb-3 text-foreground/90">{section.body}</p>
          <ul className="mb-3 list-disc space-y-2 pl-6 text-foreground/90">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {section.closing ? (
            <p className="text-foreground/90">{section.closing}</p>
          ) : null}
        </section>
      ))}

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">11. Contact Us</h2>
        <p className="mb-3 text-foreground/90">
          If you need assistance or wish to apply account restrictions:
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
