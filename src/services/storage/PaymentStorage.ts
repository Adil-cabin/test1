import { PaymentData } from '../../types/payment';

const STORAGE_KEY = 'cabinet_medical_payments';

export class PaymentStorage {
  public static savePayments(payments: Record<string, PaymentData>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
  }

  public static loadPayments(): Record<string, PaymentData> {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  }

  public static updatePayment(appointmentId: string, data: PaymentData): void {
    const payments = this.loadPayments();
    payments[appointmentId] = data;
    this.savePayments(payments);
  }

  public static deletePayment(appointmentId: string): void {
    const payments = this.loadPayments();
    delete payments[appointmentId];
    this.savePayments(payments);
  }

  public static clearPayments(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}