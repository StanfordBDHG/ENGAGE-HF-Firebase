<!-- 
This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project 
SPDX-FileCopyrightText: 2023 Stanford University
SPDX-License-Identifier: MIT 
-->

# ENGAGE-HF Firebase

Firebase cloud hosting infrastructure for the ENGAGE-HF project.

# Security

A user can have one or more of the following roles assigned:

|Role|Scope|Rights|Source of Truth|
|-|-|-|-|
|Admin|Everything|R/W|`admins/$userId$` exists|
|Owner|In organization|R/W of users, R/W of organization|`organization/$organizationId$` contains `userId` in `owners` property|
|Clinician|In organization|R/W of users|`clinicians/$userId$` exists|
|User|Own data|R/W of `users/$userId$`|auth has same userId|

# Data Scheme

This document describes how data is stored in Firestore for the Engage-HF app.

## Custom Types

The following section describes custom types defined for this system to be later used

### LocalizedText

A LocalizedText object shall be used whenever text requires localization or may require in the future. The object may either simply be a single string (in the case of localizations not being available yet) or a dictionary with string keys and string values. If LocalizedText is represented by a string-string dictionary, the keys represent language-codes following the ISO 639-1 (or if necessary ISO 639-2) standard and the respective text in the given language as value.

Some localizations may require to include regions as well (e.g. Australian/British/American English), so the clients should be aware of this and prioritize the language code with the correct region (`en-us`) over the general code (`en`), if it is present.

A LocalizedText object cannot be used in FHIR-conforming types due to its incompatibility with the standard. FHIR types commonly contain text in one language only to be specified using the `language` property.

#### Example

```
{
	"en":"Welcome to the Engage-HF app!",
	"de":"Willkommen in der Engage-HF App!",
	"es":"¡Bienvenido a la aplicación Engage-HF!"
}
```

## /invitations/$invitationId$

When a patient joins Engage-HF, we first create an invitation code on demand of an operator of the web dashboard. Upon activation, we create a user associated with the invitationCode and remove the entry in this collection.

|Property|Type|Values|Comments|
|-|-|-|-|
|used|boolean|true, false|Whether the invitation code has already been used or not. If this property is true, the invitation code can no longer be used.|
|usedBy|optional string|-|The user created from this invitation code.|

## /questionnaires

In this section, we describe all the information stored for questionnaires.

### /questionnaires/$questionnaireId$

Based on [FHIR Questionnaire](https://hl7.org/fhir/R4B/questionnaire.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|meta|Meta|-|[Resource](https://hl7.org/fhir/R4B/resource.html#Meta): Metadata about the resource|
|identifier|list of Identifier|-|Business identifier for this questionnaire. There may be multiple questionnaire objects in this list, with differing `id` and `language` properties, but a common business identifier.|
|title|string|-|Human-friendly title of the questionnaire.|
|date|DateTime|-|last modified date|
|version|string|-|Business version of the questionnaire.|
|language|optional string|e.g. "en"|Following IETF BCP-47 / [FHIR ValueSet languages](https://hl7.org/fhir/R4B/valueset-languages.html)|
|item|list of BackboneElement|-|items as defined in [FHIR Questionnaire](https://hl7.org/fhir/R4B/questionnaire.html)|
|item[x]>linkId|string|-|Unique id for item in questionnaire|
|item[x]>definition|optional uri|-|Details for the item|
|item[x]>prefix|optional string|e.g. "1(a)", "2.5.3"|Prefix of the item that isn't actually part of the name but may still be displayed.|
|item[x]>text|string|-|Primary text for the item|
|item[x]>type|code|e.g. "group", "display", "boolean", "decimal", "integer", "date", etc|See [QuestionnaireItemType](https://hl7.org/fhir/R4B/valueset-item-type.html) for available values.|

You can find an example KCCQ-12 questionnaire in [functions/data/questionnaires.json](functions/data/questionnaires.json).

## /medications

In this section, we describe information regarding all the medications to be specified in the Engage-HF context. These medications may be used by a clinician for medication requests to a patient (/users/$userId$/medicationRequests) or contra-indications (/users/$userId$/allergyIntolerances).

### /medications/$medicationId$

Based on [FHIR Medication](https://hl7.org/fhir/R4B/medication.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|text|string|-|Full name of the given medication.|
|extension|list of Extension|-|See /medications/$medicationId$/extension for possible values|

Based on the [Extension](https://hl7.org/fhir/R4B/extensibility.html#Extension) format specified in FHIR, a medication may contain a list of these following extension properties. Each property will need to get a url assigned to fit the FHIR data format.

|Property|Type|Values|Comments|
|-|-|-|-|
|medicationClass|string|-|A `medicationClassId` referring to a medicationClass specified in /medicationClasses/$medicationClassId$. One medication object may contain multiple medicationClass extension properties.|
|minimumDailyDose|[SimpleQuantity](https://www.hl7.org/fhir/r4b/datatypes.html#SimpleQuantity)|-|Unit: mg/day. Occurs exactly once. Multi-ingredient pills contain an array of double rather than a double.|
|targetDailyDose|[SimpleQuantity](https://www.hl7.org/fhir/r4b/datatypes.html#SimpleQuantity)|-|Unit: mg/day. Occurs exactly once. Multi-ingredient pills contain an array of double rather than a double.|

### /medications/$medicationId$/drugs/$drugId$

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|text|string|-|Full name of the given medication including dosage information.|
|ingredient|list of Ingredient|-|Use references to medications and strength for quantity information.|
|ingredient[x]>item|Reference(Medication)|-|-|
|ingredient[x]>strength|Ratio|-|Uses "mg" as numerator unit, no denominator unit and denominator value is always 1.|

### /medicationClasses/$medicationClassId$

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|-|
|name|LocalizedText|-|A name for a given medicationClass to be displayed to a user.|
|videoPath|string|e.g. "/videoSectionId/1/videos/2"|The path to retrieve the respective video from Firestore.|

## /videoSections/$videoSectionId$

In this section, we describe all data related to educational videos to be shown in the Engage-HF mobile apps. The videos are grouped into different categories to be displayed as sections in the mobile apps.

|Property|Type|Values|Comments|
|-|-|-|-|
|title|LocalizedText|e.g. "ENGAGE-HF Application"|May be localized.|
|description|LocalizedText|e.g. "Helpful videos on the ENGAGE-HF mobile application."|May be localized. Are there different videos / videoSections for each platform?|
|orderIndex|integer|e.g. 1|Since Firestore collections aren't necessarily ordered, we have this property to order the elements by on the clients. The list is supposed to be ordered ascending by `orderIndex`.|

### /videoSections/$videoSectionId$/videos/$videoId$

|Property|Type|Values|Comments|
|-|-|-|-|
|title|LocalizedText|e.g. "Beta Blockers for Heart Failure"|May be localized.|
|youtubeId|LocalizedText|e.g. "XfgcXkq61k0"|Contains the video id from YouTube.|
|orderIndex|integer|e.g. 1|Since Firestore collections aren't necessarily ordered, we have this property to order the elements by on the clients. The list is supposed to be ordered ascending by `orderIndex`.|

Embed links for YouTube: `https://youtube.com/embed/${youtubeId}`.
Short links for YouTube: `https://youtu.be/${youtubeId}`. 
Watch links for YouTube: `https://youtube.com/watch?v=${youtubeId}`. 

## /users/$userId$

In this section, we describe all user-related data to be stored. The security rules shall be set up in a way to only allow for a patient to access its own information and a clinician to access all patients' information (or even more restrictive, if needed).

|Property|Type|Values|Comments|
|-|-|-|-|
|dateOfBirth|Date|-|To be used for verification purposes.|
|dateOfEnrollment|Date|-|The date when the invitation code was used to create this user.|
|invitationCode|string|-|The invitationCode to be used when logging in to the app for the first time.|
|language|optional string|e.g. "en"|Following IETF BCP-47 / [FHIR ValueSet languages](https://hl7.org/fhir/R4B/valueset-languages.html).|
|messagesSettings|-|-|See properties below.|
|messagesSettings>dailyRemindersAreActive|boolean|true, false|Decides whether to send out daily reminder messages for this user.|
|messagesSettings>textNotificationsAreActive|boolean|true, false|Decides whether to send text notifications for this user.|
|messagesSettings>medicationRemindersAreActive|boolean|true, false|Decides whether to send medication reminder messages for this user.|
|timeZone|string|e.g. "America/Los_Angeles"|The value needs to correspond to an identifier from [TZDB](https://nodatime.org/TimeZones). It must not be an offset to UTC/GMT, since that wouldn't work well with daylight-savings (even if there is no daylight-savings time at that location). Also, don't use common abbreviations like PST, PDT, CEST, etc (they may be ambiguous, e.g. CST). If the timeZone is unknown, then "America/Los_Angeles" should be used.|

### /users/$userId$/appointments/$appointmentId$

Based on [FHIR Appointment](https://hl7.org/fhir/R4B/appointment.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|status|[AppointmentStatus](https://hl7.org/fhir/R4B/valueset-appointmentstatus.html)|e.g. "booked"|-|
|created|[DateTime](https://hl7.org/fhir/R4B/datatypes.html#datetime)||
|start|[Instant](https://hl7.org/fhir/R4B/datatypes.html#instant)|-|-|
|end|[Instant](https://hl7.org/fhir/R4B/datatypes.html#instant)|-|-|
|comment|optional string|-|May not be shown to the patient.|
|patientInstruction|optional string|-|May be shown to the patient.|
|participant|list of CodeableConcept|-|Must contain at least one element.|
|participant[x]>actor|Reference(Patient)|-|Usually just the `userId` of the patient.|
|participant[x]>status|[ParticipationStatus](https://hl7.org/fhir/R4B/valueset-participationstatus.html)|e.g. accepted, declined, tentative, needs-action|-|

### /users/$userId$/devices/$deviceId$

This data is required to send push notifications over the [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) System.

|Property|Type|Values|Comments|
|-|-|-|-|
|modifiedDate|DateTime|-|This date is updated whenever the token is sent to the server, even if it is not replaced by a different token. It simply reflects the last date we can definitely confirm the token was active. Idea: We may ignore some devices, if the token has not been updated for a long time, since the app has not been opened for a long time.|
|notificationToken|string|-|The FCM token as received from Firebase in the app.|
|platform|optional string|e.g. "iOS", "Android"|This information is important as context for the `osVersion`, `appVersion` and `appBuild` properties.|
|osVersion|optional string|e.g. "17.5.1"|The version of the OS. Depending on the OS, they may have different formats to be specified separately.|
|appVersion|optional string|e.g. "1.0.1"|The version of the app as it is specified on the App/Play Store.|
|appBuild|optional string|e.g. "56"|The build version of the app as defined by the CI pipeline releasing the app.|
|language|optional string|e.g. "en"|Following IETF BCP-47 / [FHIR ValueSet languages](https://hl7.org/fhir/R4B/valueset-languages.html)|

Push notifications over APNS / FCM only contain text in a single language. For this, the device's `language` property shall be prioritized, falling back on the user's `language` property and using US-English if both are not present.

#### Adding a new device or modifying information of an existing one

A device can only be identified by its notification token. When updating a device's information, we therefore check if the notification token already exists in Firestore. If it already exists, we update all other existing fields' values - otherwise, we create a new device.

A device may receive a different notification token at any time though. Therefore, we might create a new device, even though that device already exists in the table with a different (now inactive) notification token. Therefore, every time we send out a new notification and receive the information that a token is no longer active, we need to remove the device from this table.

### /users/$userId$/messages/$messageId$

This data is used to display messages to the patient describing recent changes in their respective data from clinicians (e.g. updated medication requests) or calls-to-action to the patient.

|Property|Type|Values|Comments|
|-|-|-|-|
|dueDate|optional DateTime|-|The due date of the message to be shown in-app.|
|completionDate|optional DateTime|-|Specifies when a message has been completed. TBD: Messages containing a completionDate may either be hidden on user's devices or be shown crossed out.|
|type|optional string|e.g. "questionnaireReminder"|Some messages are sent out on a regular basis, where only the most recent message is really relevant for the patient (e.g. a reminder for a questionnaire). With this property, we can easily find existing messages of the same type and replace them with a new one, if necessary.|
|title|LocalizedText|e.g. "Watch Welcome Video in Education Page."|May be localized.|
|description|optional LocalizedText|e.g. "The video shows how you will be able to use this app."|May be localized.|
|action|optional string|e.g. "videoSections/1/videos/0"|See "Message types".|
|isDismissible|boolean|true,false|Whether or not the message is dismissible by the user or is solely controlled by the server.|

#### Message types

The following list describes all different types a message could have. Expiration of messages should only be handled by the server, except for triggering the `dismissMessage` Firebase function call that adds a completion date when the message is dismissible and has been dismissed by the user. A client doesn't need to know about the `type` property, since we would otherwise need to check whether a new message type is supported by a client. It may also sort out message types unknown for the client's version.

|Type|Trigger|Expiration|Action|
|-|-|-|-|
|MedicationChange|Server: /users/$userId$/medicationRequests changed for a given user. Maximum 1 per day.|Tap|videoSections/$videoSectionId$/videos/$videoId$|
|WeightGain|Server: New body weight observation received with 3 lbs increase over prior week's median. Do not trigger again for 7 days.|Tap|medications|
|MedicationUptitration|Server: /users/$userId$/medicationRecommendations changed.|Tap|medications|
|Welcome|Server: When creating new user.|Tap|videoSections/$videoSectionId$/videos/$videoId$|
|Vitals|Server: Daily at certain time (respect timezone!)|When receiving blood pressure and weight observations on the server from current day.|observations|
|SymptomQuestionnaire|Server: Every 14 days.|After questionnaire responses received on server.|questionnaires/$questionnaireId$|
|PreAppointment|Server: Day (24h) before appointment.|After appointment time or when it is cancelled.|healthSummary|

### /users/$userId$/allergyIntolerances/$allergyIntoleranceId$

Based on [FHIR AllergyIntolerance](https://hl7.org/fhir/R4B/allergyintolerance.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|type|optional [allergyIntoleranceType](https://hl7.org/fhir/R4B/valueset-allergy-intolerance-type.html)|e.g. "allergy", "intolerance"||
|code|CodableContent|e.g. "{"coding":[{"system":"https://hl7.org/fhir/R4B/valueset-allergyintolerance-code.html","code":"293963004","display":"Cardioselective beta-blocker allergy"}],"text":"Cardioselective beta-blocker allergy"}"|Uses either [AllergyIntoleranceCode](https://hl7.org/fhir/R4B/valueset-allergyintolerance-code.html), `medicationId` as used in /medications/$medicationId$ and/or `medicationId` as used in /medicationClasses/$medicationClassId$.|
|patient|string|-|`userId` as used in /users/$userId$ and related collections.|

Q: Which codes should we use for contra-indications? We could simply assume a limited set for now (i.e. the ones we allow for selection in the web dashboard), but when interfacing with an EHR, we would need to be able to consider all relevant codes in the algorithm(s).

#### Relevant codes

Here we keep a list of relevant codes for medication classes & medications for use in /medications, /medicationClasses and /users/$userId$/allergyIntolerances/$allergyIntoleranceId$.

##### Medication classes

|Medication class|SNOMED CT name|code|
|-|-|-|
|Beta blocker|Substance with beta adrenergic receptor antagonist mechanism of action (substance)|[373254001](https://browser.ihtsdotools.org/?perspective=full&conceptId1=373254001)|
|SGLT2i|Substance with sodium glucose cotransporter subtype 2 inhibitor mechanism of action (substance)|[703673007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=703673007)|
|MRA|Substance with aldosterone receptor antagonist mechanism of action (substance)|[372603003](https://browser.ihtsdotools.org/?perspective=full&conceptId1=372603003)|
|ACEI|Substance with angiotensin-converting enzyme inhibitor mechanism of action (substance)|[372733002](https://browser.ihtsdotools.org/?perspective=full&conceptId1=372733002)|
|ARB|Substance with renin-angiotensin system inhibitor mechanism of action (substance)|[866173006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=866173006)|
|ARNI|Substance with neprilysin inhibitor mechanism of action (substance)|[786886009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=786886009)|
|Diuretics|Diuretic (substance)|[372695000](https://browser.ihtsdotools.org/?perspective=full&conceptId1=372695000)|

###### Medications & Doses

|Medication|Dose|Code|
|-|-|-|
|Metoprolol succinate|-|[412432007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=412432007)|
|Metoprolol succinate ER|25mg|[879978003](https://browser.ihtsdotools.org/?perspective=full&conceptId1=879978003)|
|Metoprolol succinate ER|50mg|[879979006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=879979006)|
|Metoprolol succinate ER|100mg|[879980009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=879980009)|
|Metoprolol succinate ER|200mg|[879981008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=879981008)|
|Carvedilol|-|[386870007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=386870007)|
|Carvedilol|3.125mg|[318633000](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318633000)|
|Carvedilol|6.25mg|[318635007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318635007)|
|Carvedilol|12.5mg|[318631003](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318631003)|
|Carvedilol|25mg|[318632005](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318632005)|
|Carvedilol phosphate|-|[426471008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=426471008)|
|Carvedilol phosphate ER|10mg|[1187445001](https://browser.ihtsdotools.org/?perspective=full&conceptId1=1187445001)|
|Carvedilol phosphate ER|20mg|[1187446000](https://browser.ihtsdotools.org/?perspective=full&conceptId1=1187446000)|
|Carvedilol phosphate ER|40mg|[1208576006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=1208576006)|
|Carvedilol phosphate ER|80mg|[1208577002](https://browser.ihtsdotools.org/?perspective=full&conceptId1=1208577002)|
|Bisoprolol|-|[386868003](https://browser.ihtsdotools.org/?perspective=full&conceptId1=386868003)|
|Bisoprolol|5mg|[318590006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318590006)|
|Bisoprolol|10mg|[318591005](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318591005)|
|Dapagliflozin|-|[703674001](https://browser.ihtsdotools.org/?perspective=full&conceptId1=703674001)|
|Dapagliflozin|10mg|[1145541007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=1145541007)|
|Empagliflozin|-|[703894008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=703894008)|
|Empagliflozin|10mg|[703896005](https://browser.ihtsdotools.org/?perspective=full&conceptId1=703896005)|
|Empagliflozin|25mg|[703897001](https://browser.ihtsdotools.org/?perspective=full&conceptId1=703897001)|
|Sotagliflozin|-|TBD|
|Sotagliflozin|200mg|TBD|
|Sotagliflozin|400mg|TBD|
|Bexagliflozin|-|TBD|
|Bexagliflozin|20mg|TBD|
|Canagliflozin|-|[703676004](https://browser.ihtsdotools.org/?perspective=full&conceptId1=703676004)|
|Canagliflozin|100mg|[703682001](https://browser.ihtsdotools.org/?perspective=full&conceptId1=703682001)|
|Canagliflozin|300mg|[765627002](https://browser.ihtsdotools.org/?perspective=full&conceptId1=765627002)|
|Ertugliflozin|-|[764274008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=764274008)|
|Ertugliflozin|5mg|[1162397007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=1162397007)|
|Ertugliflozin|15mg|[1162394000](https://browser.ihtsdotools.org/?perspective=full&conceptId1=1162394000)|
|Spironolactone|-|[387078006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=387078006)|
|Spironolactone|25mg|[318056008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318056008)|
|Spironolactone|50mg|[318057004](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318057004)|
|Spironolactone|100mg|[318058009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318058009)|
|Eplerenone|-|[407010008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=407010008)|
|Eplerenone|25mg|[407011007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=407011007)|
|Eplerenone|50mg|[407012000](https://browser.ihtsdotools.org/?perspective=full&conceptId1=407012000)|
|Quinapril|-|[386874003](https://browser.ihtsdotools.org/?perspective=full&conceptId1=386874003)|
|Quinapril|5mg|[318885001](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318885001)|
|Quinapril|10mg|[318886000](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318886000)|
|Quinapril|20mg|[318887009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318887009)|
|Quinapril|40mg|[318894007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318894007)|
|Perindopril|-|[372916001](https://browser.ihtsdotools.org/?perspective=full&conceptId1=372916001)|
|Perindopril|2mg|[318896009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318896009)|
|Perindopril|4mg|[318897000](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318897000)|
|Perindopril|8mg|[374667004](https://browser.ihtsdotools.org/?perspective=full&conceptId1=374667004)|
|Ramipril|-|[386872004](https://browser.ihtsdotools.org/?perspective=full&conceptId1=386872004)|
|Ramipril|1.25mg|tablet: [408040007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=408040007), capsule: [318900007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318900007)|
|Ramipril|2.5mg|tablet: [408050008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=408050008), capsule: [318901006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318901006)|
|Ramipril|5mg|tablet: [408051007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=408051007), capsule: [318902004](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318902004)|
|Ramipril|10mg|tablet: [408052000](https://browser.ihtsdotools.org/?perspective=full&conceptId1=408052000), capsule: [318906001](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318906001)|
|Benazepril|-|[372511001](https://browser.ihtsdotools.org/?perspective=full&conceptId1=372511001)|
|Benazepril|5mg|[376516008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=376516008)|
|Benazepril|10mg|[376518009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=376518009)|
|Benazepril|20mg|[376520007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=376520007)|
|Benazepril|40mg|[376521006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=376521006)|
|Captopril|-|[387160004](https://browser.ihtsdotools.org/?perspective=full&conceptId1=387160004)|
|Captopril|12.5mg|[318820009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318820009)|
|Captopril|25mg|[318821008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318821008)|
|Captopril|50mg|[318824000](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318824000)|
|Captopril|100mg|[375105000](https://browser.ihtsdotools.org/?perspective=full&conceptId1=375105000)|
|Enalapril|-|[372658000](https://browser.ihtsdotools.org/?perspective=full&conceptId1=372658000)|
|Enalapril|2.5mg|[318850001](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318850001)|
|Enalapril|5mg|[318851002](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318851002)|
|Enalapril|10mg|[318853004](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318853004)|
|Enalapril|20mg|[318855006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318855006)|
|Lisinopril|-|[386873009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=386873009)|
|Lisinopril|2.5mg|[318857003](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318857003)|
|Lisinopril|5mg|[318858008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318858008)|
|Lisinopril|10mg|[318859000](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318859000)|
|Lisinopril|20mg|[318860005](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318860005)|
|Lisinopril|30mg|[374040006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=374040006)|
|Lisinopril|40mg|[376772000](https://browser.ihtsdotools.org/?perspective=full&conceptId1=376772000)|
|Fosinopril|-|[372510000](https://browser.ihtsdotools.org/?perspective=full&conceptId1=372510000), sodium: [108570006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=108570006)|
|Fosinopril|10mg|sodium: [318909008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318909008)|
|Fosinopril|20mg|sodium: [318910003](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318910003)|
|Fosinopril|40mg|sodium: [376699008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=376699008)|
|Trandolapril|-|[386871006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=386871006)|
|Trandolapril|1mg|[375094007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=375094007)|
|Trandolapril|2mg|[375095008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=375095008)|
|Trandolapril|4mg|[375096009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=375096009)|
|Moexipril|-|[373442003](https://browser.ihtsdotools.org/?perspective=full&conceptId1=373442003)|
|Moexipril|7.5mg|[318934008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318934008)|
|Moexipril|15mg|[318935009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318935009)|
|Losartan|-|[373567002](https://browser.ihtsdotools.org/?perspective=full&conceptId1=373567002), potassium: [108582002](https://browser.ihtsdotools.org/?perspective=full&conceptId1=108582002)|
|Losartan|25mg|potassium: [318955005](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318955005)|
|Losartan|50mg|potassium: [318956006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318956006)|
|Losartan|100mg|potassium: [407784004](https://browser.ihtsdotools.org/?perspective=full&conceptId1=407784004)|
|Valsartan|-|[386876001](https://browser.ihtsdotools.org/?perspective=full&conceptId1=386876001)|
|Valsartan|40mg|[416515008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=416515008)|
|Valsartan|80mg|[375034009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=375034009)|
|Valsartan|160mg|[375035005](https://browser.ihtsdotools.org/?perspective=full&conceptId1=375035005)|
|Valsartan|320mg|[376487009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=376487009)|
|Candesartan|-|[372512008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=372512008)|
|Candesartan|2mg|cilexetil: [318977009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318977009)|
|Candesartan|4mg|cilexetil: [318978004](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318978004)|
|Candesartan|8mg|cilexetil: [318979007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318979007)|
|Candesartan|16mg|cilexetil: [318980005](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318980005)|
|Candesartan|32mg|cilexetil: [376998003](https://browser.ihtsdotools.org/?perspective=full&conceptId1=376998003)|
|Irbesartan|-|[386877005](https://browser.ihtsdotools.org/?perspective=full&conceptId1=386877005)|
|Irbesartan|75mg|[318968002](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318968002)|
|Irbesartan|150mg|[318969005](https://browser.ihtsdotools.org/?perspective=full&conceptId1318969005)|
|Irbesartan|300mg|[318970006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318970006)|
|Telmisartan|-|[387069000](https://browser.ihtsdotools.org/?perspective=full&conceptId1=387069000)|
|Telmisartan|20mg|[134463001](https://browser.ihtsdotools.org/?perspective=full&conceptId1=134463001)|
|Telmisartan|40mg|[318986004](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318986004)|
|Telmisartan|80mg|[318987008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318987008)|
|Olmesartan|-|[412259001](https://browser.ihtsdotools.org/?perspective=full&conceptId1=412259001), medoxomil: [412260006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=412260006)|
|Olmesartan|5mg|medoxomil: [385541002](https://browser.ihtsdotools.org/?perspective=full&conceptId1=385541002)|
|Olmesartan|10mg|medoxomil: [408055003](https://browser.ihtsdotools.org/?perspective=full&conceptId1=408055003)|
|Olmesartan|20mg|medoxomil: [385542009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=385542009)|
|Olmesartan|40mg|medoxomil: [385543004](https://browser.ihtsdotools.org/?perspective=full&conceptId1=385543004)|
|Azilsartan|-|[385542009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=385542009), medoxomil: [449561004](https://browser.ihtsdotools.org/?perspective=full&conceptId1=449561004)|
|Azilsartan|20mg|medoxomil: [895430006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=895430006)|
|Azilsartan|40mg|medoxomil: [1137333005](https://browser.ihtsdotools.org/?perspective=full&conceptId1=1137333005)|
|Azilsartan|80mg|medoxomil: [1137623008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=1137623008)|
|Eprosartan|-|[396044005](https://browser.ihtsdotools.org/?perspective=full&conceptId1=396044005), mesilate: [129488003](https://browser.ihtsdotools.org/?perspective=full&conceptId1=129488003)|
|Eprosartan|300mg|mesilate: [318994006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318994006)|
|Eprosartan|400mg|mesilate: [318995007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318995007)|
|Eprosartan|600mg|mesilate: [318996008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318995007)|
|Eprosartan|800mg|TBD|
|Sacubitril- Valsartan|-|[777480008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=777480008)|
|Sacubitril- Valsartan|24-26mg|[1162681006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=1162681006)|
|Sacubitril- Valsartan|49-51mg|[1162682004](https://browser.ihtsdotools.org/?perspective=full&conceptId1=1162682004)|
|Sacubitril- Valsartan|97-103mg|[1162718004](https://browser.ihtsdotools.org/?perspective=full&conceptId1=1162718004)|
|Furosemide|-|[387475002](https://browser.ihtsdotools.org/?perspective=full&conceptId1=387475002)|
|Furosemide|20mg|[317971007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=317971007)|
|Furosemide|40mg|[317972000](https://browser.ihtsdotools.org/?perspective=full&conceptId1=317972000)|
|Furosemide|80mg|[395510001](https://browser.ihtsdotools.org/?perspective=full&conceptId1=395510001)|
|Furosemide|100mg|[1187430008](https://browser.ihtsdotools.org/?perspective=full&conceptId1=1187430008)|
|Furosemide|500mg|[317973005](https://browser.ihtsdotools.org/?perspective=full&conceptId1=317973005)|
|Bumetanide|-|[387498005](https://browser.ihtsdotools.org/?perspective=full&conceptId1=387498005)|
|Bumetanide|0.5mg|[375553009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=375553009)|
|Bumetanide|1mg|[318021009](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318021009)|
|Bumetanide|2mg|[375648005](https://browser.ihtsdotools.org/?perspective=full&conceptId1=375648005)|
|Bumetanide|5mg|[318022002](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318022002)|
|Torsemide|-|[108476002](https://browser.ihtsdotools.org/?perspective=full&conceptId1=108476002)|
|Torsemide|2.5mg|[318040003](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318040003)|
|Torsemide|5mg|[318041004](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318041004)|
|Torsemide|10mg|[318042006](https://browser.ihtsdotools.org/?perspective=full&conceptId1=318042006)|
|Torsemide|20mg|[375711005](https://browser.ihtsdotools.org/?perspective=full&conceptId1=375711005)|
|Torsemide|40mg|TBD|
|Torsemide|60mg|TBD|
|Torsemide|100mg|[375714002](https://browser.ihtsdotools.org/?perspective=full&conceptId1=375714002)|
|Ethacrynic Acid|-|[373536004](https://browser.ihtsdotools.org/?perspective=full&conceptId1=373536004)|
|Ethacrynic Acid|25mg|[376668007](https://browser.ihtsdotools.org/?perspective=full&conceptId1=376668007)|
|Ethacrynic Acid|50mg|[376679002](https://browser.ihtsdotools.org/?perspective=full&conceptId1=376679002)|

### /users/$userId$/medicationRequests/$medicationRequestId$

Based on [FHIR MedicationRequest](https://hl7.org/fhir/R4B/medicationrequest.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|medication|Reference(Medication) or CodeableConcept|-|CodeableConcept containing one of the codes from /medications/$medicationId$|
|dosageInstruction|Dosage|-|-|
|patient|string|e.g. "allergy", "intolerance"|`userId` as used in /users/$userId$ and related collections.|

The `dosageInstruction` property may contain values with the following properties:

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|text|optional string|-|Free text dosage instructions|
|additionalInstruction|list of CodableConcept|information like "with meals", "may cause drowsiness", etc|Supplemental instruction or warnings to the patient|
|patientInstruction|optional string|-|Patient or consumer oriented instructions|
|timing|optional [Timing](https://hl7.org/fhir/R4B/datatypes.html#timing)|-|When medication should be administered|
|doseAndRate|list of Element|-|Amount of medication administered|
|doseAndRate>type|optional [DoseRateType](https://hl7.org/fhir/R4B/codesystem-dose-rate-type.html)|e.g. "calculated", "ordered"||
|doseAndRate>dose|optional [SimpleQuantity](https://hl7.org/fhir/R4B/datatypes.html#SimpleQuantity)|-|TBD: We should either use "pills" or some weight unit here.|
|maxDosePerPeriod|optional [Ratio](https://hl7.org/fhir/R4B/datatypes.html#ratio)|-|Upper limit on medication per unit of time|
|maxDosePerAdministration|optional [SimpleQuantity](https://hl7.org/fhir/R4B/datatypes.html#SimpleQuantity)|-|Upper limit on medication per administration|
|maxDosePerLifetime|optional [SimpleQuantity](https://hl7.org/fhir/R4B/datatypes.html#SimpleQuantity)|-|Upper limit on medication per unit of time|

There may be up to three intakes per day (morning, mid-day and evening) with either 0.5, 1 or 2 pills. The dosages should always be grouped by medication, i.e. there should not be multiple medication elements concerning the same medication but different dosage instructions. Instead, one medication element shall be used for that medication with multiple dosage instructions.

### Observations

We are storing different observations grouped by their type, e.g. we use /users/$userId$/bodyWeightObservations/$observationId$ for body weight observations and /users/$userId$/bloodPressureObservations/$observationId$ for blood pressure observations. The different collections are all listed below and they follow the specification of a FHIR observation as defined here with more strict specification following in the respective subsections.

Based on [FHIR Observation](https://hl7.org/fhir/R4B/observation.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|status|[ObservationStatus](https://hl7.org/fhir/R4B/valueset-observation-status.html)|e.g. "final"|This value is most likely "final" in every case.|
|code|[Code](https://hl7.org/fhir/R4B/valueset-observation-codes.html)|e.g. `{"system":"http://loinc.org","code":"55423-8","display":"Number of steps"}`|Use one of the codes mentioned below.|
|value|optional [Quantity](https://hl7.org/fhir/R4B/datatypes.html#Quantity)|e.g. `{"code":"mm[Hg]","system":"http://unitsofmeasure.org","unit":"mmHg","value":120}`|Use one of the units listed below.|
|component|list of components|-|Instead of containing a single `value` property, some observations are composed of multiple components (e.g. a blood pressure observation contains a diastolic and systolic component).|
|component[x]>code|[Code](https://hl7.org/fhir/R4B/valueset-observation-codes.html)|e.g. `{"system":"http://loinc.org","code":"55423-8","display":"Number of steps"}`|Use one of the codes mentioned below.|
|component[x]>value|optional [Quantity](https://hl7.org/fhir/R4B/datatypes.html#Quantity)|e.g. `{"code":"mm[Hg]","system":"http://unitsofmeasure.org","unit":"mmHg","value":120}`|Use one of the units listed below.|
|effective|[Period](https://hl7.org/fhir/R4B/datatypes.html#period), [Instant](https://hl7.org/fhir/R4B/datatypes.html#instant) or [DateTime](https://hl7.org/fhir/R4B/datatypes.html#dateTime)|-|Use DateTime/Instant for instant observation and periods for longer observations (e.g. more than 1 minute).|

#### /users/$userId$/bloodPressureObservations/$observationId$

Blood pressure observations contain the following code and no value.

|code>system|code>code|code>display|
|-|-|-|
|"https://loinc.org"|"85354-9"|"Blood pressure panel with all children optional"|

Further, blood pressure observations have two components.

|code>system|code>code|code>display|value>system|value>value|value>code|value>unit|
|-|-|-|-|-|-|-|
|"http://loinc.org"|"8462-4"|"Diastolic blood pressure"|"http://unitsofmeasure.org"|double|"mm[Hg]"|"mmHg"|
|"http://loinc.org"|"8480-6"|"Systolic blood pressure"|"http://unitsofmeasure.org"|double|"mm[Hg]"|"mmHg"|

#### /users/$userId$/bodyWeightObservations/$observationId$

Body weight observations contain the following code and value.

|code>system|code>code|code>display|value>system|value>value|value>code|value>unit|
|-|-|-|-|-|-|-|
|"http://loinc.org"|"29463-7"|"Body weight"|double|"http://unitsofmeasure.org"|"kg"|"kg"|

#### /users/$userId$/heartRateObservations/$observationId$

Heart rate observations contain the following code and value.

|code>system|code>code|code>display|value>system|value>value|value>code|value>unit|
|-|-|-|-|-|-|-|
|"http://loinc.org"|"8867-4"|"Heart rate"|double|"http://unitsofmeasure.org"|"/min"|"beats/minute"|

### /users/$userId$/questionnaireResponses/$questionnaireResponseId$

Based on [FHIR QuestionnaireResponse](https://hl7.org/fhir/R4B/questionnaireresponse.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|questionnaire|string|-|canonical representation of the questionnaire, i.e. t|
|author|string|-|The patient's `userId`|
|authored|DateTime|-|The date the answers were gathered.|
|status|[QuestionnaireResponseStatus](https://hl7.org/fhir/R4B/valueset-questionnaire-answers-status.html)|-|Will most likely always be `completed`.|
|item|list of Item|-|-|
|item[x]>linkId|string|-|Pointer to specific item from questionnaire|
|item[x]>definition|optional uri|-|details for item|
|item[x]>text|optional string|-|Name for group or question text|
|item[x]>answer|list of Answer|-|response(s) to the question|
|item[x]>answer[y]>value|any|-|Value depending on the type of question in the survey, e.g. boolean, integer, date, string, etc|
