"use client";

// Submit button that asks before running a destructive form action.
export function ConfirmButton({ children, message, className = "btn-ghost btn-danger btn-sm" }: { children: React.ReactNode; message: string; className?: string }) {
  return (
    <button type="submit" className={className} onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
