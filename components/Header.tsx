"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Search,
  Plus,
  Grid,
  Share2,
  Settings,
  Wallet,
} from "lucide-react";
import { useCrypto } from "@/context/CryptoContext";

interface HeaderProps {
  onOpenNewRequest: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewRequest }) => {
  const [activeNav, setActiveNav] = useState("Home");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);

  const { isWalletConnected, walletAddress, setIsWalletModalOpen } = useCrypto();

  const navItems = [
    { name: "Home", hasDropdown: false },
    { name: "Analytics", hasDropdown: false },
    { name: "Signals", hasDropdown: false },
    { name: "Portfolio", hasDropdown: false },
  ];

  return (
    <header className="w-full bg-[#E5E7EB] px-6 py-3 flex items-center justify-between gap-3 shrink-0">
      {/* Left: Logo & Brand Name */}
      <div className="flex-1 flex items-center justify-start">
        <div className="flex items-center gap-3 cursor-pointer shrink-0">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-auto object-contain hover:opacity-90 transition-opacity"
          />
          <span className="text-[30px] font-bold text-[#1C1C1C] tracking-tight font-sans leading-none flex items-center">
            NetroBNB
          </span>
        </div>
      </div>

      {/* Center: Main Navigation Items */}
      <nav className="flex items-center justify-center gap-1.5 py-0.5 shrink-0">
        {navItems.map((item) => {
          const isActive = activeNav === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveNav(item.name)}
              className={`flex items-center gap-1 px-3.5 py-1 rounded-lg font-sans text-[16px] transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#F4D014] text-[#1C1C1C] font-semibold shadow-sm"
                  : "text-[#333333] hover:bg-gray-200/70"
              }`}
            >
              <span>{item.name}</span>
            </button>
          );
        })}

        {/* Search Input / Icon */}
        <div className="relative flex items-center ml-1">
          {showSearchInput ? (
            <div className="flex items-center bg-white/80 rounded-lg px-2.5 py-0.5 animate-fadeIn border border-gray-200">
              <Search size={15} className="text-gray-500 mr-1" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none font-sans text-sm w-28 focus:w-40 transition-all text-[#1C1C1C]"
                autoFocus
                onBlur={() => !searchQuery && setShowSearchInput(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowSearchInput(true)}
              className="p-1.5 rounded-lg text-gray-800 hover:bg-gray-200/70 transition-colors cursor-pointer"
              title="Search"
            >
              <Search size={18} />
            </button>
          )}
        </div>
      </nav>

      {/* Right: CTA Button, Action Icons & Connect Button */}
      <div className="flex-1 flex items-center justify-end gap-2.5 shrink-0">
        <button
          onClick={onOpenNewRequest}
          className="h-9 flex items-center gap-1.5 px-3.5 rounded-lg bg-[#F4D014] hover:bg-[#e5c30f] active:scale-95 text-[#1C1C1C] font-sans font-semibold text-[15px] transition-all shadow-sm cursor-pointer"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>New Run</span>
        </button>

        <button
          className="p-1.5 rounded-lg text-gray-800 hover:bg-gray-200/60 transition-colors cursor-pointer"
          title="Grid View"
        >
          <Grid size={20} />
        </button>

        <button
          className="p-1.5 rounded-lg text-gray-800 hover:bg-gray-200/60 transition-colors cursor-pointer"
          title="Share"
        >
          <Share2 size={20} />
        </button>

        <button
          className="p-1.5 rounded-lg text-gray-800 hover:bg-gray-200/60 transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings size={20} />
        </button>

        {/* Connect Wallet Button */}
        <button
          onClick={() => setIsWalletModalOpen(true)}
          className={`h-9 flex items-center justify-center gap-1.5 px-3.5 rounded-lg active:scale-95 transition-all shadow-sm cursor-pointer bg-[#1C1C1C] hover:bg-black text-white font-sans ${
            isWalletConnected
              ? "text-[14px] font-semibold"
              : "text-[15px] font-semibold"
          }`}
        >
          {isWalletConnected ? (
            <span>{walletAddress}</span>
          ) : (
            <>
              <Wallet size={15} />
              <span>Connect</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
