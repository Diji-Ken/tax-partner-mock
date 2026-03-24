export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ml-[-240px]">
      {children}
    </div>
  );
}
