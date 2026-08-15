"use client";

import { useState } from "react";
import { ServiceSelect } from "./ServiceSelect";
import { DatePicker } from "./DatePicker";
import { TimeSlotPicker } from "./TimeSlotPicker";
import { CustomerForm } from "./CustomerForm";
import { BookingConfirmation } from "./BookingConfirmation";
import { createBooking } from "@/lib/bookings-db";
import type { Stylist, Service } from "@/types/stylist";
import type { Booking, BookingFormData } from "@/types/booking";

interface BookingFlowProps {
  stylist: Stylist;
  onClose: () => void;
}

type Step = "service" | "date" | "time" | "details" | "confirmation";

export function BookingFlow({ stylist, onClose }: BookingFlowProps) {
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep("date");
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
    setStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("details");
  };

  const handleSubmit = async (customerData: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  }) => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setLoading(true);
    setError("");

    const formData: BookingFormData = {
      serviceId: selectedService.name, // Using name as ID for sample data
      date: selectedDate,
      time: selectedTime,
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      notes: customerData.notes,
    };

    // Parse duration (e.g., "2 hrs" -> 120 mins)
    const durationMins = parseDuration(selectedService.duration);

    const result = await createBooking(stylist.id, formData, durationMins);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.booking) {
      setBooking({
        ...result.booking,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        stylistName: stylist.name,
      });
      setStep("confirmation");
    }
  };

  const handleBack = () => {
    switch (step) {
      case "date":
        setStep("service");
        break;
      case "time":
        setStep("date");
        break;
      case "details":
        setStep("time");
        break;
    }
  };

  const stepNumber = {
    service: 1,
    date: 2,
    time: 3,
    details: 4,
    confirmation: 5,
  }[step];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 safe-top">
        {step !== "confirmation" ? (
          <button
            onClick={step === "service" ? onClose : handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08l-4.158 3.96H16.25A.75.75 0 0 1 17 10Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : (
          <div className="w-10" />
        )}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">
            Book with {stylist.name}
          </p>
          {step !== "confirmation" && (
            <p className="text-xs text-gray-400">Step {stepNumber} of 4</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      {step !== "confirmation" && (
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-brand-600 transition-all duration-300"
            style={{ width: `${(stepNumber / 4) * 100}%` }}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="mx-4 mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {step === "service" && (
          <ServiceSelect
            services={stylist.services}
            onSelect={handleServiceSelect}
          />
        )}

        {step === "date" && (
          <DatePicker
            selectedDate={selectedDate}
            onSelect={handleDateSelect}
          />
        )}

        {step === "time" && selectedService && (
          <TimeSlotPicker
            stylistId={stylist.id}
            date={selectedDate}
            serviceDuration={parseDuration(selectedService.duration)}
            selectedTime={selectedTime}
            onSelect={handleTimeSelect}
          />
        )}

        {step === "details" && selectedService && (
          <CustomerForm
            service={selectedService}
            date={selectedDate}
            time={selectedTime}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}

        {step === "confirmation" && booking && (
          <BookingConfirmation
            booking={booking}
            stylist={stylist}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+(?:\.\d+)?)\s*(hr|hour|hrs|hours|min|mins|minutes)/i);
  if (!match) return 60; // Default 1 hour

  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  if (unit.startsWith("hr") || unit.startsWith("hour")) {
    return Math.round(value * 60);
  }
  return Math.round(value);
}
