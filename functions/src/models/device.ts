
enum UserDevicePlatform {
    Android = 'Android',
    iOS = 'iOS',
}

interface UserDevice {
    modifiedDate: Date
    notificationToken: string
    platform?: UserDevicePlatform
    osVersion?: string
    appVersion?: string
    appBuild?: string
    language?: string
}