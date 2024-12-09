import React from 'react';
import { useData } from '../../contexts/DataContext';
import PatientModal from '../PatientModal';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (patient: any) => void;
}

export default function NewPatientModal({
  isOpen,
  onClose,
  onPatientCreated
}: NewPatientModalProps) {
  const { addPatient } = useData();

  const handleSubmit = (patientData: any) => {
    const newPatient = {
      ...patientData,
      id: Date.now().toString()
    };
    addPatient(newPatient);
    onPatientCreated(newPatient);
    onClose();
  };

  return (
    <PatientModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      initialData={null}
    />
  );
}