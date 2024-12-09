import { parseISO, isBefore } from 'date-fns';
import { Patient } from '../types/patient';
import { Appointment } from '../components/calendar/types';

export function getPreviousFicheNumbers(
  appointments: Appointment[],
  patients: Patient[],
  patientId: string | undefined, 
  currentVisitTime: string, 
  currentPatient: Patient | null
): string[] {
  const currentVisitDate = parseISO(currentVisitTime);
  
  // Récupérer tous les numéros de fiche précédents
  const previousFiches = appointments
    .filter(apt => {
      const isSamePatientById = apt.patientId === patientId;
      
      const aptPatient = patients.find(p => p.id === apt.patientId);
      const isSamePatientByName = currentPatient && (
        (aptPatient && 
          aptPatient.nom.toLowerCase() === currentPatient.nom.toLowerCase() &&
          aptPatient.prenom.toLowerCase() === currentPatient.prenom.toLowerCase()) ||
        (apt.nom && apt.prenom &&
          apt.nom.toLowerCase() === currentPatient.nom.toLowerCase() &&
          apt.prenom.toLowerCase() === currentPatient.prenom.toLowerCase())
      );

      const aptDate = parseISO(apt.time);
      
      return (isSamePatientById || isSamePatientByName) && 
        apt.ficheNumber && 
        apt.status === 'Validé' &&
        isBefore(aptDate, currentVisitDate);
    })
    .map(apt => apt.ficheNumber!)
    .filter((value, index, self) => self.indexOf(value) === index);

  // Grouper les numéros par préfixe FXX
  const groupedFiches = previousFiches.reduce((acc, fiche) => {
    const match = fiche.match(/F(\d+)-(\d+)/);
    if (!match) return acc;

    const [, prefix] = match;
    if (!acc[prefix]) {
      acc[prefix] = [];
    }
    acc[prefix].push(fiche);
    return acc;
  }, {} as Record<string, string[]>);

  // Formater la sortie
  return Object.entries(groupedFiches).map(([prefix, fiches]) => {
    if (fiches.length === 1) {
      return fiches[0];
    }

    // Extraire et trier les suffixes numériques
    const suffixes = fiches
      .map(f => {
        const match = f.match(/F\d+-(\d+)/);
        return match ? match[1] : '';
      })
      .filter(Boolean)
      .sort((a, b) => parseInt(b) - parseInt(a));

    return `F${prefix}-${suffixes.join('+')}`;
  }).sort((a, b) => {
    const aPrefix = parseInt(a.match(/F(\d+)/)?.[1] || '0');
    const bPrefix = parseInt(b.match(/F(\d+)/)?.[1] || '0');
    return bPrefix - aPrefix;
  });
}