import React from "react";
import {
  FaShoppingBag,
  FaUndoAlt,
  FaExclamationTriangle,
  FaTimesCircle,
  FaClipboardList,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaGift,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";

const POLICY = [
  {
    id: 1,
    title: "রিটার্নের শর্তাবলী",
    icon: FaUndoAlt,
    accent: "from-emerald-500 to-teal-500",
    items: [
      "প্রোডাক্ট হাতে পাওয়ার ৭ দিনের মধ্যে রিটার্ন বা এক্সচেঞ্জ করা যাবে।",
      "প্রোডাক্ট অবশ্যই অব্যবহৃত, অক্ষত এবং আসল প্যাকেজিং ও ট্যাগসহ থাকতে হবে।",
      "ভুল প্রোডাক্ট, ক্ষতিগ্রস্ত বা ত্রুটিপূর্ণ প্রোডাক্ট হলে তাৎক্ষণিকভাবে রিটার্ন/রিপ্লেসমেন্ট গ্রহণযোগ্য।",
    ],
    note: {
      title: "ব্যক্তিগত কারণে পরিবর্তন (Change of Mind)",
      icon: FaInfoCircle,
      text: "যদি কোনো ভুল বা ত্রুটি না থেকেও গ্রাহক শুধুমাত্র নিজের ইচ্ছায় প্রোডাক্ট পরিবর্তন করতে চান, সেক্ষেত্রেও তিনি ৭ দিনের মধ্যে এক্সচেঞ্জ করতে পারবেন। তবে এ ক্ষেত্রে ডেলিভারি চার্জ ও সার্ভিস চার্জ প্রযোজ্য হবে।",
    },
  },
  {
    id: 2,
    title: "যেসব ক্ষেত্রে রিটার্ন প্রযোজ্য নয়",
    icon: FaTimesCircle,
    accent: "from-rose-500 to-pink-500",
    items: [
      "প্রোডাক্ট ব্যবহার করা হলে বা গ্রাহকের কারণে ক্ষতিগ্রস্ত হলে।",
      "ট্যাগ, লেবেল বা আসল প্যাকেজিং না থাকলে।",
      "“ফাইনাল সেল” বা বিশেষ ছাড়ে বিক্রিত প্রোডাক্ট (যদি আলাদাভাবে উল্লেখ থাকে)।",
    ],
  },
  {
    id: 3,
    title: "রিটার্ন প্রক্রিয়া",
    icon: FaClipboardList,
    accent: "from-sky-500 to-indigo-500",
    items: [
      "গ্রাহককে ডেলিভারির পর নির্দিষ্ট সময়সীমার মধ্যে আমাদের ওয়েবসাইট, অফিশিয়াল ইনবক্স অথবা কাস্টমার কেয়ার নম্বরে রিটার্ন রিকোয়েস্ট জানাতে হবে।",
      "অনুমোদনের পর আমাদের কুরিয়ার পার্টনার প্রোডাক্ট সংগ্রহ করবে (সম্ভব হলে ফ্রি কালেকশন সুবিধা প্রদান করা হবে)।",
    ],
  },
  {
    id: 4,
    title: "রিফান্ড ও রিপ্লেসমেন্ট সুবিধা",
    icon: FaMoneyBillWave,
    accent: "from-amber-500 to-orange-500",
    items: [
      {
        label: "ফুল রিফান্ড",
        icon: FaMoneyBillWave,
        text: "অনলাইন পেমেন্ট (Bkash/Nagad/Bank ইত্যাদি) করলে সেই একই পেমেন্ট মাধ্যমেই টাকা ফেরত দেওয়া হবে। ক্যাশ অন ডেলিভারি-তে টাকা প্রদান করলে অনুমোদিত পেমেন্ট সিস্টেম (Bkash, Nagad, Bank ইত্যাদি) মাধ্যমে রিফান্ড দেওয়া হবে।",
      },
      {
        label: "রিপ্লেসমেন্ট",
        icon: FaExchangeAlt,
        text: "নতুন প্রোডাক্ট বিনামূল্যে পাঠানো হবে।",
      },
      {
        label: "স্টোর ক্রেডিট",
        icon: FaGift,
        text: "ভবিষ্যতে কেনাকাটার জন্য ক্রেডিট ব্যালেন্স ব্যবহার করা যাবে।",
      },
    ],
  },
  {
    id: 5,
    title: "বিশেষ প্রতিশ্রুতি",
    icon: FaCheckCircle,
    accent: "from-violet-500 to-fuchsia-500",
    quotes: [
      "“Habib’s Fashion এ কেনাকাটা মানেই সম্পূর্ণ আস্থা ও নিশ্চিন্ত সেবা।”",
      "“আমরা কেবল বিক্রির দিকে নয়, বরং আপনার সন্তুষ্টি নিশ্চিত করতেই প্রতিশ্রুতিবদ্ধ।”",
    ],
  },
];

const SectionCard = ({ section }) => {
  const Icon = section.icon;

  return (
    <section className="group rounded-2xl border border-pink-200 bg-pink-50/70 p-5 md:p-6 shadow-sm transition hover:border-pink-300 hover:bg-pink-100/50 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${section.accent} text-white shadow-sm`}
        >
          <Icon className="text-xl" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 md:text-xl break-words whitespace-normal">
            {section.id}. {section.title}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="mt-4 space-y-3 text-slate-800 leading-relaxed break-words whitespace-normal tracking-normal [text-align:justify] [text-justify:inter-word]">
        {/* Normal bullet list */}
        {section.items &&
          Array.isArray(section.items) &&
          typeof section.items[0] === "string" && (
            <ul className="space-y-2">
              {section.items.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1 text-pink-700 shrink-0">
                    <FaCheckCircle />
                  </span>
                  <span className="break-words whitespace-normal">{item}</span>
                </li>
              ))}
            </ul>
          )}

        {/* Items with label/icon */}
        {section.items &&
          Array.isArray(section.items) &&
          typeof section.items[0] === "object" && (
            <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
              {section.items.map((item, i) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-pink-200 bg-pink-50/80 p-4"
                  >
                    <div className="flex items-center gap-2 font-semibold text-slate-900 min-w-0">
                      <ItemIcon className="text-pink-700 shrink-0" />
                      <span className="break-words whitespace-normal">
                        {item.label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700 leading-relaxed break-words whitespace-normal [text-align:justify] [text-justify:inter-word]">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

        {/* Note box */}
        {section.note && (
          <div className="rounded-xl border border-fuchsia-200 bg-fuchsia-50/70 p-4">
            <div className="flex items-center gap-2 font-semibold text-fuchsia-900 min-w-0">
              <section.note.icon className="shrink-0" />
              <span className="break-words whitespace-normal">
                {section.note.title}
              </span>
            </div>
            <p className="mt-2 text-sm text-fuchsia-900/90 leading-relaxed break-words whitespace-normal [text-align:justify] [text-justify:inter-word]">
              {section.note.text}
            </p>
          </div>
        )}

        {/* Quotes */}
        {section.quotes && (
          <div className="space-y-3">
            {section.quotes.map((q, i) => (
              <blockquote
                key={i}
                className="rounded-xl border border-pink-200 bg-pink-50/80 px-4 py-3 text-slate-800 break-words whitespace-normal [text-align:justify] [text-justify:inter-word]"
              >
                {q}
              </blockquote>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const ReturnRefundPolicy = () => {
  return (
    <div className="bg-pink-50 ">
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-14">
        {/* Page header */}
        <header className="relative overflow-hidden rounded-3xl border border-pink-200 bg-gradient-to-br from-pink-100 bg-fuchsia-50/70 p-6 shadow-sm md:p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-pink-200/40 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-fuchsia-200/40 blur-3xl" />

          {/* ✅ UPDATED: always column, centered */}
          <div className="relative flex flex-col gap-4 items-center">
            <div className="min-w-0 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-600 to-fuchsia-500 px-3 py-1 text-white shadow mx-auto">
                <FaShoppingBag className="shrink-0" />
                <span className="text-sm font-semibold break-words whitespace-normal">
                  Habib’s Fashion
                </span>
              </div>

              {/* ✅ heading centered */}
              <h1 className="mt-3 text-2xl font-extrabold text-slate-900 md:text-3xl break-words whitespace-normal text-center">
                রিটার্ন ও রিফান্ড পলিসি
              </h1>

              <p className="mt-2 text-slate-700 break-words whitespace-normal leading-relaxed text-center [text-justify:inter-word]">
                Habib’s Fashion এ আমরা সবসময় গ্রাহকের সন্তুষ্টিকে সর্বোচ্চ
                গুরুত্ব দিই...
              </p>
            </div>

            <div className="rounded-2xl border border-pink-200 bg-fuchsia-50/60 p-5 md:p-6 text-base text-slate-800 w-full mx-auto shadow-sm">
              <div className="flex items-center gap-2 flex-wrap font-semibold text-slate-900">
                <FaExclamationTriangle className="text-pink-700 text-lg" />

                <span className="whitespace-nowrap">গুরুত্বপূর্ণ:</span>

                <span className="font-normal break-words">
                  ডেলিভারির ৭ দিনের মধ্যে রিটার্ন/এক্সচেঞ্জ রিকোয়েস্ট করতে হবে।
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Sections */}
        <div className="mt-8 grid gap-5">
          {POLICY.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>

        {/* Footer note */}
        <footer className="mt-8 rounded-2xl border border-pink-200 bg-pink-50/80 p-5 text-center text-sm text-slate-700 break-words whitespace-normal">
          আরও সাহায্যের জন্য আমাদের কাস্টমার কেয়ার/অফিশিয়াল ইনবক্সে যোগাযোগ
          করুন।
        </footer>
      </div>
    </div>
  );
};

export default ReturnRefundPolicy;
