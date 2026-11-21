import React, { useState } from "react";

const questions = [
  {
    question: "What is Simatu?",
    answer: "Simatu is a brand network bringing together distinct brands, ideas, experiences and worlds—each with its own identity.",
  },
  {
    question: "What can I explore through Simatu?",
    answer: "Explore the Simatu ecosystem and discover the different brands and experiences within our network.",
  },
  {
    question: "How can I work with Simatu?",
    answer: "If you have an idea or would like to explore a collaboration, use the Let's talk button in the footer. It is not connected yet, but will be enabled in a future update.",
  },
  {
    question: "Do the brands have their own identities?",
    answer: "Yes. Each brand within the network has its own identity and world, while being part of the broader Simatu ecosystem.",
  },
];

export default function FrequentlyAskedQuestions() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="homepage-faq" aria-labelledby="homepage-faq-title">
      <div className="homepage-faq__inner">
        <div className="homepage-faq__intro">
          <h2 id="homepage-faq-title">Frequently asked questions.</h2>
        </div>
        <div className="homepage-faq__list">
          {questions.map((item, index) => (
            <div className={`homepage-faq__item ${openIndex === index ? "is-open" : ""}`} key={item.question}>
              <button
                type="button"
                className="homepage-faq__question"
                aria-expanded={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="homepage-faq__number">{String(index + 1).padStart(2, "0")}</span>
                <span>{item.question}</span>
                <span className="homepage-faq__toggle" aria-hidden="true">{openIndex === index ? "−" : "+"}</span>
              </button>
              {openIndex === index && <p className="homepage-faq__answer">{item.answer}</p>}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .homepage-faq{background:#111;color:#f1e7d8;padding:clamp(64px,9vw,132px) clamp(24px,7.2vw,110px)}
        .homepage-faq__inner{max-width:1440px;margin-inline:auto;display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:clamp(40px,8vw,120px)}
        .homepage-faq__eyebrow{display:block;margin-bottom:28px;color:rgba(245,245,245,.42);font:500 10px/1.4 var(--hp-font-family,sans-serif);letter-spacing:.22em;text-transform:uppercase}
        .homepage-faq h2{margin:0;max-width:560px;font:400 clamp(44px,6.5vw,92px)/.96 Georgia,'Times New Roman',serif;letter-spacing:-.065em;color:#f1e7d8}
        .homepage-faq__item{border-top:1px solid rgba(245,245,245,.16)}
        .homepage-faq__item:last-child{border-bottom:1px solid rgba(245,245,245,.16)}
        .homepage-faq__question{display:grid;grid-template-columns:44px minmax(0,1fr) 28px;align-items:center;gap:16px;width:100%;padding:24px 0;border:0;background:transparent;color:#f1e7d8;text-align:left;font:400 clamp(16px,1.7vw,21px)/1.35 Georgia,'Times New Roman',serif;cursor:pointer}
        .homepage-faq__number{color:rgba(245,245,245,.35);font:500 10px/1 var(--hp-font-family,sans-serif);letter-spacing:.12em}
        .homepage-faq__toggle{color:rgba(245,245,245,.62);text-align:right;font:300 24px/1 var(--hp-font-family,sans-serif)}
        .homepage-faq__answer{margin:0 44px 24px 60px;max-width:620px;color:rgba(245,245,245,.6);font:400 14px/1.8 var(--hp-font-family,sans-serif)}
        @media(max-width:820px){.homepage-faq__inner{grid-template-columns:1fr;gap:40px}.homepage-faq h2{font-size:clamp(48px,11vw,80px)}}
        @media(max-width:520px){.homepage-faq{padding:64px 6%}.homepage-faq__question{grid-template-columns:28px minmax(0,1fr) 24px;gap:12px;padding:20px 0}.homepage-faq__answer{margin:0 24px 22px 40px}}
        @media(prefers-reduced-motion:reduce){.homepage-faq *{transition:none!important}}
      `}</style>
    </section>
  );
}
