"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Wallet, Loader2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: () => void;
}

const PaymentModal = ({
  isOpen,
  onClose,
  amount,
  onSuccess,
}: PaymentModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: "ewallet", name: "E-Wallet", icon: Wallet, desc: "GoPay, OVO, DANA" },
    {
      id: "bank",
      name: "Virtual Account",
      icon: CreditCard,
      desc: "BCA, Mandiri, BNI",
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert("Pilih metode pembayaran terlebih dahulu");
      return;
    }

    setIsProcessing(true);

    // Simulate payment process
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Pembayaran</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-linear-to-r from-primary to-accent text-white p-4 rounded-lg text-center">
            <p className="text-sm opacity-90">Total Pembayaran</p>
            <p className="text-3xl font-bold mt-1">
              Rp {amount.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Pilih Metode Pembayaran:
            </p>
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-4 border rounded-lg flex items-center gap-3 transition-all ${
                    selectedMethod === method.id
                      ? "border-primary bg-accent/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      selectedMethod === method.id
                        ? "bg-primary text-white"
                        : "bg-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{method.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {method.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isProcessing}
          >
            Batal
          </Button>
          <Button
            onClick={handlePayment}
            className="flex-1 bg-linear-to-r from-primary to-accent"
            disabled={isProcessing || !selectedMethod}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              "Bayar Sekarang"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
