// import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Feed from "./components/Feed";
import RightPanel from "./components/RightPanel";

export default function App() {
  // const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 ">
      <Navbar />

      <div className="grid grid-cols-12 gap-4 px-8 py-6">
        <div className="col-span-2">
          <Sidebar />
        </div>

        <div className="col-span-7 ">
          <Feed />
        </div>

        <div className="col-span-3">
          <RightPanel />
        </div>
      </div>

      {/* <div open={open} setOpen={setOpen} >Sai Narendra</div> */}
    </div>
  );
}
