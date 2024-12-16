"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { submitContactForm } from "../../actions/contact";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setErrors({});
    const result = await submitContactForm(formData);
    setIsSubmitting(false);
    if (result.success) {
      setSubmitSuccess(true);
    } else {
      setErrors(result.errors || {});
    }
  }

  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-green-600"
      >
        Thank you for your message! I&#39;ll get back to you soon.
      </motion.div>
    );
  }

  return (
    <motion.form
      action={handleSubmit}
      className="w-full max-w-2xl p-8 mx-auto space-y-6 rounded-md border"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <label
          htmlFor="name"
          className="block mb-1 ml-1 text-sm md:text-md lg:text-xl"
        >
          Name
        </label>
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="text"
          name="name"
          id="name"
          required
          className="block w-full p-2 rounded border focus:outline-none focus:ring focus:ring-opacity-25 focus:dark:ring-secondary-700 dark:bg-secondary-bg"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="email"
          className="block mb-1 ml-1 text-sm md:text-md lg:text-xl"
        >
          Email
        </label>
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="email"
          name="email"
          id="email"
          required
          className="block w-full p-2 rounded border focus:outline-none focus:ring focus:ring-opacity-25 focus:dark:ring-secondary-700 dark:bg-secondary-bg"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="message"
          className="block mb-1 ml-1 text-sm md:text-md lg:text-xl"
        >
          Message
        </label>
        <motion.textarea
          whileFocus={{ scale: 1.02 }}
          name="message"
          id="message"
          required
          rows={5}
          className="block w-full p-2 rounded border focus:outline-none focus:ring focus:ring-opacity-25 focus:dark:ring-secondary-700 dark:bg-secondary-bg"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message[0]}</p>
        )}
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm md:text-md lg:text-xl font-medium text-primary-foreground shadow-sm hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </motion.button>
    </motion.form>
  );
}
