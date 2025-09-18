"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { MapPin, User, Mail, Calendar, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedSection from "@/components/animated-section"

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [submitError, setSubmitError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear any previous messages when user starts typing
    if (submitMessage) setSubmitMessage("")
    if (submitError) setSubmitError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setSubmitMessage("")
    setSubmitError("")

    try {
      console.log("Submitting contact form:", formData)
      
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message")
      }

      console.log("Contact form submitted successfully")
      
      // Reset form on success
      setFormData({ name: "", email: "", subject: "", message: "" })
      setSubmitMessage(data.message || "Thank you for your message! We'll get back to you soon.")
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitMessage(""), 5000)

    } catch (error) {
      console.error("Contact form submission error:", error)
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : "An error occurred while sending your message. Please try again."
      )
      
      // Clear error message after 5 seconds
      setTimeout(() => setSubmitError(""), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      className="py-20 bg-cover bg-center relative"
      id="contact"
      style={{ backgroundImage: "url('/contact-us-background.png')" }}
    >
      {/* Optional: Add a subtle overlay if needed for text readability */}
      {/* <div className="absolute inset-0 bg-black/5 z-0"></div> */}

      <div className="container px-4 relative z-10">
        <AnimatedSection animation="fade-down" className="text-center">
          <div className="mb-4 xs:mb-8 sm:mb-12 md:mb-16 px-4 xs:px-0 flex justify-center">
            <Image
              src="/06_GET_IN_TOUCH.png"
              alt="Contact Us"
              width={400}
              height={120}
              className="w-auto h-auto max-w-full max-h-24 xs:max-h-28 sm:max-h-32 md:max-h-36 lg:max-h-40"
              style={{ 
                filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.8)) drop-shadow(0 0 15px rgba(255,255,255,0.8))"
              }}
            />
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6 sm:gap-8 lg:gap-12">
          {/* Contact Information */}
          <AnimatedSection
            animation="fade-right"
            className="space-y-4 xs:space-y-6 sm:space-y-8 bg-white/20 backdrop-blur-md p-3 xs:p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg"
          >
            <div>
              <h3 className="text-lg xs:text-xl sm:text-2xl ethnocentric-title-white mb-3 xs:mb-4 sm:mb-6">Get In Touch</h3>
             
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-white mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-extrabold text-white" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Our Location</h4>
                  <p className="text-white font-normal" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>713 W YALE ST ORLANDO, FL, 32804</p>
                </div>
              </div>

              <div className="flex items-start">
                <User className="h-6 w-6 text-white mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-extrabold text-white" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Phone Number</h4>
                  <p className="text-white font-normal" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}> (407) 614-7454</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="h-6 w-6 text-white mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-extrabold text-white" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Email Address</h4>
                  <p className="text-white font-normal" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>info@disciplinerift.com</p>
                </div>

                
              </div>

             
            </div>

            {/* Social Media Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 rounded-2xl">
              <div className="text-center mb-4">
                <p className="text-white font-bold mt-2">🤚🏼Join the Rift. Be part of the movement.</p>
              </div>
              
              <div className="flex justify-center items-center space-x-6">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/disciplinerift"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center group transition-transform hover:scale-105"
                >
                  <div className="w-16 h-16 mb-2 group-hover:shadow-lg transition-shadow">
                    <Image
                      src="/INSTAGRAM.png"
                      alt="Instagram"
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-sm text-white group-hover:text-dr-blue transition-colors"></span>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@disciplinerift"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center group transition-transform hover:scale-105"
                >
                  <div className="w-16 h-16 mb-2 group-hover:shadow-lg transition-shadow">
                    <Image
                      src="/TIKTOK.png"
                      alt="TikTok"
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-sm text-white group-hover:text-dr-blue transition-colors"></span>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/disciplinerift/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center group transition-transform hover:scale-105"
                >
                  <div className="w-16 h-16 mb-2 group-hover:shadow-lg transition-shadow">
                    <Image
                      src="/FACEBOOK.png"
                      alt="Facebook"
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-sm text-white group-hover:text-dr-blue transition-colors"></span>
                </a>
              </div>
            </div>
          </AnimatedSection>

          {/* Contact Form */}
          <AnimatedSection animation="fade-left">
            <div className="bg-white/70 backdrop-blur-md p-3 xs:p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg">
              <h3 className="text-lg xs:text-xl sm:text-2xl ethnocentric-title-blue mb-3 xs:mb-4 sm:mb-6" style={{ color: '#0085B7' }}>Send Us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-gray-700 font-medium mb-1">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80"
                  >
                    <option value="">Select a subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Program Information">Program Information</option>
                    <option value="Registration">Registration</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80"
                  ></textarea>
                </div>

                {/* Success/Error Messages */}
                {submitMessage && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{submitMessage}</span>
                  </div>
                )}
                
                {submitError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl py-3 shadow-md transition-all duration-200 ethnocentric-title-white"
                  style={{ backgroundColor: '#0085B7' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
