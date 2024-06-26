import { Inter } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.css";
import BootstrapClient from "../components/BootstrapClient";
import StoreProvider from "../redux/Provider";
// import { useSelector } from "react-redux";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Jaffna Vehicle Spot (PVT) LTD",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  // const loading = useSelector((state) => state.loader.loading);
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
        {/* {loading && <Loader />} */}
          {children}
          <BootstrapClient />
        </StoreProvider>
      </body>
    </html>
  );
}
