export default function FAQSection() {
  const faqs = [
    {
      question: "How does Festopiya help in booking food vendors for college fests in Hyderabad?",
      answer: "Festopiya connects event organizers from top Hyderabad institutions (such as BITS Hyderabad, CBIT, and IIT Hyderabad) with verified, premium local food vendors. Organizers can browse menus, review vendor ratings, and manage stall bookings all in one central Event OS."
    },
    {
      question: "What types of campus event stalls can be booked through Festopiya?",
      answer: "We support a wide array of stall configurations, including fast food counters, gourmet dining pop-ups, specialized beverage stalls, merchandise tables, and college club activity booths, tailored to campus festival requirements."
    },
    {
      question: "How does the Festopiya vendor escrow system work?",
      answer: "Our secure vendor escrow system ensures trust between organizers and stall vendors. The booking deposit is held securely by Festopiya and is only released to the vendor once the college fest concludes successfully and both parties confirm that all terms were satisfied."
    },
    {
      question: "Can local Hyderabad vendors join Festopiya to list their stalls?",
      answer: "Absolutely! Local food stalls, dessert vendors, and merchandise businesses can register as vendors on Festopiya, verify their business credentials, and start bidding on stall spaces for upcoming college fests and local cultural events."
    }
  ];

  return (
    <section className="relative z-10 w-full max-w-4xl mx-auto px-6 py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12 tracking-wide">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/10 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex justify-between items-center p-6 cursor-pointer text-white font-medium text-lg select-none list-none">
              <span>{faq.question}</span>
              <span className="ml-4 shrink-0 transition-transform duration-300 group-open:rotate-180 text-indigo-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </summary>
            <div className="px-6 pb-6 text-gray-400 leading-relaxed text-base border-t border-white/5 pt-4">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
