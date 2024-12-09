import { Patient } from '../types/patient';
import { Appointment } from '../components/calendar/types';
import { format, parseISO, startOfDay, isSameDay, isAfter, isBefore, compareAsc } from 'date-fns';
import { fr } from 'date-fns/locale';

export function getUniquePatients(patients: Patient[]): Patient[] {
  const patientMap = new Map();

  patients.forEach(patient => {
    const fullName = `${patient.nom.toLowerCase()} ${patient.prenom.toLowerCase()}`;
    
    if (!patientMap.has(fullName)) {
      patientMap.set(fullName, patient);
    } else {
      const existingPatient = patientMap.get(fullName);
      if (parseInt(patient.numeroPatient.slice(1)) < parseInt(existingPatient.numeroPatient.slice(1))) {
        patientMap.set(fullName, patient);
      }
    }
  });

  return Array.from(patientMap.values());
}

export function enrichPatientWithAppointments(
  patient: Patient, 
  appointments: Appointment[]
): Patient & {
  nombreConsultations: number;
  derniereConsultation?: string;
  prochainRdv?: string;
} {
  const today = startOfDay(new Date());
  
  const patientAppointments = appointments.filter(apt => 
    apt.patientId === patient.id || 
    (apt.nom?.toLowerCase() === patient.nom.toLowerCase() && 
     apt.prenom?.toLowerCase() === patient.prenom.toLowerCase())
  );

  const validatedAppointments = patientAppointments.filter(apt => apt.status === 'Validé');
  
  // Trier les rendez-vous par date
  const sortedAppointments = [...patientAppointments].sort((a, b) => {
    const dateA = parseISO(a.time);
    const dateB = parseISO(b.time);
    return compareAsc(dateA, dateB);
  });

  // Trouver la dernière consultation (avant aujourd'hui)
  const lastAppointment = [...sortedAppointments]
    .reverse()
    .find(apt => {
      const aptDate = parseISO(apt.time);
      return isBefore(aptDate, today) && !isSameDay(aptDate, today);
    });

  // Trouver le prochain rendez-vous (le premier après ou égal à aujourd'hui)
  const nextAppointment = sortedAppointments
    .find(apt => {
      const aptDate = parseISO(apt.time);
      return isAfter(aptDate, today) || isSameDay(aptDate, today);
    });

  return {
    ...patient,
    nombreConsultations: validatedAppointments.length,
    derniereConsultation: lastAppointment ? 
      format(parseISO(lastAppointment.time), 'dd/MM/yyyy', { locale: fr }) : 
      undefined,
    prochainRdv: nextAppointment ? 
      format(parseISO(nextAppointment.time), 'dd/MM/yyyy HH:mm', { locale: fr }) : 
      undefined
  };
}