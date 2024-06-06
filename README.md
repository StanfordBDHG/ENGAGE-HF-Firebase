# ENGAGE-HF Firebase

Firebase cloud hosting infrastructure for the ENGAGE-HF project.

# Data Scheme

This document describes how data is stored in Firestore for the Engage-HF app.

## Custom Types

The following section describes custom types defined for this system to be later used

### LocalizedText

A LocalizedText object shall be used whenever text requires localization or may require in the future. The object may either simply be a single string (in the case of localizations not being available yet) or a dictionary with string keys and string values. If LocalizedText is represented by a string-string dictionary, the keys represent language-codes following the ISO 639-1 (or if necessary ISO 639-1) standard and the respective text in the given language as value.

A LocalizedText object cannot be used in FHIR-conforming types due to its incompatibility with the standard. FHIR types commonly contain text in one language only to be specified using the `language` property.

## /medications

In this section, we describe information regarding all the medications to be specified in the Engage-HF context. These medications may be used by a clinician for medication requests to a patient (/users/$userId$/medicationRequests) or contra-indications (/users/$userId$/allergyIntolerances).

### /medications/$medicationId$

Based on [FHIR Medication](https://hl7.org/fhir/R4B/medication.html):

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|meta|Meta|-|[Resource](https://hl7.org/fhir/R4B/resource.html#Meta): Metadata about the resource|
|identifier|list of Identifier|-|Business identifier for this medication|
|extension|list of Extension|-|See /medications/$medicationId$/extension for possible values|

Technically, we could use [FHIR MedicationKnowledge](https://hl7.org/fhir/R4B/medicationknowledge.html), but it doesn't seem to be ready for use - or at least take over the `medicineClassification` property from it.

### /medications/$medicationId$/extension

Based on the [Extension](https://hl7.org/fhir/R4B/extensibility.html#Extension) format specified in FHIR, a medication may contain a list of these following properties. Each property will need to get a url assigned to fit the FHIR data format.

|Property|Type|Values|Comments|
|-|-|-|-|
|medicationClass|string|e.g. "BETABLOCKER"|A medicationClassId referring to a medicationClass specified in /medicationClasses/$medicationClassId$. One medication object may contain multiple medicationClass extension properties.|
|minimumDailyDose|double|e.g. 6.25|Unit: mg/day. May only occur once.|
|targetDailyDose|double|e.g. 50.0|Unit: mg/day. May only occur once.|

Q: Do we possibly need a connection from a single medication to a video?

### /medicationClasses/$medicationClassId$

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|e.g. "BETABLOCKER"||
|name|LocalizedText|-|A name for a given medicationClass to be displayed to a user.|
|videoSectionId|string|-|To be used to retrieve a video using /videos/$videoSectionId$/videos/$videoId$.|
|videoId|string|-|To be used to retrieve a video using /videos/$videoSectionId$/videos/$videoId$.|

Q: Do we necessarily need a connection between medication classes and videos / videoSections?

## /videoSections

In this section, we describe all data related to educational videos to be shown in the Engage-HF mobile apps. The videos are grouped into different categories to be displayed as sections in the mobile apps.

### /videoSections/$videoSectionId$

|Property|Type|Values|Comments|
|-|-|-|-|
|title|LocalizedText|e.g. "ENGAGE-HF Application"|May be localized.|
|description|LocalizedText|e.g. "Helpful videos on the ENGAGE-HF mobile application."|May be localized. Are there different videos / videoSections for each platform?|

Q: Can we specify a certain order in Firestore or should we add something like an id to order it by?
Q: All videos are shown to all users, or is there any filtering/reordering/difference for any users with respect to other users?
Q: Would we gain a benefit from linking the relevant videos / videoSections to the medications / medication classes?

### /videoSections/$videoSectionId$/videos/$videoId$

|Property|Type|Values|Comments|
|-|-|-|-|
|title|LocalizedText|e.g. "Beta Blockers for Heart Failure"|May be localized.|
|url|LocalizedText|e.g. "https://youtu.be/XfgcXkq61k0"|May be localized.|

Q: Can we specify a certain order in Firestore or should we add something like an id to order it by?
Q: All videos are shown to all users, or is there any filtering/reordering/difference for any users with respect to other users?

## /users/$userId$

In this section, we describe all user-related data to be stored.

|Property|Type|Values|Comments|
|-|-|-|-|
|fullName|string|-|Contains a user's full name. TBD: May potentially be split up into firstName/lastName or firstName/middleNames/familyName.|
|dateOfBirth|Date|-|To be used for verification purposes.|
|invitationCode|string|-|The invitationCode to be used when logging in to the app for the first time.|
|language|optional string|e.g. "en"|Following IETF BCP-47 / [FHIR ValueSet languages](https://hl7.org/fhir/R4B/valueset-languages.html)|

Q: Can we somehow ensure that a given logged in user can only access their own information? Clinicians require access to more patients, but they are currently not reflected as "users".

### /users/$userId$/devices/$deviceId$

This data is required to send push notifications over the [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) System.

|Property|Type|Values|Comments|
|-|-|-|-|
|modifiedDate|DateTime|-|This date is updated whenever the token is sent to the server, even if it is not replaced by a different token. It simply reflects the last date we can definitely confirm the token was active. Idea: We may ignore some devices, if the token has not been updated for a long time, since the app has not been opened for a long time.|
|notificationToken|string|-|The FCM token as received from Firebase in the app. TBD: We may want to make this non-optional and simply not store device information, if there is no available token (e.g. if notifications are restricted).|
|platform|optional string|e.g. "iOS", "Android"|This information is important as context for the `osVersion`, `appVersion` and `appBuild` properties.|
|osVersion|optional string|e.g. "17.5.1"|The version of the OS. Depending on the OS, they may have different formats to be specified separately.|
|appVersion|optional string|e.g. "1.0.1"|The version of the app as it is specified on the App/Play Store.|
|appBuild|optional string|e.g. "56"|The build version of the app as defined by the CI pipeline releasing the app.|
|language|optional string|e.g. "en"|Following IETF BCP-47 / [FHIR ValueSet languages](https://hl7.org/fhir/R4B/valueset-languages.html)|

Q: Should we specify language/region by user or by device? Currently both a user and a device may contain a language. A notification shall prioritize a device's language setting, fall back to the user's language setting and use `en-US` in all other cases.

#### Adding a new device or modifying information of an existing one

A device can only be identified by its notification token. When updating a device's information, we therefore check if the notification token already exists in Firestore. If it already exists, we update all other existing fields' values - otherwise, we create a new device.

A device may receive a different notification token at any time though. Therefore, we might create a new device, even though that device already exists in the table with a different (now inactive) notification token. Therefore, every time we send out a new notification and receive the information that a token is no longer active, we need to remove the device from this table.

### /users/$userId$/messages/$messageId$

|Property|Type|Values|Comments|
|-|-|-|-|
|dueDate|optional DateTime|-|The due date of the message to be shown in-app.|
|triggerDate|optional DateTime|-|A date to trigger a notification on the device. If not set, then there is no notification to trigger. The notification should be triggered by the server. TBD: Are there cases where a message would trigger multiple times or event- rather than date-driven?|
|completionDate|optional DateTime|-|Specifies when a message has been completed. TBD: Messages containing a completionDate may either be hidden on user's devices or be shown crossed out.|
|title|LocalizedText|e.g. "Watch Welcome Video in Education Page."|May be localized.|
|description|optional LocalizedText|e.g. "The video shows how you will be able to use this app."|May be localized.|
|action|optional string|e.g. "engage-hf:/videoSections/engage-hf/videos/welcome"|Format to be defined, needs to be decoded on a device and performed on tap of the message.|

### /users/$userId$/allergyIntolerances/$allergyIntoleranceId$

Based on [FHIR AllergyIntolerance](https://hl7.org/fhir/R4B/allergyintolerance.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|type|optional [allergyIntoleranceType](https://hl7.org/fhir/R4B/valueset-allergy-intolerance-type.html)|e.g. "allergy", "intolerance"||
|code|CodableContent|e.g. "{"coding":[{"system":"https://hl7.org/fhir/R4B/valueset-allergyintolerance-code.html","code":"293963004","display":"Cardioselective beta-blocker allergy"}],"text":"Cardioselective beta-blocker allergy"}"|Uses either [AllergyIntoleranceCode](https://hl7.org/fhir/R4B/valueset-allergyintolerance-code.html), `medicationId` as used in /medications/$medicationId$ and/or `medicationId` as used in /medicationClasses/$medicationClassId$.|
|patient|string|e.g. "allergy", "intolerance"|`userId` as used in /users/$userId$ and related collections.|

### /users/$userId$/medicationRequests/$medicationRequestId$

Based on [FHIR MedicationRequest](https://hl7.org/fhir/R4B/medicationrequest.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|type|optional [allergyIntoleranceType](https://hl7.org/fhir/R4B/valueset-allergy-intolerance-type.html)|e.g. "allergy", "intolerance"||
|code|CodableContent|e.g. "{"coding":[{"system":"https://hl7.org/fhir/R4B/valueset-allergyintolerance-code.html","code":"293963004","display":"Cardioselective beta-blocker allergy"}],"text":"Cardioselective beta-blocker allergy"}"|Uses either [AllergyIntoleranceCode](https://hl7.org/fhir/R4B/valueset-allergyintolerance-code.html), `medicationId` as used in /medications/$medicationId$ and/or `medicationId` as used in /medicationClasses/$medicationClassId$.|
|patient|string|e.g. "allergy", "intolerance"|`userId` as used in /users/$userId$ and related collections.|

Q: Which codes should we use for contra-indications? We could simply assume a limited set for now (i.e. the ones we allow for selection in the web dashboard), but when interfacing with an EHR, we would need to be able to consider all relevant codes in the algorithm(s).

### /users/$userId$/observations/$observationId$

Based on [FHIR Observation](https://hl7.org/fhir/R4B/observation.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|

### /users/$userId$/questionnaireResponses/$questionnaireResponseId$

Based on [FHIR QuestionnaireResponse](https://hl7.org/fhir/R4B/questionnaireresponse.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
