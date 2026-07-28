import Image from "next/image";

export function SiteHeader() {
  return (
    <header className="relative z-20 flex items-center px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 md:px-10 md:py-5">
      <a
        href="/"
        className="inline-flex min-h-11 cursor-pointer items-center"
        aria-label="Stasus home"
      >
        <Image
          src="/brand/logo-lockup-dark.png"
          alt="Stasus"
          width={320}
          height={96}
          priority
          className="h-10 w-auto sm:h-12 md:h-14"
        />
      </a>
    </header>
  );
}
