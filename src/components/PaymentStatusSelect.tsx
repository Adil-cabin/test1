import React from 'react';
import { usePayment } from '../contexts/PaymentContext';
import { PaymentData } from '../types/payment';
import { getAvailableStatuses, getStatusColor } from '../utils/paymentStatus';

interface PaymentStatusSelectProps {
  appointmentId: string;
  currentAmount: string;
  currentStatus: string;
  currentPaymentMethod: string;
  isEditing: boolean;
  onUpdate: (values: PaymentData) => void;
}

export default function PaymentStatusSelect({
  appointmentId,
  currentAmount,
  currentStatus,
  currentPaymentMethod,
  isEditing,
  onUpdate
}: PaymentStatusSelectProps) {
  const { updatePaymentStatus, getPaymentData } = usePayment();

  const handleUpdate = (values: PaymentData) => {
    updatePaymentStatus(appointmentId, values);
    onUpdate(values);
  };

  // Récupérer les données sauvegardées si elles existent
  const savedData = getPaymentData(appointmentId);
  const amount = savedData?.amount || currentAmount;
  const status = savedData?.status || currentStatus;
  const paymentMethod = savedData?.paymentMethod || currentPaymentMethod;

  if (!isEditing) {
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        getStatusColor(status)
      }`}>
        {status}
      </span>
    );
  }

  const numAmount = parseFloat(amount.replace(',', '.'));
  const showPaymentMethod = numAmount > 0;

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={amount}
        onChange={(e) => handleUpdate({
          amount: e.target.value,
          status,
          paymentMethod,
        })}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        placeholder="0,00"
      />
      
      {numAmount === 0 && (
        <select
          value={status}
          onChange={(e) => handleUpdate({
            amount,
            status: e.target.value,
            paymentMethod,
          })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {getAvailableStatuses(amount).map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      )}

      {showPaymentMethod && (
        <select
          value={paymentMethod}
          onChange={(e) => handleUpdate({
            amount,
            status,
            paymentMethod: e.target.value,
          })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="Carte Bancaire">Carte Bancaire</option>
          <option value="Espèces">Espèces</option>
          <option value="Virement">Virement</option>
          <option value="Chèque">Chèque</option>
          <option value="-">-</option>
        </select>
      )}
    </div>
  );
}