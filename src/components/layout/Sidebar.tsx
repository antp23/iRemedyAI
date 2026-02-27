const Sidebar = () => {
  return (
    <aside className="hidden w-64 border-r border-navy/10 bg-offWhite p-4 lg:block">
      <nav className="flex flex-col gap-2">
        <p className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-navy/50">
          Navigation
        </p>
      </nav>
    </aside>
  );
};

export default Sidebar;
