"use client"
import CommonButton from "./components/CommonButton";
import Contact from "./assets/icons/Headset.png";
import Navbar from "./layouts/Navbar";

export default function Home() {
  return (
    <main className="d-flex flex-column align-items-center w-100 justify-content-center min-vh-100">
      <h1 className="text-success">Heloo Project</h1>
      <CommonButton text={"Login"}  width={110}/>
      <Navbar/>
    </main>
  );
}
