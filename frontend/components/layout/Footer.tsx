export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white transition-colors duration-200 dark:border-slate-700 dark:bg-slate-900 night:border-slate-800 night:bg-[#070b14]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-3 py-5 text-center text-xs text-slate-500 dark:text-slate-400 night:text-slate-500 sm:flex-row sm:px-6 sm:py-6 sm:text-left">
        <p>Universal Phone Number Generator · Format-valid numbers for 30 countries</p>
        <p>Files auto-delete after 72 hours</p>
      </div>
    </footer>
  );
}
