"use client";

import React, { useState } from "react";
import { MoreVertical, ArrowUpRight, CheckCircle2, Clock, Calendar, DollarSign, FileText, ArrowRight } from "lucide-react";

interface RequestItem {
  id: string;
  title: string;
  category: string;
  date: string;
  amountOrDuration: string;
  status: "Approved" | "Pending" | "In Review";
  iconType: "leave" | "expense" | "overtime" | "document";
}

const REQUESTS_DATA: RequestItem[] = [
  {
    id: "req-1",
    title: "Annual Vacation Leave",
    category: "Paid Time Off",
    date: "12 Jul - 16 Jul 2025",
    amountOrDuration: "5 Days",
    status: "Approved",
    iconType: "leave",
  },
  {
    id: "req-2",
    title: "Tech Equipment Allowance",
    category: "Hardware Reimbursement",
    date: "04 Jul 2025",
    amountOrDuration: "$420.00",
    status: "Approved",
    iconType: "expense",
  },
  {
    id: "req-3",
    title: "Client Meeting Business Travel",
    category: "Travel & Hospitality",
    date: "28 Jun 2025",
    amountOrDuration: "$680.00",
    status: "Pending",
    iconType: "expense",
  },
  {
    id: "req-4",
    title: "Sprint Overtime Claim",
    category: "Project Deliverable",
    date: "23 Jun 2025",
    amountOrDuration: "03h:30m",
    status: "Approved",
    iconType: "overtime",
  },
];

export const RecentRequestsCard: React.FC = () => {
  const [filter, setFilter] = useState<"All" | "Approved" | "Pending">("All");

  const filteredRequests = REQUESTS_DATA.filter((item) => {
    if (filter === "All") return true;
    return item.status === filter;
  });

  const renderIcon = (type: RequestItem["iconType"]) => {
    switch (type) {
      case "leave":
        return <Calendar size={16} className="text-[#1C1C1C]" />;
      case "expense":
        return <DollarSign size={16} className="text-[#1C1C1C]" />;
      case "overtime":
        return <Clock size={16} className="text-[#1C1C1C]" />;
      default:
        return <FileText size={16} className="text-[#1C1C1C]" />;
    }
  };

  return (
    <div className="w-full bg-white rounded-xl p-4 shadow-figma-md border border-gray-200 flex flex-col justify-between overflow-hidden transition-all">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="font-sans text-[20px] text-[#1C1C1C] font-semibold leading-none">
            Recent Requests
          </h3>
          <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-[#1C1C1C]">
            {REQUESTS_DATA.length} Total
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Filter Tabs */}
          <div className="flex items-center bg-[#FAFAFA] p-0.5 rounded-lg border border-gray-200">
            {(["All", "Approved", "Pending"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 text-[12px] font-medium rounded-md transition-all cursor-pointer ${
                  filter === tab
                    ? "bg-white text-[#1C1C1C] shadow-xs font-semibold"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button className="p-1 text-gray-400 hover:text-[#1C1C1C] transition-colors cursor-pointer" title="Options">
            <MoreVertical size={16} />
          </button>

          <button className="p-1 text-gray-400 hover:text-[#1C1C1C] transition-colors cursor-pointer" title="Expand">
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Requests List (4 Columns Across Full 9-Col Span) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 my-3">
        {filteredRequests.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] hover:bg-gray-100/80 border border-gray-100/80 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white shadow-xs border border-gray-200/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {renderIcon(item.iconType)}
              </div>
              <div className="min-w-0">
                <h4 className="font-sans text-[13.5px] font-semibold text-[#1C1C1C] truncate leading-snug">
                  {item.title}
                </h4>
                <p className="font-sans text-[11.5px] text-gray-500 truncate">
                  {item.date} &bull; {item.category}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 ml-2">
              <span className="font-sans text-[13.5px] font-bold text-[#1C1C1C]">
                {item.amountOrDuration}
              </span>
              <span
                className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                  item.status === "Approved"
                    ? "bg-[#1C1C1C] text-white"
                    : "bg-[#F4D014] text-[#1C1C1C]"
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[12px] text-gray-500 font-sans">
        <span>Need a new request? Use the top navigation or ask NetroAI.</span>
        <div className="flex items-center gap-1 font-semibold text-[#1C1C1C] hover:underline cursor-pointer">
          <span>View All History</span>
          <ArrowRight size={13} />
        </div>
      </div>
    </div>
  );
};
