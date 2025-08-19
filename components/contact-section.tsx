"use client"

import type React from "react"

import { useState } from "react"
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
          <h2
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-blue-600 mb-4 xs:mb-8 sm:mb-12 md:mb-16 font-bold px-4 xs:px-0"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 15px rgba(255,255,255,0.8)" }}
          >
            CONTACT US
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6 sm:gap-8 lg:gap-12">
          {/* Contact Information */}
          <AnimatedSection
            animation="fade-right"
            className="space-y-4 xs:space-y-6 sm:space-y-8 bg-white/70 backdrop-blur-md p-3 xs:p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg"
          >
            <div>
              <h3 className="text-lg xs:text-xl sm:text-2xl ethnocentric-title-blue mb-3 xs:mb-4 sm:mb-6">Get In Touch</h3>
              <p className="text-gray-800 mb-8">
                Have questions about our programs or want to learn more about how we can help you improve your game?
                Reach out to us using any of the methods below, and our team will get back to you as soon as possible.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-dr-blue mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900">Our Location</h4>
                  <p className="text-gray-700">713 W YALE ST ORLANDO, FL, 32804</p>
                </div>
              </div>

              <div className="flex items-start">
                <User className="h-6 w-6 text-dr-blue mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900">Phone Number</h4>
                  <p className="text-gray-700"> (407) 614-7454</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="h-6 w-6 text-dr-blue mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900">Email Address</h4>
                  <p className="text-gray-700">info@disciplinerift.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="h-6 w-6 text-dr-blue mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900">Office Hours</h4>
                  <p className="text-gray-700">Monday - Friday: 9:00 AM - 5:00 PM</p>
          
                </div>
              </div>
            </div>

            {/* Social Media Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center mb-4">
                <p className="text-gray-800 font-medium">Stay connected with your players and see highlights</p>
                <p className="text-dr-blue font-bold mt-2">🎯 Be part of the Rift. Be part of the movement.</p>
              </div>
              
              <div className="flex justify-center items-center space-x-6">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/disciplinerift"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center group transition-transform hover:scale-105"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center mb-2 group-hover:shadow-lg transition-shadow">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-dr-blue transition-colors">@disciplinerift</span>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@disciplinerift"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center group transition-transform hover:scale-105"
                >
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-2 group-hover:shadow-lg transition-shadow">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-dr-blue transition-colors">@disciplinerift</span>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/disciplinerift/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center group transition-transform hover:scale-105"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-2 group-hover:shadow-lg transition-shadow">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-dr-blue transition-colors">@disciplinerift</span>
                </a>
              </div>
            </div>
          </AnimatedSection>

          {/* Contact Form */}
          <AnimatedSection animation="fade-left">
            <div className="bg-white/90 backdrop-blur-md p-3 xs:p-4 sm:p-6 lg:p-8 rounded-lg shadow-xl">
              <h3 className="text-lg xs:text-xl sm:text-2xl ethnocentric-title-blue mb-3 xs:mb-4 sm:mb-6">Send Us a Message</h3>
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dr-blue focus:border-dr-blue text-gray-900 bg-white/80"
                  ></textarea>
                </div>

                {/* Success/Error Messages */}
                {submitMessage && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{submitMessage}</span>
                  </div>
                )}
                
                {submitError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-dr-blue hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg py-3 shadow-md transition-all duration-200"
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
