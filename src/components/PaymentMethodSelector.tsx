import { useState } from 'react';
import { CreditCard, Wallet, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onSelect: (method: string) => void;
}

const paymentMethods = [
  {
    id: 'gopay',
    name: 'GoPay',
    icon: Wallet,
    color: 'text-blue-500',
    description: 'Scan QR Code',
  },
  {
    id: 'ovo',
    name: 'OVO',
    icon: Wallet,
    color: 'text-purple-500',
    description: 'Push Notification',
  },
  {
    id: 'dana',
    name: 'DANA',
    icon: Wallet,
    color: 'text-blue-400',
    description: 'Redirect to App',
  },
  {
    id: 'bca_va',
    name: 'BCA Virtual Account',
    icon: Building2,
    color: 'text-blue-700',
    description: 'Manual Transfer',
  },
  {
    id: 'credit_card',
    name: 'Kartu Kredit/Debit',
    icon: CreditCard,
    color: 'text-gray-700',
    description: 'Visa/Mastercard',
  },
];

export default function PaymentMethodSelector({
  selectedMethod,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Pilih Metode Pembayaran</h3>
      <RadioGroup
        value={selectedMethod}
        onValueChange={onSelect}
        className="grid grid-cols-1 gap-3"
      >
        {paymentMethods.map((method) => (
          <div key={method.id}>
            <RadioGroupItem
              value={method.id}
              id={method.id}
              className="peer sr-only"
            />
            <Label
              htmlFor={method.id}
              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 ${
                selectedMethod === method.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full bg-white shadow-sm ${method.color}`}>
                  <method.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{method.name}</div>
                  <div className="text-xs text-gray-500">{method.description}</div>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === method.id
                    ? 'border-purple-600'
                    : 'border-gray-300'
                }`}
              >
                {selectedMethod === method.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                )}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
