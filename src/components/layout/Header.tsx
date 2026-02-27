import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-navy shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="font-heading text-xl font-bold text-offWhite">
          iRemedy<span className="text-gold">AI</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/dashboard" className="text-offWhite/80 transition-colors hover:text-gold">
            Dashboard
          </Link>
          <Link to="/symptoms" className="text-offWhite/80 transition-colors hover:text-gold">
            Symptoms
          </Link>
          <Link to="/appointments" className="text-offWhite/80 transition-colors hover:text-gold">
            Appointments
          </Link>
          <Link to="/profile" className="text-offWhite/80 transition-colors hover:text-gold">
            Profile
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
