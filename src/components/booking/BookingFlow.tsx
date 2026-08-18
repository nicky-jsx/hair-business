"use client";

import { useState } from "react";
import { ServiceSelect } from "./ServiceSelect";
import { DatePicker } from "./DatePicker";
import { TimeSlotPicker } from "./TimeSlotPicker";
import { CustomerForm } from "./CustomerForm";
import { BookingConfirmation } from "./BookingConfirmation";
import { createBooking } from "@/lib/bookings-db";
import { calculateDepositAmount } from "@/types/stylist";
import type { Stylist, Service } from "@/types/stylist";
import type { Booking, BookingFormData, PaymentOption } from "@/types/booking";

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
    paymentOption: PaymentOption;
  }) => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setLoading(true);
    setError("");

    const total = selectedService.price;
    const depositAmount =
      customerData.paymentOption === "deposit"
        ? calculateDepositAmount(total, stylist.depositType, stylist.depositValue)
        : 0;

    const formData: BookingFormData = {
      serviceId: selectedService.name,
      servicePrice: selectedService.price,
      date: selectedDate,
      time: selectedTime,
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      notes: customerData.notes,
      paymentOption: customerData.paymentOption,
      depositAmount,
      totalPrice: total,
    };

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
    <div className="fixed inset-0 z-50 flex flex-col bg-surface">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          {step !== "confirmation" ? (
            <button
              onClick={step === "service" ? onClose : handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
              aria-label={step === "service" ? "Close" : "Go back"}
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
            <h1 className="text-base font-semibold text-gray-900">
              {step === "confirmation" ? "Booking confirmed" : `Book with ${stylist.name.split(" ")[0]}`}
            </h1>
            {step !== "confirmation" && (
              <p className="mt-0.5 text-xs text-gray-400">Step {stepNumber} of 4</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
            aria-label="Close"
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
          <div className="h-0.5 bg-gray-100">
            <div
              className="h-full bg-brand-600 transition-all duration-300 ease-out"
              style={{ width: `${(stepNumber / 4) * 100}%` }}
            />
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {error && (
          <div className="mx-5 mt-5 rounded-xl bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-800">Something went wrong</p>
            <p className="mt-0.5 text-sm text-red-600">{error}</p>
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
            stylistName={stylist.name}
            depositAmount={calculateDepositAmount(
              selectedService.price,
              stylist.depositType,
              stylist.depositValue
            )}
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
      </main>
    </div>
  );
}

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+(?:\.\d+)?)\s*(hr|hour|hrs|hours|min|mins|minutes)/i);
  if (!match) return 60;

  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  if (unit.startsWith("hr") || unit.startsWith("hour")) {
    return Math.round(value * 60);
  }
  return Math.round(value);
}
