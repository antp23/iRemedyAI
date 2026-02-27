const Footer = () => {
  return (
    <footer className="border-t border-navy/10 bg-navy py-8 text-offWhite/60">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <p className="font-heading text-lg font-semibold text-offWhite">
          iRemedy<span className="text-gold">AI</span>
        </p>
        <p className="mt-2 text-sm">
          &copy; {new Date().getFullYear()} iRemedy AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
