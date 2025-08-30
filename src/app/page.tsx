"use client";
import CopilotChatWindow from "@/components/CopilotChatWindow/page";
import React, { useState } from "react";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import ThreadBox from "@/components/Threads/page";
import { Menu } from "lucide-react"; // hamburger icon

const Home = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Provider store={store}>
      <div className="flex flex-row h-screen relative">
        {/* Hamburger button (only visible on small screens) */}
        <button
          className="absolute top-4 left-4 z-50 md:hidden rounded-md bg-gray-200 shadow"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu />
        </button>

        {/* Sidebar */}
        <div
          className={`fixed md:static top-0 left-0 h-screen w-64 bg-gray-100 border-r overflow-y-auto transform transition-transform duration-300 z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0`}
        >
          <ThreadBox />
        </div>

        {/* Main chat window */}
        <div className="flex-1 md:px-8 px-3   md:ml-0 ml-0">
          <CopilotChatWindow />
        </div>
      </div>
    </Provider>
  );
};

export default Home;
