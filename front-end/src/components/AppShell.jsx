import { useEffect, useState } from "react";
import Header from "./Header";
import SideBar from "./SideBar";
import "./AppShell.css";

export default function AppShell({
  title,
  buttonText,
  onButtonClick,
  children,
  contentClassName = "",
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isSidebarOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen]);

  return (
    <div className="app-shell">
      <SideBar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {isSidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="app-shell-panel">
        <Header
          title={title}
          buttonText={buttonText}
          onButtonClick={onButtonClick}
          isMenuOpen={isSidebarOpen}
          onMenuToggle={() => setIsSidebarOpen((current) => !current)}
        />

        <main className={`app-shell-main ${contentClassName}`.trim()}>
          {children}
        </main>
      </div>
    </div>
  );
}
