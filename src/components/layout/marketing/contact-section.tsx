"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Globe, Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

export default function ContactSection() {
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
    <section className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-3xl" />

      <div className="relative grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left Column - Info */}
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Get in Touch
            </h2>
            <p className="text-lg text-muted-foreground">
              Have questions? We're here to help. Send us a message and we'll
              respond as soon as possible.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 group">
              <div className="mt-1 p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Email Us</h3>
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

            <div className="flex items-start gap-4 group">
              <div className="mt-1 p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Live Support</h3>
                <p className="text-sm text-muted-foreground">
                  Available 24/7 through our platform
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="mt-1 p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Website</h3>
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
          </div>

          {/* Trust indicators */}
          <div className="pt-6 border-t border-border/60">
            <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>Quick Response</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Friendly Support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span>Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="relative">
          {/* Card with glass effect */}
          <div className="relative bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="landing-name" className="text-base">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="landing-name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landing-email" className="text-base">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="landing-email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landing-subject" className="text-base">
                  Subject <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="landing-subject"
                  name="subject"
                  type="text"
                  placeholder="What is this regarding?"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landing-message" className="text-base">
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="landing-message"
                  name="message"
                  placeholder="Tell us more about your inquiry..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  rows={5}
                  className="resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
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
                    <Send className="mr-2 h-5 w-5" />
                    Send Message
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                We respect your privacy and will never share your information.
              </p>
            </form>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl -z-10" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
        </div>
      </div>
    </section>
  );
}
