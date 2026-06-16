"use client";

import React, { useState } from "react";
import {
  FaQuestionCircle,
  FaTruck,
  FaRulerCombined,
  FaUndoAlt,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaGift,
  FaHeadset,
  FaShieldAlt,
  FaTags,
  FaChevronDown,
} from "react-icons/fa";

const faqs = [
  {
    icon: FaTruck,
    question: "অর্ডার করলে কত দিনের মধ্যে ডেলিভারি পাবো?",
    answer:
      "ঢাকার মধ্যে সাধারণত ১-৩ কার্যদিবস এবং ঢাকার বাইরে ৩-৫ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন করা হয়। বিশেষ পরিস্থিতিতে সময় সামান্য বেশি লাগতে পারে।",
  },
  {
    icon: FaRulerCombined,
    question: "সাইজ ঠিক না হলে কি এক্সচেঞ্জ করা যাবে?",
    answer:
      "হ্যাঁ, প্রোডাক্ট হাতে পাওয়ার ৭ দিনের মধ্যে সাইজ এক্সচেঞ্জ করা যাবে। প্রোডাক্ট অব্যবহৃত, অক্ষত এবং ট্যাগসহ থাকতে হবে।",
  },
  {
    icon: FaUndoAlt,
    question: "রিটার্ন/এক্সচেঞ্জ এর শর্ত কী?",
    answer:
      "ডেলিভারির ৭ দিনের মধ্যে রিটার্ন বা এক্সচেঞ্জ করা যাবে। প্রোডাক্ট অবশ্যই অব্যবহৃত, আসল প্যাকেজিং ও ট্যাগসহ থাকতে হবে। ভুল/ড্যামেজ/ত্রুটিপূর্ণ প্রোডাক্ট হলে ফ্রি রিটার্ন/রিপ্লেসমেন্ট প্রযোজ্য।",
  },
  {
    icon: FaMoneyBillWave,
    question: "রিফান্ড কত দিনে পাবো?",
    answer:
      "রিটার্নকৃত প্রোডাক্ট যাচাই করার পর ৩-৭ কার্যদিবসের মধ্যে রিফান্ড প্রসেস করা হয়। অনলাইন পেমেন্ট হলে একই মাধ্যমেই রিফান্ড যাবে, COD হলে বিকাশ/নগদ/ব্যাংকে রিফান্ড দেওয়া হবে।",
  },
  {
    icon: FaTags,
    question: "‘Final Sale’ বা ডিসকাউন্ট প্রোডাক্ট কি রিটার্ন করা যাবে?",
    answer:
      "যদি প্রোডাক্টের সাথে আলাদা করে ‘Final Sale’ উল্লেখ থাকে, তাহলে সেটা রিটার্ন/এক্সচেঞ্জ প্রযোজ্য নয়। তবে ড্যামেজ/ভুল প্রোডাক্ট হলে অবশ্যই সমাধান করা হবে।",
  },
  {
    icon: FaShieldAlt,
    question: "প্রোডাক্ট আসল/অরিজিনাল কিনা কীভাবে বুঝবো?",
    answer:
      "আমরা ১০০% অরিজিনাল ও কোয়ালিটি-চেকড প্রোডাক্ট ডেলিভারি করি। যেকোনো সমস্যা থাকলে ৭ দিনের মধ্যে জানালে সমাধান দেয়া হবে।",
  },
  {
    icon: FaHeadset,
    question: "কীভাবে অর্ডার করবো?",
    answer:
      "ওয়েবসাইটে পছন্দের প্রোডাক্ট সিলেক্ট করে ‘Add to Cart’ → ‘Checkout’ করে অর্ডার কনফার্ম করতে পারবেন। প্রয়োজনে আমাদের অফিসিয়াল ইনবক্স/কাস্টমার কেয়ারে যোগাযোগ করেও অর্ডার করা যায়।",
  },
  {
    icon: FaExchangeAlt,
    question: "পেমেন্ট কীভাবে করতে হবে?",
    answer:
      "Bkash, Nagad, Card, Bank Transfer এবং Cash on Delivery (COD)–সহ একাধিক পেমেন্ট অপশন উপলব্ধ আছে। চেকআউট পেজেই সব অপশন পাবেন।",
  },
  {
    icon: FaGift,
    question: "আরও সাহায্য লাগলে কোথায় যোগাযোগ করবো?",
    answer:
      "আপনি আমাদের ওয়েবসাইটের ‘Contact’ পেজ, অফিসিয়াল ফেসবুক ইনবক্স অথবা কাস্টমার কেয়ার নম্বরে যোগাযোগ করতে পারেন। আমরা দ্রুত সহায়তা করবো।",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 md:py-14">
      {/* outer wrapper already pink gradient */}
      <div className="rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 to-fuchsia-50 p-5 shadow-sm md:p-7">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-600 to-fuchsia-500 px-4 py-2 text-white shadow">
            <FaQuestionCircle />
            <span className="text-sm font-semibold tracking-wide">
              Habib’s Fashion
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 md:text-3xl">
            সাধারণ প্রশ্নোত্তর (FAQ)
          </h2>

          <p className="max-w-2xl text-sm text-slate-600 [text-align:justify] leading-relaxed">
            আমাদের পণ্য, ডেলিভারি, রিটার্ন ও পেমেন্ট সংক্রান্ত সবচেয়ে বেশি
            জিজ্ঞাসিত প্রশ্নগুলোর উত্তর এখানে পাওয়া যাবে।
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const Icon = faq.icon;
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`overflow-hidden rounded-2xl border transition ${
                  isOpen
                    ? "border-pink-300 bg-pink-100/60 shadow-[0_0_0_3px_rgba(236,72,153,0.10)]"
                    : "border-pink-200 bg-pink-50/60 hover:border-pink-300 hover:bg-pink-100/40"
                }`}
              >
                {/* Question Button */}
                <button
                  className="flex w-full items-center justify-between gap-3 bg-pink-50/70 px-4 py-4 text-left"
                  onClick={() => toggle(index)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Soft icons for closed, gradient for open */}
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                        isOpen
                          ? "bg-gradient-to-br from-pink-600 to-fuchsia-500 text-white"
                          : "bg-pink-200/70 text-pink-800"
                      }`}
                    >
                      <Icon className="text-sm opacity-90" />
                    </div>

                    <span className="font-semibold text-slate-900 break-words whitespace-normal">
                      {faq.question}
                    </span>
                  </div>

                  {/* Soft pink chevron */}
                  <FaChevronDown
                    className={`shrink-0 text-pink-700/80 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {/* Answer with smooth animation */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden bg-pink-50/50 px-4 pb-4 pt-1 text-sm text-slate-700 [text-align:justify] [text-justify:inter-word] break-words whitespace-normal leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-pink-100/70 to-fuchsia-100/70 p-4 text-center text-xs text-slate-700">
          আরও প্রশ্ন থাকলে আমাদের কাস্টমার কেয়ারে মেসেজ করুন 💬
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
