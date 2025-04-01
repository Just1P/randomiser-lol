
import "./globals.css";


export const metadata: Metadata = {
  title: "LOL Role Randomizer",
  description: "Randomly assign League of Legends roles to your team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        {children}
      </body>
    </html>
  );
}
