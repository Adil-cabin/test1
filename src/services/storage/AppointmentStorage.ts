import { Appointment } from '../../components/calendar/types';

const STORAGE_KEY = 'cabinet_medical_appointments';

export class AppointmentStorage {
  public static saveAppointments(appointments: Appointment[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  }

  public static loadAppointments(): Appointment[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    
    try {
      const appointments = JSON.parse(saved);
      // Convertir les dates string en objets Date
      return appointments.map((apt: any) => ({
        ...apt,
        time: new Date(apt.time).toISOString()
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      return [];
    }
  }

  public static addAppointment(appointment: Appointment): void {
    const appointments = this.loadAppointments();
    appointments.push(appointment);
    this.saveAppointments(appointments);
  }

  public static updateAppointment(id: string, updates: Partial<Appointment>): void {
    const appointments = this.loadAppointments();
    const index = appointments.findIndex(apt => apt.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...updates };
      this.saveAppointments(appointments);
    }
  }

  public static deleteAppointment(id: string): void {
    const appointments = this.loadAppointments();
    const filtered = appointments.filter(apt => apt.id !== id);
    this.saveAppointments(filtered);
  }
}