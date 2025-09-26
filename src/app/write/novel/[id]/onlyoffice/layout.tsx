export default function OnlyOfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full">
      {children}
    </div>
  );
}
