"use client";

import React, { useState, useEffect } from "react";

export const ProfileCard: React.FC = () => {
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [time, setTime] = useState({ hours: "05", minutes: "23", seconds: "01" });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime({
        hours: String(now.getHours()).padStart(2, "0"),
        minutes: String(now.getMinutes()).padStart(2, "0"),
        seconds: String(now.getSeconds()).padStart(2, "0"),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-gradient-to-b from-[#FAF0AD] via-[#FAF6CE] to-white rounded-xl p-4 flex flex-col justify-between shadow-figma-md relative border border-gray-200 h-full">
      {/* Top Header Row */}
      <div className="w-full">
        <h2 className="font-sans text-[22px] text-[#1C1C1C] font-semibold leading-tight">
          Hi, Abdullah
        </h2>
      </div>

      {/* Middle Center Image Illustration (i1.png) */}
      <div className="flex-1 my-2 flex items-center justify-center min-h-[160px] overflow-hidden">
        <img
          src="/i1.png"
          alt="Profile Gear Illustration"
          className="max-h-[230px] sm:max-h-[260px] w-auto object-contain drop-shadow-xl animate-[spin_45s_linear_infinite]"
        />
      </div>

      {/* Bottom Date & Enlarged Plain Numbers Clock Section */}
      <div className="flex flex-col items-center gap-1 my-0 -mt-3 sm:-mt-5">
        {/* Make Analysis Easy - Moved up further */}
        <div className="w-full text-left pl-1">
          <h3 className="font-sans text-[30px] sm:text-[36px] font-extrabold text-[#1C1C1C] leading-[1.08] tracking-tight">
            Make<br />Analysis Easy
          </h3>
        </div>

        {/* Digital Clock Display */}
        <div className="flex items-center justify-center gap-1.5 my-2.5 font-sans font-normal text-[54px] text-[#1C1C1C] leading-none tracking-tight transform scale-y-[1.18] select-none">
          <span className="tabular-nums">{time.hours}</span>
          <span className="text-[#1C1C1C]/60 pb-1 animate-pulse">:</span>
          <span className="tabular-nums">{time.minutes}</span>
          <span className="text-[#1C1C1C]/60 pb-1 animate-pulse">:</span>
          <span className="tabular-nums">{time.seconds}</span>
        </div>
      </div>

      {/* Start Analysis CTA Button - Clean Text Only */}
      <div className="w-full pt-1">
        <button
          type="button"
          className="w-full bg-[#F4D014] hover:bg-[#e5c30f] active:scale-[0.99] text-[#1C1C1C] font-sans font-semibold text-[17px] py-2.5 rounded-lg flex items-center justify-center transition-all shadow-sm cursor-pointer"
        >
          Start Analysis
        </button>
      </div>
    </div>
  );
};
