import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="container flex flex-col items-center justify-center px-5 mx-auto">
        <div className="max-w-md text-center">
          <h2 className="mb-8 font-extrabold text-9xl text-gray-600 dark:text-gray-400">
            <span className="sr-only">Error</span>4🫥4
          </h2>
          <p className="text-2xl font-semibold md:text-4xl">
            Well, this is awkward...
          </p>
          <p className="mt-4 mb-8 text-gray-500 dark:text-gray-400">
            Don&apos;t panic. It&apos;s all good. You haven&apos;t broken the internet. The
            homepage still works, it&apos;s cool!
          </p>

          <Button label="Back to homepage" href="/" />
        </div>
      </div>
    </section>
  );
}
