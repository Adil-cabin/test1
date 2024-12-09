export class PatientNumberService {
  private static STORAGE_KEY = 'patient_numbers';
  private static NUMBER_PREFIX = 'P';
  private static NUMBER_LENGTH = 4;

  public static getNextPatientNumber(patients: any[]): string {
    if (!Array.isArray(patients)) {
      patients = [];
    }
    const totalPatients = patients.length + 1;
    return this.formatNumber(totalPatients);
  }

  public static formatNumber(num: number): string {
    if (isNaN(num) || num < 1) {
      num = 1;
    }
    return `${this.NUMBER_PREFIX}${num.toString().padStart(this.NUMBER_LENGTH, '0')}`;
  }

  public static findOrGeneratePatientNumber(nom: string, prenom: string, patients: any[]): string {
    if (!Array.isArray(patients)) {
      patients = [];
    }

    // Check if patient already exists
    const existingPatient = patients.find(p => 
      p.nom?.toLowerCase() === nom?.toLowerCase() && 
      p.prenom?.toLowerCase() === prenom?.toLowerCase()
    );

    if (existingPatient?.numeroPatient) {
      return existingPatient.numeroPatient;
    }

    // Generate new number based on total patients + 1
    return this.getNextPatientNumber(patients);
  }

  public static validateNumber(number: string): boolean {
    if (!number) return false;
    const pattern = new RegExp(`^${this.NUMBER_PREFIX}\\d{${this.NUMBER_LENGTH}}$`);
    return pattern.test(number);
  }

  public static reserveNumber(number: string): void {
    if (!this.validateNumber(number)) {
      throw new Error(`Invalid patient number format. Expected format: ${this.NUMBER_PREFIX}XXXX`);
    }
    const usedNumbers = this.getUsedNumbers();
    usedNumbers.add(number);
    this.saveUsedNumbers(usedNumbers);
  }

  public static releaseNumber(number: string, patients: any[]): boolean {
    // Check if number is used by another patient
    const isUsedByOther = patients.some(p => p.numeroPatient === number);
    if (!isUsedByOther) {
      const usedNumbers = this.getUsedNumbers();
      usedNumbers.delete(number);
      this.saveUsedNumbers(usedNumbers);
      return true;
    }
    return false;
  }

  public static reorganizeNumbers(patients: any[]): void {
    if (!Array.isArray(patients)) {
      return;
    }

    // Sort patients by creation date or ID
    const sortedPatients = [...patients].sort((a, b) => {
      const dateA = new Date(a?.createdAt || 0);
      const dateB = new Date(b?.createdAt || 0);
      return dateA.getTime() - dateB.getTime();
    });

    // Reassign numbers sequentially
    sortedPatients.forEach((patient, index) => {
      if (patient) {
        patient.numeroPatient = this.formatNumber(index + 1);
      }
    });

    // Update used numbers
    const usedNumbers = new Set(sortedPatients.map(p => p.numeroPatient).filter(Boolean));
    this.saveUsedNumbers(usedNumbers);
  }

  private static getUsedNumbers(): Set<string> {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return new Set(saved ? JSON.parse(saved) : []);
  }

  private static saveUsedNumbers(numbers: Set<string>): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(Array.from(numbers)));
  }

  public static getHighestNumber(patients: any[]): number {
    if (!Array.isArray(patients) || patients.length === 0) {
      return 0;
    }

    return patients.reduce((max, patient) => {
      if (!patient?.numeroPatient) return max;
      const num = parseInt(patient.numeroPatient.replace(this.NUMBER_PREFIX, ''));
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
  }
}