"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { Button } from "../../ui";

export default function ContactForm() {
  const form = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  useEffect(() => {
    emailjs.init(process.env.NEXT_PUBLIC_KEY!);
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    (window as any).onTurnstileCallback = (token: string) => {
      setTurnstileToken(token);
    };

    return () => {
      document.head.removeChild(script);
      delete (window as any).onTurnstileCallback;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      const verifyResponse = await fetch("/api/contact/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnstileToken }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        throw new Error(verifyData.error || "Verification failed");
      }

      if (!form.current) {
        throw new Error("Form reference is null");
      }

      const serviceId = process.env.NEXT_PUBLIC_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error("Missing environment variables");
      }

      await emailjs.sendForm(serviceId, templateId, form.current, publicKey);
      setSubmitSuccess(true);
    } catch (error: any) {
      setErrors({
        form: ["Failed to send message. Please try again.", error.message],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='text-center text-green-600 py-28 text-xl lg:text-2xl'
      >
        Thank you for your message! I&#39;ll get back to you soon.
      </motion.div>
    );
  }

  return (
    <motion.form
      ref={form}
      onSubmit={handleSubmit}
      className='w-full max-w-2xl mx-auto space-y-2'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <label
          htmlFor='from_name'
          className='block mb-1 ml-1 text-sm lg:text-base'
        >
          Name
        </label>
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type='text'
          name='from_name'
          id='from_name'
          required
          className='block w-full p-2 rounded border focus:outline-none focus:ring focus:ring-opacity-25 focus:dark:ring-secondary-700 dark:bg-secondary-bg'
        />
        {errors.name && (
          <p className='mt-1 text-sm text-red-600'>{errors.name[0]}</p>
        )}
      </div>
      <div>
        <label
          htmlFor='user_email'
          className='block mb-1 ml-1 text-sm lg:text-base'
        >
          Email
        </label>
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type='email'
          name='user_email'
          id='user_email'
          required
          className='block w-full p-2 rounded border focus:outline-none focus:ring focus:ring-opacity-25 focus:dark:ring-secondary-700 dark:bg-secondary-bg'
        />
        {errors.email && (
          <p className='mt-1 text-sm text-red-600'>{errors.email[0]}</p>
        )}
      </div>
      <div>
        <label
          htmlFor='message'
          className='block mb-1 ml-1 text-sm lg:text-base'
        >
          Message
        </label>
        <motion.textarea
          whileFocus={{ scale: 1.02 }}
          name='message'
          id='message'
          required
          rows={4}
          className='block w-full p-2 rounded border focus:outline-none focus:ring focus:ring-opacity-25 focus:dark:ring-secondary-700 dark:bg-secondary-bg'
        />
        {errors.message && (
          <p className='mt-1 text-sm text-red-600'>{errors.message[0]}</p>
        )}
      </div>
      {/* Turnstile widget */}
      <div
        className='cf-turnstile'
        data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        data-callback='onTurnstileCallback'
        data-theme='auto'
      />
      {errors.form && <p className='text-sm text-red-600'>{errors.form[0]}</p>}
      <Button
        className='w-full lg:text-base text-sm'
        label={isSubmitting ? "Sending..." : "Send Message"}
        disabled={isSubmitting || !turnstileToken}
        variant='primary'
        onClick={() => form.current?.requestSubmit()}
      />
    </motion.form>
  );
}
