interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="pt-navbar min-h-screen">
      {children}
    </div>
  );
} 