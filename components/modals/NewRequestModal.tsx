"use client";

import React, { useState } from "react";
import { X, Send, Calendar, DollarSign, Clock, FileText } from "lucide-react";

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [requestType, setRequestType] = useState("Leave Request");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[26px] p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-gray-100 relative animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="font-kalam text-[32px] text-[#1C1C1C] leading-none">
            + Add New Request
          </h2>
          <p className="font-patrick text-[17px] text-[#777777] mt-1">
            Submit your leave, expense, or attendance request directly to HR.
          </p>
        </div>

        {isSubmitted ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 animate-bounce">
              <Send size={28} />
            </div>
            <h3 className="font-kalam text-[26px] text-[#1C1C1C]">
              Request Submitted Successfully!
            </h3>
            <p className="font-patrick text-[17px] text-gray-500 mt-1">
              Your request is under review by HR.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Request Type Selector */}
            <div>
              <label className="block font-patrick text-[18px] text-[#1C1C1C] mb-1.5">
                Request Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Leave Request",
                  "Expense Claim",
                  "Attendance Fix",
                  "Overtime Request",
                ].map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setRequestType(type)}
                    className={`py-2 px-3 rounded-[16px] font-patrick text-[16px] border transition-all text-left ${
                      requestType === type
                        ? "bg-[#F5F03C] border-[#F5F03C] text-[#1C1C1C] font-bold shadow-sm"
                        : "bg-[#FAFAFA] border-gray-100 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-patrick text-[17px] text-[#1C1C1C] mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-[16px] px-3.5 py-2 font-patrick text-[16px] outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-patrick text-[17px] text-[#1C1C1C] mb-1">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-[16px] px-3.5 py-2 font-patrick text-[16px] outline-none focus:border-yellow-400"
                  />
                </div>
              </div>
            </div>

            {/* Amount (if expense) */}
            {requestType === "Expense Claim" && (
              <div>
                <label className="block font-patrick text-[17px] text-[#1C1C1C] mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-[16px] px-3.5 py-2 font-patrick text-[16px] outline-none focus:border-yellow-400"
                />
              </div>
            )}

            {/* Notes / Reason */}
            <div>
              <label className="block font-patrick text-[17px] text-[#1C1C1C] mb-1">
                Reason / Details
              </label>
              <textarea
                rows={3}
                required
                placeholder="Provide details about your request..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-gray-200 rounded-[16px] p-3 font-patrick text-[16px] outline-none focus:border-yellow-400 resize-none"
              />
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full font-patrick text-[18px] text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-7 py-2.5 rounded-full bg-[#F5F03C] hover:bg-[#e8e332] active:scale-95 text-[#1C1C1C] font-kalam font-bold text-[20px] transition-all shadow-sm"
              >
                Submit Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
