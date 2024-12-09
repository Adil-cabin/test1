import React, { useState } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useData } from '../../contexts/DataContext';
import { useAppointments } from '../../contexts/AppointmentContext';
import ValidationModal from './ValidationModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { PatientNumberService } from '../../services/patient/PatientNumberService';
import { getPreviousFicheNumbers } from '../../utils/ficheUtils';

interface ConsultationTableProps {
  visits: Array<{
    id: string;
    time: string;
    patient: string;
    nom?: string;
    prenom?: string;
    patientId?: string;
    amount: string;
    paid: boolean;
    paymentMethod: string;
    isDelegue: boolean;
    isGratuite: boolean;
    isNewPatient: boolean;
    isControl: boolean;
    isCanceled: boolean;
    ficheNumber?: string;
    status?: string;
    telephone?: string;
    isLunchBreak?: boolean;
    isClinicalConsultation?: boolean;
    clinicName?: string;
  }>;
  selectedDate: Date;
  dateRange: { start: Date; end: Date };
  onDateSelect: (date: Date) => void;
  onRangeSelect: (range: { start: Date; end: Date } | null) => void;
}

export default function ConsultationTable({ 
  visits, 
  selectedDate, 
  dateRange, 
  onDateSelect, 
  onRangeSelect 
}: ConsultationTableProps) {
  const { patients, addPatient, updatePatient } = useData();
  const { appointments, updateAppointment, deleteAppointment } = useAppointments();
  const [editingVisit, setEditingVisit] = useState<string | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState('');
  const [editValues, setEditValues] = useState<{
    [key: string]: {
      status: string;
      ficheNumber: string;
    };
  }>({});

  const validateFicheNumber = (number: string): boolean => {
    if (!number) return true;
    const pattern = /^F\d{2}-\d{4}$/i;
    return pattern.test(number);
  };

  const formatFicheNumber = (number: string): string => {
    if (!number) return '';
    
    const cleaned = number.replace(/[^\d-]/g, '');
    const parts = cleaned.split('-');
    
    if (parts.length === 2) {
      const [part1, part2] = parts;
      return `F${part1.padStart(2, '0')}-${part2.padStart(4, '0')}`;
    }
    
    return number;
  };

  const getPatientDisplayName = (visit: ConsultationTableProps['visits'][0]) => {
    if (visit.isLunchBreak) return 'PAUSE_DEJEUNER';
    if (visit.isClinicalConsultation) return `CONSULTATION_CLINIQUE${visit.clinicName ? ` - ${visit.clinicName}` : ''}`;
    
    if (visit.patientId) {
      const patient = patients.find(p => p.id === visit.patientId);
      if (patient) {
        return `${patient.nom.toUpperCase()} ${patient.prenom}`;
      }
    }
    
    if (visit.nom && visit.prenom) {
      return `${visit.nom.toUpperCase()} ${visit.prenom}`;
    }
    
    return visit.patient || '-';
  };

  const handleEdit = (visitId: string) => {
    const visit = visits.find(v => v.id === visitId);
    if (visit) {
      setEditingVisit(visitId);
      setEditValues({
        [visitId]: {
          status: visit.status || '-',
          ficheNumber: visit.ficheNumber || ''
        }
      });
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent, visitId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleSave(visitId);
    }
  };

  const handleSave = async (visitId: string) => {
    const editValue = editValues[visitId];
    const visit = visits.find(v => v.id === visitId);
    
    if (editValue && visit) {
      if (editValue.status === 'Validé') {
        if (!editValue.ficheNumber) {
          setValidationMessage('Le numéro de fiche patient est obligatoire pour un rendez-vous validé.');
          setShowValidationModal(true);
          return;
        }

        const formattedFicheNumber = formatFicheNumber(editValue.ficheNumber);
        if (!validateFicheNumber(formattedFicheNumber)) {
          setValidationMessage('Le numéro de fiche doit être au format FXX-XXXX');
          setShowValidationModal(true);
          return;
        }

        const ficheExists = visits.some(v => 
          v.id !== visitId && 
          v.ficheNumber === formattedFicheNumber
        );

        if (ficheExists) {
          setValidationMessage('Ce numéro de fiche existe déjà pour un autre patient');
          setShowValidationModal(true);
          return;
        }

        // Create or update patient when validating visit
        let patientId = visit.patientId;
        if (!patientId && visit.nom && visit.prenom) {
          const newPatient = {
            id: crypto.randomUUID(),
            numeroPatient: PatientNumberService.getNextPatientNumber(patients),
            nom: visit.nom,
            prenom: visit.prenom,
            telephone: visit.telephone || '',
            ville: '',
            cin: '',
            dateNaissance: '',
            antecedents: [],
            createdAt: new Date().toISOString()
          };
          addPatient(newPatient);
          patientId = newPatient.id;
        }

        updateAppointment(visitId, {
          ...visit,
          status: editValue.status,
          ficheNumber: formattedFicheNumber,
          patientId
        });
      } else {
        updateAppointment(visitId, {
          ...visit,
          status: editValue.status,
          ficheNumber: ''
        });
      }
      
      setEditingVisit(null);
    }
  };

  const handleDelete = (id: string) => {
    if (selectedVisitId) {
      const visit = visits.find(v => v.id === selectedVisitId);
      if (visit) {
        deleteAppointment(selectedVisitId);

        if (visit.patientId) {
          const samePatientVisits = visits.filter(v => 
            v.patientId === visit.patientId && 
            format(parseISO(v.time), 'yyyy-MM-dd') === format(parseISO(visit.time), 'yyyy-MM-dd')
          );
          samePatientVisits.forEach(v => {
            if (v.id !== selectedVisitId) {
              deleteAppointment(v.id);
            }
          });
        }
      }
      setShowDeleteModal(false);
      setSelectedVisitId(null);
    }
  };

  const getStatusColor = (status: string | undefined): string => {
    switch (status) {
      case 'Validé':
        return 'bg-green-500 text-white';
      case 'Annulé':
        return 'bg-red-500 text-white';
      case 'Reporté':
        return 'bg-yellow-500 text-white';
      case 'Absent':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Heure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ancien Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ancien N° fiche Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° fiche Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confirmation rendez-vous
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visits.map((visit) => {
              const isEditing = editingVisit === visit.id;
              const editValue = editValues[visit.id] || {
                status: visit.status || '-',
                ficheNumber: visit.ficheNumber || ''
              };
              const patient = patients.find(p => p.id === visit.patientId);
              const currentPatient = patient || (visit.nom && visit.prenom ? { nom: visit.nom, prenom: visit.prenom } : null);
              const previousFiches = getPreviousFicheNumbers(appointments, patients, visit.patientId, visit.time, currentPatient);

              return (
                <tr key={`visit-${visit.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getPatientDisplayName(visit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(parseISO(visit.time), 'HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient ? 'Oui' : 'Non'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {previousFiches.join(' / ') || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isEditing && editValue.status === 'Validé' ? (
                      <input
                        type="text"
                        value={editValue.ficheNumber}
                        onChange={(e) => setEditValues({
                          ...editValues,
                          [visit.id]: { ...editValue, ficheNumber: e.target.value }
                        })}
                        onKeyPress={(e) => handleKeyPress(e, visit.id)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="FXX-XXXX"
                        required
                      />
                    ) : (
                      visit.ficheNumber || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={editValue.status}
                        onChange={(e) => setEditValues({
                          ...editValues,
                          [visit.id]: { 
                            ...editValue, 
                            status: e.target.value,
                            ficheNumber: e.target.value === 'Validé' ? editValue.ficheNumber : ''
                          }
                        })}
                        onKeyPress={(e) => handleKeyPress(e, visit.id)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="-">-</option>
                        <option value="Validé">Validé</option>
                        <option value="Annulé">Annulé</option>
                        <option value="Reporté">Reporté</option>
                        <option value="Absent">Absent</option>
                      </select>
                    ) : (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(visit.status)}`}>
                        {visit.status || '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {visit.amount ? `${visit.amount} Dhs` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {isEditing ? (
                        <button
                          onClick={() => handleSave(visit.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Enregistrer
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(visit.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVisitId(visit.id);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Supprimer
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        message={validationMessage}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedVisitId(null);
        }}
        onConfirm={handleDelete}
        message="Cette action supprimera également tous les rendez-vous associés à ce patient pour la même date. Êtes-vous sûr de vouloir continuer ?"
      />
    </div>
  );
}