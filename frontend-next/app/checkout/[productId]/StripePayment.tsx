"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/app/components/UI/button";

export default function StripePayment({
    orderId,
}: {
    orderId: string;
}) {
    const stripe = useStripe();
    const elements = useElements();

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handlePayment = async () => {
        if (!stripe || !elements) return;

        setLoading(true);
        setErrorMessage("");

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/orders/success?orderId=${orderId}`,
            },
        });

        // Hvis vi når hertil, er der sket en fejl (ved succes redirectes brugeren automatisk)
        if (error) {
            setErrorMessage(error.message ?? "Betalingen kunne ikke gennemføres.");
        }

        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <PaymentElement options={{ layout: "tabs" }} />

            {errorMessage && (
                <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100">
                    {errorMessage}
                </p>
            )}

            <Button
                onClick={handlePayment}
                disabled={loading || !stripe}
                className="w-full bg-[#003d2b] hover:bg-[#002a1e] text-white py-6 rounded-2xl text-md font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
            >
                {loading ? "Processing..." : "Pay Now"}
            </Button>
        </div>
    );
}