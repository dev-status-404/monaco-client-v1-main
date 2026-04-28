"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Globe, Mail, Phone, Send } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    try {
      // Replace this with your actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Message sent successfully!", {
        description: "We'll get back to you as soon as possible.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error("Failed to send message", {
        description: "Please try again later or contact us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto py-20 px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground text-lg">
          Have a question or need assistance with Monaco Gameroom? We're here
          to help.
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-2">
        {/* Contact Information */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
            <p className="text-muted-foreground mb-8">
              Feel free to reach out to us through any of the following methods.
              Our team is available to assist you with any inquiries you may
              have.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 p-3 rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <a
                  href="mailto:support@monacogameroom.com"
                  className="block text-sm text-muted-foreground transition hover:text-primary"
                >
                  support@monacogameroom.com
                </a>
                <a
                  href="mailto:contact@monacogameroom.com"
                  className="block text-sm text-muted-foreground transition hover:text-primary"
                >
                  contact@monacogameroom.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 p-3 rounded-full bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Website</h3>
                <a
                  href="https://monacogameroom.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted-foreground transition hover:text-primary"
                >
                  https://monacogameroom.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 p-3 rounded-full bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Live Support</h3>
                <p className="text-sm text-muted-foreground">
                  Available 24/7 through our platform
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border/60">
            <h3 className="font-semibold mb-3">Support Availability</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Live Support:</span>
                <span className="font-medium">Available 24/7</span>
              </div>
              <div className="flex justify-between">
                <span>Email Support:</span>
                <span className="font-medium">support@monacogameroom.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card border border-border/60 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                placeholder="What is this regarding?"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us more about your inquiry..."
                value={formData.message}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                rows={6}
                className="resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By submitting this form, you agree to our{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
