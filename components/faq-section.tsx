



"use client"

import { useState, useEffect } from "react"
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const faqItems: FAQItem[] = [
    {
      category: "PROGRAMS",
      question: "WHAT AGE GROUPS DO YOUR PROGRAMS SERVE?",
      answer:
        "Our programs are designed for children and teens between the ages of 5 and 11. We offer different skill levels and age-appropriate training for each sport to ensure proper development and enjoyment.",
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
      category: "COACHES",
      question: "ARE YOUR COACHES CERTIFIED?",
      answer:
        "All our coaches are certified in their respective sports and have undergone background checks. Many of our coaches are former collegiate or professional athletes with years of coaching experience. They are trained in age-appropriate coaching techniques and safety protocols.",
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
      category: "PRICING & DISCOUNTS",
      question: "HOW MUCH DOES IT COST?",
      answer:
        "$129 per student per season (not per class).",
    },
    {
      category: "PRICING & DISCOUNTS",
      question: "HOW DO I PAY?",
      answer:
        "Payment is handled securely via Stripe Checkout.",
    },
    {
      category: "WEATHER & CANCELLATIONS",
      question: "WHAT IF IT RAINS OR THERE'S BAD WEATHER?",
      answer:
        "If outdoor practice isn't possible, we'll reschedule or move indoors when permitted by the school and notify families by email.",
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

  const visibleFAQs = searchQuery || isExpanded ? filteredFAQs : filteredFAQs.slice(0, isMobile ? 2 : 3)
  const hasMoreQuestions = !searchQuery && filteredFAQs.length > (isMobile ? 2 : 3)

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
      className="py-20 relative overflow-hidden bg-no-repeat bg-center min-h-screen"
      id="faq"
      style={{ 
        backgroundImage: "url('/faq-background.png')",
        backgroundSize: isMobile ? "100% 100%" : "cover",
        backgroundPosition: "center center"
      }}
    >
      {/* FAQS.png - esquina superior izquierda solo en desktop */}
      <AnimatedSection animation="fade-down" className="hidden sm:block absolute top-6 left-0 z-30">
        <img 
          src="/FAQS.png" 
          alt="FAQs" 
          className="h-20 lg:h-24 w-auto object-contain"
        />
      </AnimatedSection>

      {/* Search bar en la esquina superior derecha - solo desktop */}
      <AnimatedSection animation="fade-down" className="hidden sm:block absolute top-24 right-8 z-30">
        <div className="w-96 max-w-md relative">
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

      <div className="container px-4 relative z-10 pt-8 sm:pt-80">

        {/* Layout móvil: FAQ imagen centrada, searchbar centrado, items */}
        <div className="block sm:hidden">
          {/* FAQ imagen centrada en móvil */}
          <AnimatedSection animation="fade-down" className="text-center mb-0.5">
            <img 
              src="/FAQS.png" 
              alt="FAQs" 
              className="h-6 w-auto object-contain mx-auto"
            />
          </AnimatedSection>

          {/* Search bar centrado en móvil */}
          <AnimatedSection animation="fade-down" className="text-center mb-4">
            <div className="w-72 mx-auto relative">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/80 h-3 w-3" />
                <input
                  type="text"
                  placeholder="SEARCH"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/50 backdrop-blur-md text-white placeholder-white/60 border border-white/30 rounded-full py-1.5 pl-8 pr-2 text-xs focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                />
              </div>
            </div>
          </AnimatedSection>
        </div>

        <div className="max-w-72 sm:max-w-4xl mx-auto space-y-4 sm:space-y-10">
          {visibleFAQs.map((faq, index) => (
            <AnimatedSection
              key={index}
              animation="fade-up"
              delay={index * 100}
              className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg"
            >
              <div 
                className="w-full h-full p-1 sm:p-6"
                style={{
                  backgroundColor: '#0085B7',
                  backgroundImage: 'linear-gradient(135deg, #0085B7 0%, #006B96 100%)',
                  color: '#FFFFFF'
                }}
              >
                <div className="relative z-10">
                  <div className="mb-0.5 sm:mb-1 text-xs sm:text-sm font-medium text-white opacity-90">{faq.category}</div>
                  <h3 className="text-xs sm:text-3xl font-bold mb-0.5 sm:mb-3 leading-tight text-white" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}>
                    {faq.question}
                  </h3>
                  <p className="text-xs sm:text-base text-white opacity-95 leading-tight sm:leading-normal">{faq.answer}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {hasMoreQuestions && (
          <AnimatedSection animation="fade-up" delay={400} className="text-center mt-12">
            <Button
              onClick={toggleExpanded}
              className="text-white font-semibold rounded-full flex items-center mx-auto shadow-md hover:opacity-90 transition-opacity ethnocentric-title-white not-italic"
              style={{ 
                backgroundColor: '#0085B7',
                padding: isMobile ? '1px 2px' : '8px 16px',
                fontSize: '14px'
              }}
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
              className="text-white font-semibold rounded-full shadow-md hover:opacity-90 transition-opacity ethnocentric-title-white"
              style={{ 
                backgroundColor: '#0085B7',
                padding: isMobile ? '1px 2px' : '8px 16px',
                fontSize: '14px'
              }}
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
