"use client"

import type React from "react"

import { useState } from "react"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedSection from "@/components/animated-section"

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission logic would go here
    console.log("Form submitted:", formData)
    // Reset form
    setFormData({ name: "", email: "", subject: "", message: "" })
    // Show success message
    alert("Thank you for your message! We'll get back to you soon.")
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
            className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-blue-600 mb-6 xs:mb-8 sm:mb-12 md:mb-16 font-bold px-4 xs:px-0"
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
                  <p className="text-gray-700">123 Sports Court, Los Angeles, CA 90001</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-6 w-6 text-dr-blue mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900">Phone Number</h4>
                  <p className="text-gray-700">(555) 123-4567</p>
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
                <Clock className="h-6 w-6 text-dr-blue mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900">Office Hours</h4>
                  <p className="text-gray-700">Monday - Friday: 9:00 AM - 5:00 PM</p>
                  <p className="text-gray-700">Saturday: 10:00 AM - 2:00 PM</p>
                  <p className="text-gray-700">Sunday: Closed</p>
                </div>
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
                    <option value="Coaching Opportunities">Coaching Opportunities</option>
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

                <Button
                  type="submit"
                  className="w-full bg-dr-blue hover:bg-blue-500 text-white rounded-lg py-3 shadow-md"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
