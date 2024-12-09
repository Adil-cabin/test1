export function getAppointmentTitle(appointment: any): string {
  if (appointment.type === 'PAUSE_DEJEUNER' || appointment.isLunchBreak) {
    return 'PAUSE_DEJEUNER';
  }
  if (appointment.type === 'CONSULTATION_CLINIQUE' || appointment.isClinicalConsultation) {
    return `CONSULTATION_CLINIQUE${appointment.clinicName ? ` - ${appointment.clinicName}` : ''}`;
  }
  if (appointment.patientId) {
    return appointment.patient;
  }
  if (appointment.nom && appointment.prenom) {
    return `${appointment.nom} ${appointment.prenom}`;
  }
  if (appointment.type) {
    return appointment.type;
  }
  return appointment.patient || appointment.title || 'Patient non spécifié';
}

export function getAppointmentColor(appointment: any): string {
  if (appointment.type === 'PAUSE_DEJEUNER' || appointment.isLunchBreak) {
    return 'bg-gray-500';
  }
  if (appointment.type === 'CONSULTATION_CLINIQUE' || appointment.isClinicalConsultation) {
    return 'bg-purple-500';
  }
  if (appointment.isCanceled) {
    return 'bg-red-500';
  }
  if (appointment.isNewPatient) {
    return 'bg-green-500';
  }
  if (appointment.isDelegue) {
    return 'bg-yellow-500';
  }
  if (appointment.isGratuite) {
    return 'bg-gray-500';
  }
  return 'bg-blue-500';
}