//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//

export const messagesLocalization = {
  inactiveTitle: {
    en: 'Inactive',
    es: 'Inactivo',
  },
  inactiveDescription: {
    en: 'You have been inactive for 7 days. Please log in to continue your care.',
    es: 'Ha estado inactivo durante 7 días. Inicie sesión para continuar con su atención.',
  },
  inactiveDescriptionForClinician: {
    en: '@0 has been inactive for 7 days.',
    es: '@0 ha estado inactivo durante 7 días.',
  },
  inactiveDescriptionForClinicianNoName: {
    en: 'Patient has been inactive for 7 days.',
    es: 'El paciente ha estado inactivo durante 7 días.',
  },
  medicationChangeTitle: {
    en: 'Medication Change',
    es: 'Cambio de medicamento',
  },
  medicationChangeDescription: {
    en: 'Your dose of @0 was changed. You can review medication information on the Education Page.',
    es: 'Su dosis de @0 fue modificada. Puede revisar la información sobre sus medicamentos en la Página de Educación.',
  },
  medicationUptitrationTitle: {
    en: 'Eligible Medication Change',
    es: 'Apto para cambio de medicamento',
  },
  medicationUptitrationDescription: {
    en: 'You may be eligible for med changes that may help your heart. Your care team will be sent this information. You can review med information on the Education Page.',
    es: 'Podría ser apto para cambios de medicamentos que podrían beneficiar su corazón. Su equipo de atención médica recibirá esta información. Puede revisar la información sobre sus medicamentos en la Página de Educación.',
  },
  medicationUptitrationTitleForClinician: {
    en: 'Eligible Medication Change',
    es: 'Apto para cambio de medicamento',
  },
  medicationUptitrationDescriptionForClinician: {
    en: '@0 may be eligible for med changes. You can review med information on the user detail page.',
    es: '@0 podría ser apto para cambios de medicamentos. Puede revisar la información sobre sus medicamentos en la página de detalles del usuario.',
  },
  medicationUptitrationDescriptionForClinicianNoName: {
    en: 'Patient may be eligible for med changes. You can review med information on the user detail page.',
    es: 'El paciente podría ser apto para cambios de medicamentos. Puede revisar la información sobre sus medicamentos en la página de detalles del usuario.',
  },
  postAppointmentTitle: {
    en: 'Post-Appointment Survey',
  },
  postAppointmentDescription: {
    en: 'Update us about what has changed during your last appointment.',
  },
  preAppointmentTitle: {
    en: 'Appointment Reminder',
    es: 'Recordatorio de cita',
  },
  preAppointmentDescription: {
    en: 'Your appointment is coming up. Review your Health Summary before your visit.',
    es: 'Su cita se acerca. Revise su Resumen de Salud antes de su cita.',
  },
  preAppointmentTitleForClinician: {
    en: 'Appointment Reminder',
    es: 'Recordatorio de cita',
  },
  preAppointmentDescriptionForClinician: {
    en: 'Appointment with @0 is coming up.',
    es: 'Su cita con @0 se acerca.',
  },
  preAppointmentDescriptionForClinicianNoName: {
    en: 'Appointment with patient is coming up.',
    es: 'Su cita con el paciente se acerca.',
  },
  registrationQuestionnaireTitle: {
    en: 'Registration Survey',
  },
  registrationQuestionnaireDescription: {
    en: 'Complete registration by filling out this survey.',
  },
  symptomQuestionnaireTitle: {
    en: 'Symptom Questionnaire',
    es: 'Cuestionario de síntomas',
  },
  symptomQuestionnaireDescription: {
    en: 'Complete your Symptom Survey for your care team.',
    es: 'Complete su Cuestionario de síntomas para su equipo de atención.',
  },
  vitalsTitle: {
    en: 'Vitals',
    es: 'Signos vitales',
  },
  vitalsDescription: {
    en: 'Check your blood pressure and weight daily.',
    es: 'Controle su presión arterial y peso diariamente.',
  },
  weightGainTitle: {
    en: 'Weight increase since last week',
    es: 'Aumento de peso desde la semana pasada',
  },
  weightGainDescription: {
    en: 'Your weight increased over 3 lbs. Your care team will be informed. Please follow any instructions about diuretic changes after weight increase on the Medication page.',
    es: 'Su peso aumentó más de 3 lbs. Se informará a su equipo de atención. Siga las instrucciones sobre los cambios en por diuréticos después de aumentar de peso en la página de Medicamentos.',
  },
  weightGainTitleForClinician: {
    en: 'Weight increase since last week',
    es: 'Aumento de peso desde la semana pasada',
  },
  weightGainDescriptionForClinician: {
    en: 'Weight increase over 3 lbs for @0.',
    es: 'Aumento de peso de más de 3 lbs de @0.',
  },
  weightGainDescriptionForClinicianNoName: {
    en: 'Weight increase over 3 lbs for patient.',
    es: 'Aumento de peso de más de 3 lbs del paciente.',
  },
  welcomeTitle: {
    en: 'Welcome',
    es: 'Bienvenido.',
  },
  welcomeDescription: {
    en: 'Watch Welcome Video on the Education Page.',
    es: 'Vea el video de bienvenida en la página de Educación.',
  },
} as const
