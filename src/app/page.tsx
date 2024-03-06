/**
 * v0 by Vercel.
 * @see https://v0.dev/t/PmwTvNfrVgf
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Bot from "@/components/bot/Bot";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <MountainIcon className="h-6 w-6" />
          <span className="">The Clinic Bot</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="/sign-in"
          >
            Sign In
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section id="features" className="w-full py-12 md:py-14 lg:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-neutral-100 px-3 py-1 text-sm dark:bg-neutral-800">
                  The clinic bot
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Book your appointment with ease
                </h2>
                <p className="max-w-[900px] text-neutral-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-neutral-400">
                  The Clinic Bot is a simple, voice based, easy to use, and secure way to
                  book your appointments with your doctor. It is designed to
                  provide a seamless experience for both patients and doctors.
                </p>

                <div>
                  <p>
                    You may also use 
                    <a href="tel:+1 213-224-2851" className="inline-block mx-1">
                      <p className="inline-block rounded-lg bg-neutral-100 px-3 py-1 text-sm dark:bg-neutral-800">
                        +1 213-224-2851
                      </p>
                    </a>
                    to talk with the bot.
                  </p>
                </div>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12">
              <div className="flex justify-center items-center space-y-4">
                {/* <Button
                  className="w-full md:max-w-max"
                  // variant="primary"
                  size="lg"
                  >
                    Start Call Now
                  </Button> */}
                  <Bot />
              </div>
            </div>
          </div>
        </section>

      </main>
      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
          © 2024. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function MountainIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}
