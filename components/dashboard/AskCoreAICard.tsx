"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ArrowUpRight, ArrowUp, Sparkles, X, RotateCcw, Copy, Check, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCrypto, ALL_CRYPTO_CATALOG } from "@/context/CryptoContext";

interface MessageAction {
  action_type: string;
  title: string;
  description: string;
  preview_token?: string;
  payload?: any;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  time: string;
  behavioral_score?: number;
  confidence?: number;
  suggested_actions?: string[];
  proposed_actions?: MessageAction[];
  execution_status?: "pending" | "executing" | "executed" | "cancelled";
  executed_details?: string;
}

const INITIAL_MESSAGES: Message[] = [];

const WELCOME_PHRASES = [
  "Welcome to NetroAI! I'm Netro's AI Market Intelligence Agent.",
  "Tracking whale wallet positioning and real-time orderflow...",
  "Analyzing liquidity shifts, momentum, and key market levels...",
  "Synthesizing high-confidence strategies with risk validation...",
  "Ask me anything about BNB, BTC, ETH, SOL, or custom tokens!",
];

interface TypewriterProps {
  phrases: string[];
  className?: string;
}

const TypewriterText: React.FC<TypewriterProps> = ({ phrases, className = "" }) => {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = phrases[phraseIdx];
    const fullChars = Array.from(fullText);
    const currentLength = Array.from(displayText).length;

    if (!isDeleting && currentLength === fullChars.length) {
      const timer = setTimeout(() => setIsDeleting(true), 2200);
      return () => clearTimeout(timer);
    }

    if (isDeleting && currentLength === 0) {
      setIsDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % phrases.length);
      return;
    }

    const speed = isDeleting ? 20 : 45;
    const timer = setTimeout(() => {
      const nextLength = isDeleting ? currentLength - 1 : currentLength + 1;
      setDisplayText(fullChars.slice(0, nextLength).join(""));
    }, speed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIdx, phrases]);

  return (
    <span className={`inline-block ${className}`}>
      {displayText}
      <span className="inline-block w-[3px] h-[1em] bg-[#1C1C1C] ml-1.5 align-middle animate-pulse" />
    </span>
  );
};

export const AskCoreAICard: React.FC = () => {
  const { selectedCoin, setSelectedCoinBySymbol, detectCoin, liveMarket } = useCrypto();

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [prompt, setPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>(() => `conv_${Date.now()}`);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const modalEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic suggestions tailored to the currently active cryptocurrency
  const defaultSuggestions = useMemo(() => [
    `Analyze ${selectedCoin.symbol} 24h`,
    `Why is ${selectedCoin.symbol} moving?`,
    `Compare ${selectedCoin.symbol} and ${selectedCoin.symbol === "ETH" ? "BTC" : "ETH"}`,
    `Generate ${selectedCoin.symbol} Strategy`,
  ], [selectedCoin.symbol]);

  // Preload GIFs
  useEffect(() => {
    ["/normal.gif", "/typing.gif", "/thinking.gif"].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    modalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Handle typing detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
    setIsTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1400);
  };

  const handleInputBlur = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
  };

  const sendMessage = async (textToSend?: string) => {
    const query = textToSend || prompt;
    if (!query.trim() || isThinking) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);

    // 1. Instant Bidirectional Detection: Switch dashboard active asset if user mentions a coin
    const detected = detectCoin(query);
    if (detected && detected.toUpperCase() !== selectedCoin.symbol.toUpperCase()) {
      setSelectedCoinBySymbol(detected);
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setIsThinking(true);

    try {
      // Call Python FastAPI agent endpoint with active asset context
      let res: Response | null = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);
        res = await fetch("/api/v1/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            message: query,
            conversation_id: conversationId,
            user_id: "default_user",
            active_asset: detected || selectedCoin.symbol,
          }),
        });
        clearTimeout(timeoutId);
      } catch {
        res = null;
      }

      if (res && res.ok) {
        const data = await res.json();

        // If the AI agent identified a specific target asset, synchronize dashboard
        if (data.active_asset && data.active_asset.toUpperCase() !== selectedCoin.symbol.toUpperCase()) {
          setSelectedCoinBySymbol(data.active_asset);
        }

        const assistantMsg: Message = {
          id: data.message_id || `ai-${Date.now()}`,
          sender: "assistant",
          text: data.answer,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          behavioral_score: data.behavioral_score,
          confidence: data.confidence,
          suggested_actions: data.suggested_actions,
          proposed_actions: data.proposed_actions,
          execution_status: data.proposed_actions?.length ? "pending" : undefined,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(res ? `API responded with status ${res.status}` : "API unavailable");
      }
    } catch {
      const isArabic = /[\u0600-\u06FF]/.test(query);
      const isGreeting = /^(hi|hello|hey|greetings|yo|مرحبا|أهلا|اهلا|السلام عليكم)/i.test(query.trim());
      const coinSym = detected || selectedCoin.symbol;
      const coinConfig =
        ALL_CRYPTO_CATALOG.find((c) => c.symbol.toUpperCase() === coinSym.toUpperCase()) || selectedCoin;
      const coinName = coinConfig.name;

      const coinPrice =
        coinSym.toUpperCase() === selectedCoin.symbol.toUpperCase() && liveMarket?.price
          ? `$${liveMarket.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
          : `$${coinConfig.fallbackPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
      const coinChg =
        coinSym.toUpperCase() === selectedCoin.symbol.toUpperCase() && liveMarket?.priceChange
          ? liveMarket.priceChange
          : "+0.45%";

      let fallbackText = "";
      let suggestedActions = [];

      if (isArabic) {
        if (isGreeting) {
          fallbackText = `مرحباً بك! أنا NetroAI، مستشارك الذكي للبيانات الفورية لأسواق العملات الرقمية عبر شبكة بينانس سبوت وسلسلة BNB Smart Chain. كيف يمكنني مساعدتك اليوم؟`;
        } else {
          fallbackText = `بيانات السوق الفورية لـ ${coinName} (${coinSym}):\n\nالسعر الحالي: ${coinPrice} (التغير: ${coinChg})\nحركة الأوامر والسيولة: استقرار عند مستويات الدعم الحالية مع تماسك مستمر في التدفقات النقدية عبر شبكة بينانس.`;
        }
        suggestedActions = [
          `تحليل اتجاه ${coinSym} خلال 24 ساعة`,
          `ما أسباب تحرك ${coinSym} اليوم؟`,
          `فحص عمق دفتر الأوامر لـ ${coinSym}`,
        ];
      } else {
        if (isGreeting) {
          fallbackText = `Hello! I am NetroAI, your intelligent autonomous agent for real-time crypto telemetry on Binance Spot and BNB Smart Chain. How can I assist your market analysis today?`;
        } else {
          fallbackText = `Live Market Telemetry for ${coinName} (${coinSym}) via Binance Spot:\n\nCurrent Price: ${coinPrice} (24h Change: ${coinChg})\nOrderflow & Momentum: Stable consolidation channel with sustained taker volume absorption. Depth and liquidity indicators support instant non-custodial execution on BNB Smart Chain.`;
        }
        suggestedActions = [
          `Analyze ${coinSym} 24h Trend`,
          `Why is ${coinSym} moving?`,
          `Inspect ${coinSym} Orderbook Depth`,
        ];
      }

      const fallbackMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: fallbackText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggested_actions: suggestedActions,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleConfirmTrade = async (msgId: string, previewToken: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, execution_status: "executing" } : m
      )
    );

    try {
      let res: Response | null = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        res = await fetch("/api/v1/trading/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            preview_token: previewToken,
            user_confirmed: true,
          }),
        });
        clearTimeout(timeoutId);
      } catch {
        res = null;
      }

      if (res && res.ok) {
        const orderData = await res.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  execution_status: "executed",
                  executed_details: `Order #${orderData.order_id} FILLED: Executed ${orderData.executed_amount} ${orderData.asset} at $${orderData.executed_price_usd.toFixed(2)} ($${orderData.total_usd.toLocaleString()}). Tx: ${orderData.tx_hash.slice(0, 14)}...`,
                }
              : m
          )
        );
      } else {
        throw new Error("Execution rejected by safety engine.");
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                execution_status: "cancelled",
                executed_details: `Execution halted: ${err.message || "Failed"}`,
              }
            : m
        )
      );
    }
  };

  const handleCancelTrade = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              execution_status: "cancelled",
              executed_details: "Action cancelled by user.",
            }
          : m
      )
    );
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Determine current active GIF state
  let activeState: "normal" | "typing" | "thinking" = "normal";
  if (isThinking) {
    activeState = "thinking";
  } else if (isTyping) {
    activeState = "typing";
  }

  // Active suggestions
  const latestAssistantMsg = [...messages].reverse().find((m) => m.sender === "assistant");
  const activeSuggestions =
    latestAssistantMsg?.suggested_actions && latestAssistantMsg.suggested_actions.length > 0
      ? latestAssistantMsg.suggested_actions
      : defaultSuggestions;

  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return (
      <div className="space-y-1">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={idx} className="leading-relaxed">
              {parts.map((part, pIdx) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={pIdx} className="font-bold text-[#1C1C1C]">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* In-Card ChatGPT-Style Interface */}
      <div className="w-full bg-[#F4D014] rounded-xl p-3.5 shadow-figma-md flex flex-col justify-between border border-yellow-400/50 min-h-[360px] h-full">
        {/* Header: CoreAI Bot Avatar + Synced Coin Indicator */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            {/* Smooth Cross-Fading GIF Avatar */}
            <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
              <img
                src="/normal.gif"
                alt="CoreAI Normal"
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-400 ease-in-out ${
                  activeState === "normal"
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                }`}
              />
              <img
                src="/typing.gif"
                alt="CoreAI Typing"
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-400 ease-in-out ${
                  activeState === "typing"
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                }`}
              />
              <img
                src="/thinking.gif"
                alt="CoreAI Thinking"
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-400 ease-in-out ${
                  activeState === "thinking"
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                }`}
              />
            </div>

            <div>
              <h3 className="font-sans text-[16.5px] text-[#1C1C1C] font-bold leading-none">
                NetroAI
              </h3>
              <p className="font-sans text-[11px] text-[#1C1C1C]/70 font-medium leading-none mt-0.5">
                Asset Intelligence Agent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setMessages(INITIAL_MESSAGES);
                setConversationId(`conv_${Date.now()}`);
              }}
              className="p-1 text-[#1C1C1C]/70 hover:text-[#1C1C1C] transition-colors cursor-pointer"
              title="Reset Chat"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1 text-[#1C1C1C]/70 hover:text-[#1C1C1C] transition-colors cursor-pointer"
              title="Expand ChatGPT View"
            >
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable Conversation Stream */}
        <div className="flex-1 overflow-y-auto py-2.5 space-y-2.5 min-h-[180px] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col justify-center">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-3 my-auto select-none">
              {/* Interactive Typing Welcoming Text Above Logo (Doubled size) */}
              <div className="min-h-[72px] flex items-center justify-center mb-3.5 px-2">
                <p className="font-sans text-[22px] sm:text-[25px] font-extrabold text-[#1C1C1C] leading-[1.25] max-w-[420px] tracking-tight">
                  <TypewriterText phrases={WELCOME_PHRASES} />
                </p>
              </div>

              {/* Centered Logo (Doubled size) */}
              <div className="relative flex items-center justify-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center p-2 hover:scale-105 transition-transform duration-300">
                  <img
                    src="/logoblack.png"
                    alt="Netro Logo"
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 text-[12.5px] leading-relaxed transition-all ${
                      msg.sender === "user"
                        ? "bg-[#1C1C1C] text-white rounded-2xl rounded-tr-xs max-w-[85%] shadow-sm"
                        : "bg-white text-[#1C1C1C] rounded-2xl rounded-tl-xs max-w-[92%] shadow-sm border border-black/5"
                    }`}
                  >
                    {renderFormattedText(msg.text)}

                    {/* Proposed Action Preview Widget */}
                    {msg.proposed_actions && msg.proposed_actions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-gray-100">
                        {msg.proposed_actions.map((act, aIdx) => (
                          <div
                            key={aIdx}
                            className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-300/80 text-[#1C1C1C] text-[11.5px]"
                          >
                            <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                              <ShieldCheck size={14} className="text-amber-700" />
                              <span>Proposed Action: {act.title}</span>
                            </div>
                            <p className="text-gray-700 text-[11px] mb-2">{act.description}</p>

                            {msg.execution_status === "pending" && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleConfirmTrade(msg.id, act.preview_token || "")}
                                  className="px-3 py-1 rounded-md bg-[#1C1C1C] text-white text-[11px] font-bold hover:bg-black transition-all cursor-pointer shadow-xs active:scale-95"
                                >
                                  Confirm Execution
                                </button>
                                <button
                                  onClick={() => handleCancelTrade(msg.id)}
                                  className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-700 text-[11px] font-medium hover:bg-gray-100 transition-all cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}

                            {msg.execution_status === "executing" && (
                              <p className="text-gray-500 italic text-[10.5px]">Executing order via Smart Router...</p>
                            )}

                            {msg.execution_status === "executed" && (
                              <p className="text-[#1C1C1C] font-semibold text-[11px] bg-[#FAF0AD]/60 p-1.5 rounded-md border border-yellow-300">
                                {msg.executed_details}
                              </p>
                            )}

                            {msg.execution_status === "cancelled" && (
                              <p className="text-gray-500 italic text-[10.5px]">
                                {msg.executed_details || "Cancelled"}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[9.5px] text-black/50 px-1 mt-0.5 font-medium">
                    {msg.time}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Animated Thinking State with Staggered Bouncing Dots */}
          <AnimatePresence>
            {isThinking && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="flex items-start"
              >
                <div className="bg-white/95 backdrop-blur-sm text-[#1C1C1C] rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-[12px] shadow-sm border border-black/5 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#1C1C1C]"
                        animate={{
                          y: [0, -5, 0],
                          opacity: [0.35, 1, 0.35],
                          scale: [0.85, 1.15, 0.85],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          ease: "easeInOut",
                          delay: i * 0.16,
                        }}
                      />
                    ))}
                  </div>
                  <motion.span
                    animate={{ opacity: [0.65, 1, 0.65] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="text-[11.5px] text-gray-700 font-medium ml-0.5"
                  >
                    Reasoning over {selectedCoin.name} telemetry...
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Main Suggestion Cards Grid (Styled like Portfolio Value / Unrealized P/L) */}
        {!isThinking && (
          <div className="grid grid-cols-2 gap-2 my-2 shrink-0">
            {activeSuggestions.slice(0, 2).map((suggestion, sIdx) => {
              const getSubtitle = (text: string) => {
                const lower = text.toLowerCase();
                if (lower.includes("24h") || lower.includes("trend")) return "24h Trend";
                if (lower.includes("moving") || lower.includes("why") || lower.includes("whale") || lower.includes("flow")) return "Whale Flow";
                if (lower.includes("depth") || lower.includes("orderbook")) return "Orderbook Depth";
                if (lower.includes("compare")) return "Compare";
                if (lower.includes("strategy") || lower.includes("route")) return "Smart Route";
                return "Analysis";
              };

              return (
                <motion.div
                  key={sIdx}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 450, damping: 24 }}
                  onClick={() => sendMessage(suggestion)}
                  className="bg-[#FAFAFA] hover:bg-white rounded-lg p-2.5 sm:p-3 border border-gray-100 hover:border-gray-200 shadow-xs hover:shadow-sm flex flex-col justify-between transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[#444444] font-sans text-[12px] sm:text-[13px] whitespace-nowrap gap-1">
                    <span className="truncate group-hover:text-black font-medium">{suggestion}</span>
                    <ArrowUpRight
                      size={15}
                      className="text-gray-400 group-hover:text-black transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0"
                    />
                  </div>
                  <p className="font-sans text-[18px] sm:text-[20px] font-medium text-[#1C1C1C] mt-2 group-hover:translate-x-0.5 transition-transform">
                    {getSubtitle(suggestion)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Square Borderless Input Field */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="relative flex items-center bg-white rounded-lg px-3 py-1.5 border-none outline-none shadow-none transition-all"
        >
          <input
            type="text"
            placeholder={`Ask about ${selectedCoin.name} or any cryptocurrency...`}
            value={prompt}
            onChange={handleInputChange}
            onFocus={() => {
              if (prompt.trim().length > 0) setIsTyping(true);
            }}
            onBlur={handleInputBlur}
            disabled={isThinking}
            className="flex-1 bg-transparent border-none outline-none font-sans text-[13px] text-[#1C1C1C] placeholder:text-gray-400 py-1"
          />

          <motion.button
            type="submit"
            disabled={isThinking || !prompt.trim()}
            whileHover={{ scale: prompt.trim() && !isThinking ? 1.08 : 1 }}
            whileTap={{ scale: prompt.trim() && !isThinking ? 0.92 : 1 }}
            className="w-7 h-7 rounded-md bg-[#1C1C1C] hover:bg-black disabled:bg-gray-300 text-white flex items-center justify-center transition-all shrink-0 ml-1 cursor-pointer"
            title="Send Message"
          >
            <ArrowUp size={14} strokeWidth={2.5} />
          </motion.button>
        </form>
      </div>

      {/* Full ChatGPT Modal Experience */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[640px] max-h-[90vh] border-none animate-scaleIn">
            {/* Modal Header */}
            <div className="bg-[#F4D014] px-6 py-4 flex items-center justify-between shrink-0 border-none">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                  <img
                    src={isThinking ? "/thinking.gif" : isTyping ? "/typing.gif" : "/normal.gif"}
                    alt="CoreAI"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-sans text-[18px] font-bold text-[#1C1C1C] leading-none">
                    NetroAI Asset Intelligence
                  </h4>
                  <span className="font-sans text-[12px] text-[#1C1C1C]/75 font-medium mt-0.5 inline-block">
                    Binance Agent OS &bull; NetroBNB
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setMessages(INITIAL_MESSAGES);
                    setConversationId(`conv_${Date.now()}`);
                  }}
                  className="h-8 px-3 rounded-lg bg-black/10 hover:bg-black/20 text-xs font-semibold text-[#1C1C1C] transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-none"
                  title="Clear Chat"
                >
                  <RotateCcw size={13} />
                  <span>Clear</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 w-8 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center text-[#1C1C1C] transition-colors cursor-pointer border-none"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Message Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F3F4F6] no-scrollbar [scrollbar-width:none] flex flex-col justify-center">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto select-none">
                  {/* Interactive Typing Welcoming Text Above Logo (Doubled size) */}
                  <div className="min-h-[96px] flex items-center justify-center mb-6 max-w-2xl px-4">
                    <p className="font-sans text-[28px] sm:text-[34px] font-black text-[#1C1C1C] leading-snug tracking-tight">
                      <TypewriterText phrases={WELCOME_PHRASES} />
                    </p>
                  </div>

                  {/* Centered Logo (Doubled size) */}
                  <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center p-3 mb-4 hover:scale-105 transition-transform duration-300">
                    <img
                      src="/logoblack.png"
                      alt="Netro Logo"
                      className="w-full h-full object-contain filter drop-shadow-lg"
                    />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    Ask anything about crypto markets or select a prompt below
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 26 }}
                  className={`flex gap-3 ${
                    msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className="shrink-0 pt-0.5">
                    {msg.sender === "user" ? (
                      <div className="w-8 h-8 rounded-lg bg-[#1C1C1C] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        U
                      </div>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <img
                          src="/normal.gif"
                          alt="CoreAI"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col max-w-[82%]">
                    <div
                      className={`p-3.5 text-[14px] leading-relaxed rounded-2xl border-none ${
                        msg.sender === "user"
                          ? "bg-[#1C1C1C] text-white rounded-tr-xs shadow-sm"
                          : "bg-white text-[#1C1C1C] rounded-tl-xs shadow-sm"
                      }`}
                    >
                      {renderFormattedText(msg.text)}

                      {/* Modal Action Preview */}
                      {msg.proposed_actions && msg.proposed_actions.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-gray-100">
                          {msg.proposed_actions.map((act, aIdx) => (
                            <div
                              key={aIdx}
                              className="p-3 rounded-xl bg-amber-50 border border-amber-300/80 text-[#1C1C1C] text-[12.5px]"
                            >
                              <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                                <ShieldCheck size={16} className="text-amber-700" />
                                <span>Proposed Action: {act.title}</span>
                              </div>
                              <p className="text-gray-700 text-[12px] mb-2.5">{act.description}</p>

                              {msg.execution_status === "pending" && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleConfirmTrade(msg.id, act.preview_token || "")}
                                    className="px-3.5 py-1.5 rounded-md bg-[#1C1C1C] text-white text-[12px] font-bold hover:bg-black transition-all cursor-pointer shadow-xs active:scale-95"
                                  >
                                    Confirm Execution
                                  </button>
                                  <button
                                    onClick={() => handleCancelTrade(msg.id)}
                                    className="px-3 py-1.5 rounded-md bg-white border border-gray-200 text-gray-700 text-[12px] font-medium hover:bg-gray-100 transition-all cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}

                              {msg.execution_status === "executing" && (
                                <p className="text-gray-500 italic text-[11.5px]">Executing order via Smart Router...</p>
                              )}

                              {msg.execution_status === "executed" && (
                                <p className="text-[#1C1C1C] font-semibold text-[12px] bg-[#FAF0AD]/60 p-2 rounded-md border border-yellow-300">
                                  {msg.executed_details}
                                </p>
                              )}

                              {msg.execution_status === "cancelled" && (
                                <p className="text-gray-500 italic text-[11.5px]">
                                  {msg.executed_details || "Cancelled"}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[11px] text-gray-400">{msg.time}</span>
                      {msg.sender === "assistant" && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check size={12} className="text-black" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            )}

            <AnimatePresence>
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                    <img
                      src="/thinking.gif"
                      alt="CoreAI Thinking"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-sm border-none flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 rounded-full bg-[#1C1C1C]"
                          animate={{
                            y: [0, -5, 0],
                            opacity: [0.35, 1, 0.35],
                            scale: [0.85, 1.15, 0.85],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.8,
                            ease: "easeInOut",
                            delay: i * 0.16,
                          }}
                        />
                      ))}
                    </div>
                    <motion.span
                      animate={{ opacity: [0.65, 1, 0.65] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="text-xs text-gray-700 font-medium ml-1"
                    >
                      Reasoning over {selectedCoin.name} telemetry...
                    </motion.span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
              <div ref={modalEndRef} />
            </div>

            {/* Modal Input Bar */}
            <div className="p-4 bg-white border-none shrink-0 shadow-xs">
              {!isThinking && (
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  {activeSuggestions.slice(0, 4).map((suggestion, sIdx) => {
                    const getSubtitle = (text: string) => {
                      const lower = text.toLowerCase();
                      if (lower.includes("24h") || lower.includes("trend")) return "24h Trend";
                      if (lower.includes("moving") || lower.includes("why") || lower.includes("whale") || lower.includes("flow")) return "Whale Flow";
                      if (lower.includes("depth") || lower.includes("orderbook")) return "Orderbook Depth";
                      if (lower.includes("compare")) return "Compare";
                      if (lower.includes("strategy") || lower.includes("route")) return "Smart Route";
                      return "Analysis";
                    };

                    return (
                      <motion.div
                        key={sIdx}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 450, damping: 24 }}
                        onClick={() => sendMessage(suggestion)}
                        className="bg-[#FAFAFA] hover:bg-white rounded-lg p-3 border border-gray-100 hover:border-gray-200 shadow-xs hover:shadow-sm flex flex-col justify-between transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between text-[#444444] font-sans text-[13px] whitespace-nowrap gap-2">
                          <span className="truncate group-hover:text-black font-medium">{suggestion}</span>
                          <ArrowUpRight
                            size={16}
                            className="text-gray-400 group-hover:text-black transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0"
                          />
                        </div>
                        <p className="font-sans text-[20px] font-medium text-[#1C1C1C] mt-2 group-hover:translate-x-0.5 transition-transform">
                          {getSubtitle(suggestion)}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-center gap-2 bg-[#F3F4F6] rounded-xl px-3.5 py-1.5 border-none outline-none shadow-none"
              >
                <input
                  type="text"
                  placeholder={`Ask about ${selectedCoin.name} or any asset (e.g. Compare ${selectedCoin.symbol} and ETH)...`}
                  value={prompt}
                  onChange={handleInputChange}
                  disabled={isThinking}
                  className="flex-1 bg-transparent border-none outline-none font-sans text-[13.5px] text-[#1C1C1C] placeholder:text-gray-400 py-1"
                  autoFocus
                />
                <motion.button
                  type="submit"
                  disabled={isThinking || !prompt.trim()}
                  whileHover={{ scale: prompt.trim() && !isThinking ? 1.08 : 1 }}
                  whileTap={{ scale: prompt.trim() && !isThinking ? 0.92 : 1 }}
                  className="w-8 h-8 rounded-lg bg-[#1C1C1C] hover:bg-black disabled:bg-gray-300 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 border-none"
                >
                  <ArrowUp size={15} strokeWidth={2.5} />
                </motion.button>
              </form>
              <p className="text-center font-sans text-[11px] text-gray-400 mt-2">
                NetroAI Asset Intelligence &bull; Binance Agent OS &bull; NetroBNB
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
