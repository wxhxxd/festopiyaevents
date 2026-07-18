export default function FAQSection() {
  const faqs = [
    {
      question: "How do I book food stalls for a college fest in Hyderabad?",
      answer: "Booking food stalls for college fests in Hyderabad is simple and efficient with Festopiya. First, organizers register their event, list available stall slots, and outline food court requirements. Verified food vendors from across Hyderabad then submit applications with their curated menus. Organizers can review menus, check ratings, negotiate terms (like flat fee or revenue split), and accept the best vendors. Once accepted, the booking fee enters our secure escrow system to finalize the slot reservation."
    },
    {
      question: "What is an Event OS and how does it help student clubs?",
      answer: "An Event Operating System (Event OS) is a comprehensive digital platform that manages all logistical, communication, and financial workflows of an event in one central place. For student clubs and organizers, Festopiya acts as an Event OS that centralizes vendor coordination, digital stall layouts, contracts, and payment processing. Instead of using messy spreadsheets and manual follow-ups, student clubs can manage everything from a single dashboard, reducing coordination errors and securing transactions."
    },
    {
      question: "How does the Festopiya vendor escrow system protect my payments?",
      answer: "The Festopiya vendor escrow system acts as a neutral third party that holds event stall booking fees securely until the event concludes. When a booking is finalized, the organizer deposits the payment into the Escrow Vault. The vendor is notified that the payment is secured, preventing the risk of last-minute cancellation without compensation. Once the fest is successfully completed and both parties confirm terms were met, the funds are released to the vendor, protecting both sides."
    },
    {
      question: "Can I book local food vendors for engineering college tech fests?",
      answer: "Yes! Festopiya supports bookings for all types of events, including engineering college tech fests, cultural nights, and sports meets. Organizers at major Hyderabad engineering colleges can recruit local vendors specialized in fast food, desserts, beverages (like Mojitos), or snacks (like loaded chips). By registering on our platform, you gain access to a network of local businesses ready to serve large crowds, ensuring a vibrant food court for your technical symposium or festival."
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
