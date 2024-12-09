import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { testPatients, testAppointments, testSupplies, testAbsences, testUsers } from '../data/testData';
import { PatientNumberService } from '../services/patient/PatientNumberService';

const STORAGE_KEYS = {
  PATIENTS: 'cabinet_medical_patients',
  APPOINTMENTS: 'cabinet_medical_appointments',
  SUPPLIES: 'cabinet_medical_supplies',
  ABSENCES: 'cabinet_medical_absences',
  USERS: 'cabinet_medical_users',
  LAST_UPDATE: 'cabinet_medical_last_update'
};

interface DataContextType {
  patients: any[];
  appointments: any[];
  supplies: any[];
  absences: any[];
  users: any[];
  addPatient: (patient: any) => void;
  updatePatient: (id: string, patient: any) => void;
  deletePatient: (id: string) => void;
  addAppointment: (appointment: any) => void;
  updateAppointment: (id: string, appointment: any) => void;
  deleteAppointment: (id: string) => void;
  addSupply: (supply: any) => void;
  updateSupply: (id: string, supply: any) => void;
  deleteSupply: (id: string) => void;
  addAbsence: (absence: any) => void;
  updateAbsence: (id: string, absence: any) => void;
  deleteAbsence: (id: string) => void;
  addUser: (user: any) => void;
  updateUser: (id: string, user: any) => void;
  deleteUser: (id: string) => void;
  getPatientConsultations: (patientId: string) => any[];
  getLastConsultation: (patientId: string) => any | null;
  isNewPatient: (patientId: string) => boolean;
  getConsultationCount: (patientId: string) => number;
  reinitialiserDonnees: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState(() => {
    const savedPatients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    return savedPatients ? JSON.parse(savedPatients) : testPatients;
  });

  const [appointments, setAppointments] = useState(() => {
    const savedAppointments = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return savedAppointments ? JSON.parse(savedAppointments) : testAppointments;
  });

  const [supplies, setSupplies] = useState(() => {
    const savedSupplies = localStorage.getItem(STORAGE_KEYS.SUPPLIES);
    return savedSupplies ? JSON.parse(savedSupplies) : testSupplies;
  });

  const [absences, setAbsences] = useState(() => {
    const savedAbsences = localStorage.getItem(STORAGE_KEYS.ABSENCES);
    return savedAbsences ? JSON.parse(savedAbsences) : testAbsences;
  });

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    return savedUsers ? JSON.parse(savedUsers) : testUsers;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIES, JSON.stringify(supplies));
  }, [supplies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ABSENCES, JSON.stringify(absences));
  }, [absences]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  const addPatient = (patient: any) => {
    const newPatient = {
      ...patient,
      id: crypto.randomUUID(),
      numeroPatient: PatientNumberService.getNextPatientNumber(),
      createdAt: new Date().toISOString()
    };
    setPatients(prev => [...prev, newPatient]);
    PatientNumberService.reserveNumber(newPatient.numeroPatient);
  };

  const updatePatient = (id: string, patientData: any) => {
    setPatients(prev => prev.map(patient => 
      patient.id === id ? { ...patient, ...patientData, updatedAt: new Date().toISOString() } : patient
    ));
  };

  const deletePatient = (id: string) => {
    const patient = patients.find(p => p.id === id);
    if (patient?.numeroPatient) {
      PatientNumberService.releaseNumber(patient.numeroPatient, patients.filter(p => p.id !== id));
    }
    setPatients(prev => prev.filter(patient => patient.id !== id));
  };

  const addAppointment = (appointment: any) => {
    const newAppointment = {
      ...appointment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setAppointments(prev => [...prev, newAppointment]);
  };

  const updateAppointment = (id: string, appointmentData: any) => {
    setAppointments(prev => prev.map(appointment => 
      appointment.id === id ? { ...appointment, ...appointmentData, updatedAt: new Date().toISOString() } : appointment
    ));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(appointment => appointment.id !== id));
  };

  const addSupply = (supply: any) => {
    const newSupply = {
      ...supply,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setSupplies(prev => [...prev, newSupply]);
  };

  const updateSupply = (id: string, supplyData: any) => {
    setSupplies(prev => prev.map(supply => 
      supply.id === id ? { ...supply, ...supplyData, updatedAt: new Date().toISOString() } : supply
    ));
  };

  const deleteSupply = (id: string) => {
    setSupplies(prev => prev.filter(supply => supply.id !== id));
  };

  const addAbsence = (absence: any) => {
    const newAbsence = {
      ...absence,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setAbsences(prev => [...prev, newAbsence]);
  };

  const updateAbsence = (id: string, absenceData: any) => {
    setAbsences(prev => prev.map(absence => 
      absence.id === id ? { ...absence, ...absenceData, updatedAt: new Date().toISOString() } : absence
    ));
  };

  const deleteAbsence = (id: string) => {
    setAbsences(prev => prev.filter(absence => absence.id !== id));
  };

  const addUser = (user: any) => {
    const newUser = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, userData: any) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...userData, updatedAt: new Date().toISOString() } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const getPatientConsultations = (patientId: string) => {
    return appointments
      .filter(apt => apt.patientId === patientId && apt.status === 'Validé')
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  };

  const getLastConsultation = (patientId: string) => {
    const today = new Date();
    const consultations = appointments
      .filter(apt => 
        apt.patientId === patientId && 
        apt.status === 'Validé' &&
        !isSameDay(parseISO(apt.time), today)
      )
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    return consultations[0] || null;
  };

  const isNewPatient = (patientId: string) => {
    return getConsultationCount(patientId) <= 1;
  };

  const getConsultationCount = (patientId: string) => {
    return appointments.filter(apt => 
      apt.patientId === patientId && 
      apt.status === 'Validé'
    ).length;
  };

  const reinitialiserDonnees = () => {
    setPatients(testPatients);
    setAppointments(testAppointments);
    setSupplies(testSupplies);
    setAbsences(testAbsences);
    setUsers(testUsers);
    localStorage.clear();
  };

  return (
    <DataContext.Provider value={{
      patients,
      appointments,
      supplies,
      absences,
      users,
      addPatient,
      updatePatient,
      deletePatient,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      addSupply,
      updateSupply,
      deleteSupply,
      addAbsence,
      updateAbsence,
      deleteAbsence,
      addUser,
      updateUser,
      deleteUser,
      getPatientConsultations,
      getLastConsultation,
      isNewPatient,
      getConsultationCount,
      reinitialiserDonnees
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};