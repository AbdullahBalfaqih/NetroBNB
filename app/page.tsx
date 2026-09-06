"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { AttendanceTodayCard } from "@/components/dashboard/AttendanceTodayCard";
import { PayslipCard } from "@/components/dashboard/PayslipCard";
import { LeaveLeftCard } from "@/components/dashboard/LeaveLeftCard";
import { AnalyticsCard } from "@/components/dashboard/AnalyticsCard";
import { ExpensesCard } from "@/components/dashboard/ExpensesCard";
import { CalendarCard } from "@/components/dashboard/CalendarCard";
import { AskCoreAICard } from "@/components/dashboard/AskCoreAICard";
import { CryptoMarketCard } from "@/components/dashboard/CryptoMarketCard";
import { NewRequestModal } from "@/components/modals/NewRequestModal";

import { motion } from "framer-motion";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#E5E7EB] flex flex-col font-sans antialiased selection:bg-yellow-200">
      {/* Seamless Integrated Header Bar */}
      <Header onOpenNewRequest={() => setIsModalOpen(true)} />

      {/* Main Dashboard Content Area (Seamless Unified Grey Canvas) */}
      <main className="flex-1 px-5 pb-5 pt-8 sm:pt-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-[1850px] mx-auto flex flex-col gap-3.5"
        >
          {/* Dashboard Section Title */}
          <motion.div variants={itemVariants} className="py-1 px-1">
            <h1 className="font-sans text-[28px] text-[#1C1C1C] font-semibold leading-none tracking-tight">
              Asset Intelligence Dashboard
            </h1>
          </motion.div>

          {/* Main Desktop Grid Layout: 9 Columns on Left & 3 Columns on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
            {/* Left 9-Column Block */}
            <div className="lg:col-span-9 flex flex-col gap-3.5">
              {/* Top Row: ProfileCard (3 cols) + Center Content Stack (6 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-9 gap-3.5 items-stretch">
                {/* Profile Card (3 of 9 cols) */}
                <motion.div variants={itemVariants} className="lg:col-span-3 flex flex-col">
                  <ProfileCard />
                </motion.div>

                {/* Center Content Stack (6 of 9 cols) */}
                <div className="lg:col-span-6 flex flex-col gap-3.5">
                  {/* Today's Attendance Card */}
                  <motion.div variants={itemVariants}>
                    <AttendanceTodayCard />
                  </motion.div>

                  {/* Row 2: Payslip & Leave Left */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <motion.div variants={itemVariants}>
                      <PayslipCard />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <LeaveLeftCard />
                    </motion.div>
                  </div>

                  {/* Row 3: Analytics & Expenses (Portfolio Insights) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <motion.div variants={itemVariants}>
                      <AnalyticsCard />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <ExpensesCard />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Bottom Card: Crypto Market & Stocks Card Extending to Left */}
              <motion.div variants={itemVariants}>
                <CryptoMarketCard />
              </motion.div>
            </div>

            {/* Column 3: Far Right Stack (3 cols on lg) */}
            <div className="lg:col-span-3 flex flex-col gap-3.5 h-full">
              {/* Calendar Widget Card */}
              <motion.div variants={itemVariants}>
                <CalendarCard />
              </motion.div>

              {/* Ask CoreAI Card (Chat) */}
              <motion.div variants={itemVariants} className="flex-1 flex flex-col min-h-0">
                <AskCoreAICard />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* New Request Modal */}
      <NewRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
