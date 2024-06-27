
interface UserMessagesSettings {
    dailyRemindersAreActive: boolean
    textNotificationsAreActive: boolean
    medicationRemindersAreActive: boolean
}

interface User {
    dateOfBirth: Date
    dateOfEnrollment: Date
    invitationCode: string
    messagesSettings: UserMessagesSettings
    clinician?: string
    organization?: string
    language?: string
    timeZone?: string
}
