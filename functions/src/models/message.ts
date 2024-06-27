
enum UserMessageType {
    MedicationChange = 'MedicationChange',
    WeightGain = 'WeightGain',
    MedicationUptitration = 'MedicationUptitration',
    Welcome = 'Welcome',
    Vitals = 'Vitals',
    SymptomQuestionnaire = 'SymptomQuestionnaire',
    PreVisit = 'PreVisit',
}

interface UserMessage {
    dueDate?: Date
    completionDate?: Date
    type?: UserMessageType
    title: LocalizedText
    description?: LocalizedText
    action?: string
}