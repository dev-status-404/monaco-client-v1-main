
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl items-center justify-center px-4 py-10 md:px-6">
        {children}
      </div>
    </div>
  );
}
