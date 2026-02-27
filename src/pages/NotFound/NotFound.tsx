import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-offWhite">
      <h1 className="font-heading text-6xl font-bold text-navy">404</h1>
      <p className="mt-4 text-lg text-navy/70">Page not found</p>
      <Link
        to="/"
        className="mt-8 rounded-lg bg-gold px-6 py-3 font-semibold text-navy transition-colors hover:bg-gold/90"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
