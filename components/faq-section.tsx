"use client"

import { useState } from "react"
import { Search, ChevronDown, ChevronUp } from "lucide-react"
import AnimatedSection from "@/components/animated-section"
import { Button } from "@/components/ui/button"

interface FAQItem {
  category: string
  question: string
  answer: string
}

export default function FAQSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const faqItems: FAQItem[] = [
    {
      category: "PROGRAMS",
      question: "WHAT AGE GROUPS DO YOUR PROGRAMS SERVE?",
      answer:
        "Our programs are designed for children and teens between the ages of 8 and 18. We offer different skill levels and age-appropriate training for each sport to ensure proper development and enjoyment.",
    },
    {
      category: "REGISTRATION",
      question: "HOW DO I REGISTER FOR A PROGRAM?",
      answer:
        "Registration is easy! Simply navigate to the 'Register Now' section of our website and complete the registration form. You'll receive a confirmation email with all the details about your selected program.",
    },
    {
      category: "PREPARATION",
      question: "WHAT SHOULD MY CHILD BRING TO TRAINING SESSIONS?",
      answer:
        "Participants should bring appropriate athletic clothing, sport-specific shoes, a water bottle, and a small towel. For volleyball, knee pads are recommended. For tennis, players should bring their racquet if they have one (we can provide equipment if needed). For pickleball, we provide all necessary equipment.",
    },
    {
      category: "FINANCIAL",
      question: "DO YOU OFFER SCHOLARSHIPS OR FINANCIAL ASSISTANCE?",
      answer:
        "Yes, we believe every child should have access to quality sports training regardless of financial circumstances. We offer a limited number of scholarships and financial assistance options. Please contact our office for more information and application details.",
    },
    {
      category: "POLICIES",
      question: "WHAT IS YOUR CANCELLATION AND REFUND POLICY?",
      answer:
        "Cancellations made more than 14 days before the program start date are eligible for a full refund minus a $25 processing fee. Cancellations within 7-14 days receive a 50% refund. Cancellations less than 7 days before the start date are not eligible for refunds but may be transferred to another program or participant.",
    },
    {
      category: "COACHES",
      question: "ARE YOUR COACHES CERTIFIED?",
      answer:
        "All our coaches are certified in their respective sports and have undergone background checks. Many of our coaches are former collegiate or professional athletes with years of coaching experience. They are trained in age-appropriate coaching techniques and safety protocols.",
    },
    {
      category: "PROGRAMS",
      question: "DO YOU OFFER PRIVATE LESSONS?",
      answer:
        "Yes, we offer private and semi-private lessons for all three sports. These can be scheduled based on coach availability and facility access. Private lessons are a great way to focus on specific skills and accelerate improvement.",
    },
    {
      category: "PROGRAMS",
      question: "HOW ARE PLAYERS GROUPED DURING TRAINING?",
      answer:
        "Players are grouped primarily by age and skill level to ensure appropriate development and challenge. We conduct skill assessments at the beginning of each program to place participants in the most suitable group. Adjustments can be made throughout the program if needed.",
    },
    {
      category: "POLICIES",
      question: "WHAT SAFETY MEASURES DO YOU HAVE IN PLACE?",
      answer:
        "Safety is our top priority. All coaches are First Aid and CPR certified. We maintain appropriate coach-to-player ratios, enforce proper warm-up protocols, and have emergency action plans in place. Our facilities are regularly inspected for safety hazards.",
    },
    {
      category: "PROGRAMS",
      question: "CAN PARENTS WATCH THE TRAINING SESSIONS?",
      answer:
        "Yes, we have designated viewing areas for parents at all our training facilities. We encourage parental support while maintaining a focused training environment for the participants.",
    },
    {
      category: "PROGRAMS",
      question: "DO YOU OFFER YEAR-ROUND PROGRAMS OR JUST SEASONAL?",
      answer:
        "We offer both seasonal programs and year-round training options. Our seasonal programs typically run for 8-12 weeks, while our year-round programs provide continuous development with appropriate breaks throughout the year.",
    },
    {
      category: "CLUB",
      question: "HOW DO I JOIN THE COMPETITIVE CLUB TEAMS?",
      answer:
        "Club team selection is based on tryouts that we hold several times throughout the year. Information about upcoming tryouts can be found on our website or by contacting our office. Players on club teams commit to more intensive training and competition schedules.",
    },
  ]

  const filteredFAQs = searchQuery
    ? faqItems.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : faqItems

  const visibleFAQs = searchQuery || isExpanded ? filteredFAQs : filteredFAQs.slice(0, 3)
  const hasMoreQuestions = !searchQuery && filteredFAQs.length > 3

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
    if (isExpanded) {
      setTimeout(() => {
        const faqSection = document.getElementById("faq")
        if (faqSection) {
          faqSection.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 100)
    }
  }

  return (
    <section
      className="py-20 relative overflow-hidden bg-cover bg-center"
      id="faq"
      style={{ backgroundImage: "url('/faq-background.png')" }}
    >
      <div className="container px-4 relative z-10">
        <AnimatedSection animation="fade-down" className="text-center mb-16 mt-32">
          <div className="max-w-md mx-auto relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80" />
              <input
                type="text"
                placeholder="SEARCH"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 backdrop-blur-md text-white placeholder-white/60 border border-white/30 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
              />
            </div>
          </div>
        </AnimatedSection>

        <div className="max-w-4xl mx-auto space-y-10">
          {visibleFAQs.map((faq, index) => (
            <AnimatedSection
              key={index}
              animation="fade-up"
              delay={index * 100}
              className="text-white bg-black/20 p-6 rounded-lg shadow-lg backdrop-blur-sm"
            >
              <div className="mb-1 text-sm font-medium text-white">{faq.category}</div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}>
                {faq.question}
              </h3>
              <p className="text-white/95">{faq.answer}</p>
            </AnimatedSection>
          ))}
        </div>

        {hasMoreQuestions && (
          <AnimatedSection animation="fade-up" delay={400} className="text-center mt-12">
            <Button
              onClick={toggleExpanded}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-full px-10 py-6 text-lg flex items-center mx-auto shadow-md"
            >
              {isExpanded ? (
                <>
                  SHOW LESS <ChevronUp className="ml-2 h-5 w-5" />
                </>
              ) : (
                <>
                  READ MORE <ChevronDown className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </AnimatedSection>
        )}

        {filteredFAQs.length === 0 && searchQuery && (
          <AnimatedSection
            animation="fade-up"
            className="text-center mt-12 bg-black/30 p-6 rounded-lg shadow-lg backdrop-blur-sm"
          >
            <p className="text-white text-xl mb-6">
              No FAQs match your search. Try different keywords or browse all questions.
            </p>
            <Button
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-full px-10 py-6 text-lg shadow-md"
              onClick={() => setSearchQuery("")}
            >
              VIEW ALL FAQS
            </Button>
          </AnimatedSection>
        )}

        {searchQuery && filteredFAQs.length > 0 && (
          <AnimatedSection animation="fade-up" className="text-center mt-8">
            <p className="text-white/80">
              Showing {filteredFAQs.length} of {faqItems.length} questions
            </p>
          </AnimatedSection>
        )}
      </div>
    </section>
  )
}
