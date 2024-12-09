import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Appointment } from '../components/calendar/types';
import { AppointmentStorage } from '../services/storage/AppointmentStorage';
import { getPaymentStatus, PAYMENT_STATUSES } from '../utils/paymentStatus';

interface AppointmentContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentsByDate: (date: Date) => Appointment[];
  getAppointmentById: (id: string) => Appointment | undefined;
  isTimeSlotAvailable: (date: Date, time: string, excludeId?: string) => boolean;
  todayAppointments: Appointment[];
}

const AppointmentContext = createContext<AppointmentContextType | null>(null);

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};

interface AppointmentProviderProps {
  children: React.ReactNode;
}

export const AppointmentProvider = ({ children }: AppointmentProviderProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const savedAppointments = AppointmentStorage.loadAppointments();
    return savedAppointments.map(apt => ({
      ...apt,
      displayStatus: apt.status === 'Confirmé' ? PAYMENT_STATUSES.CONFIRMED : getPaymentStatus(apt.amount)
    }));
  });
  
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    AppointmentStorage.saveAppointments(appointments);
  }, [appointments]);

  useEffect(() => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    const filteredAppointments = appointments.filter(apt => {
      const aptDate = parseISO(apt.time);
      return format(aptDate, 'yyyy-MM-dd') === todayStr;
    }).sort((a, b) => {
      const timeA = parseISO(a.time);
      const timeB = parseISO(b.time);
      return timeA.getTime() - timeB.getTime();
    });

    setTodayAppointments(filteredAppointments);
  }, [appointments]);

  const addAppointment = (appointment: Appointment) => {
    const newAppointment = {
      ...appointment,
      id: crypto.randomUUID(),
      status: appointment.status || 'En attente',
      displayStatus: appointment.status === 'Confirmé' ? PAYMENT_STATUSES.CONFIRMED : getPaymentStatus(appointment.amount)
    };
    setAppointments(prev => [...prev, newAppointment]);
    AppointmentStorage.addAppointment(newAppointment);
  };

  const updateAppointment = (id: string, updatedData: Partial<Appointment>) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === id) {
        const updated = { ...apt, ...updatedData };
        
        // Synchroniser le status et le displayStatus
        if (updated.status === 'Confirmé') {
          updated.displayStatus = PAYMENT_STATUSES.CONFIRMED;
        } else if (updated.status === 'En attente') {
          updated.displayStatus = PAYMENT_STATUSES.PENDING;
        } else if (updated.status === 'Non payé') {
          updated.displayStatus = PAYMENT_STATUSES.UNPAID;
        } else {
          updated.displayStatus = getPaymentStatus(updated.amount);
        }
        
        return updated;
      }
      return apt;
    }));
    AppointmentStorage.updateAppointment(id, updatedData);
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
    AppointmentStorage.deleteAppointment(id);
  };

  const getAppointmentsByDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.time);
      return format(aptDate, 'yyyy-MM-dd') === dateStr;
    });
  };

  const getAppointmentById = (id: string) => {
    return appointments.find(apt => apt.id === id);
  };

  const isTimeSlotAvailable = (date: Date, time: string, excludeId?: string) => {
    const dateTimeToCheck = format(date, "yyyy-MM-dd HH:mm");
    
    return !appointments.some(apt => {
      if (excludeId && apt.id === excludeId) return false;
      
      const aptDate = parseISO(apt.time);
      const aptDateTime = format(aptDate, "yyyy-MM-dd HH:mm");
      
      return aptDateTime === dateTimeToCheck;
    });
  };

  return (
    <AppointmentContext.Provider value={{
      appointments,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      getAppointmentsByDate,
      getAppointmentById,
      isTimeSlotAvailable,
      todayAppointments
    }}>
      {children}
    </AppointmentContext.Provider>
  );
};