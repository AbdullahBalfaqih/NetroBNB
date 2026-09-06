"use client";

import React, { useState } from "react";
import { MoreVertical, ArrowUpRight } from "lucide-react";

export const PayslipCard: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState("Aug");

  const months = [
    { name: "Jan", bg: "bg-[#F4D014]", text: "text-[#1C1C1C]" },
    { name: "Feb", bg: "bg-[#F4D014]", text: "text-[#1C1C1C]" },
    { name: "Mar", bg: "bg-[#F4D014]", text: "text-[#1C1C1C]" },
    { name: "Apr", bg: "bg-[#F4D014]", text: "text-[#1C1C1C]" },
    { name: "May", bg: "bg-[#F4D014]", text: "text-[#1C1C1C]" },
    { name: "Jun", bg: "bg-[#F4D014]", text: "text-[#1C1C1C]" },
    { name: "Jul", bg: "bg-[#F4D014]", text: "text-[#1C1C1C]" },
    { name: "Aug", bg: "bg-[#F4D014]", text: "text-[#1C1C1C]" },
    { name: "Sep", bg: "bg-[#FAF0AD]", text: "text-[#1C1C1C]" },
    { name: "Oct", bg: "bg-[#EEEEEE]", text: "text-[#555555]" },
    { name: "Nov", bg: "bg-[#F5F5F5]", text: "text-[#777777]" },
    { name: "Dec", bg: "bg-[#F5F5F5]", text: "text-[#777777]" },
  ];

  return (
    <div className="w-full h-full bg-white rounded-xl p-4 shadow-figma-md border border-gray-200 flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-sans text-[20px] text-[#1C1C1C] font-semibold leading-none">
          Signal Health
        </h3>
        <div className="flex items-center gap-1">
          <button className="p-1 text-gray-400 hover:text-[#1C1C1C] transition-colors cursor-pointer" title="Options">
            <MoreVertical size={16} />
          </button>
          <button className="p-1 text-gray-400 hover:text-[#1C1C1C] transition-colors cursor-pointer" title="Expand">
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area: 4x3 Months Grid + 3D Image */}
      <div className="flex items-center justify-between gap-3 my-2 flex-1">
        {/* Classic 4-Column x 3-Row Grid (Jan - Dec) */}
        <div className="flex-1 grid grid-cols-4 gap-1.5">
          {months.map((m) => {
            const isSelected = selectedMonth === m.name;
            return (
              <button
                key={m.name}
                onClick={() => setSelectedMonth(m.name)}
                className={`w-full py-2 rounded-md font-sans text-[13px] text-center transition-all active:scale-95 cursor-pointer ${m.bg} ${m.text} ${
                  isSelected
                    ? "font-bold text-black shadow-sm ring-1 ring-black/10"
                    : "font-medium"
                }`}
              >
                {m.name}
              </button>
            );
          })}
        </div>

        {/* Right Side: 3D Image Graphic Scaled to Match Exact Height and Alignment */}
        <div className="flex items-center justify-end shrink-0 w-[140px] h-[130px]">
          <img
            src="/i5.png"
            alt="Signal Health 3D Graphic"
            className="h-full w-auto max-w-full object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Bottom Legend Row */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100 w-full shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#F4D014] shrink-0"></span>
          <span className="font-sans text-[12px] text-[#1C1C1C] font-medium">Accumulation</span>
        </div>

        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#FAF0AD] shrink-0"></span>
          <span className="font-sans text-[12px] text-[#1C1C1C] font-medium">Neutral</span>
        </div>

        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#EEEEEE] border border-gray-200 shrink-0"></span>
          <span className="font-sans text-[12px] text-[#1C1C1C] font-medium">Cycle Forecast</span>
        </div>
      </div>
    </div>
  );
};
