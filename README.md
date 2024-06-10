# ENGAGE-HF Firebase

Firebase cloud hosting infrastructure for the ENGAGE-HF project.

# Data Scheme

This document describes how data is stored in Firestore for the Engage-HF app.

## Custom Types

The following section describes custom types defined for this system to be later used

### LocalizedText

A LocalizedText object shall be used whenever text requires localization or may require in the future. The object may either simply be a single string (in the case of localizations not being available yet) or a dictionary with string keys and string values. If LocalizedText is represented by a string-string dictionary, the keys represent language-codes following the ISO 639-1 (or if necessary ISO 639-2) standard and the respective text in the given language as value.

Some localizations may require to include regions as well (e.g. Australian/British/American English), so the clients should be aware of this and prioritize the language code with the correct region (`en-us`) over the general code (`en`), if it is present.

Example:
```
{
	"en":"Welcome to the Engage-HF app!",
	"de":"Willkommen in der Engage-HF App!",
	"es":"¡Bienvenido a la aplicación Engage-HF!"
}
```

A LocalizedText object cannot be used in FHIR-conforming types due to its incompatibility with the standard. FHIR types commonly contain text in one language only to be specified using the `language` property.

## /questionnaires

In this section, we describe all the information stored for questionnaires.

### /questionnaires/$questionnaireId$

Based on [FHIR Questionnaire](https://hl7.org/fhir/R4B/questionnaire.html):

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|meta|Meta|-|[Resource](https://hl7.org/fhir/R4B/resource.html#Meta): Metadata about the resource|
|identifier|list of Identifier|-|Business identifier for this questionnaire. There may be multiple questionnaire objects in this list, with differing `id` and `language` properties, but a common business identifier.|
|title|string|-|Human-friendly title of the questionnaire.|
|date|DateTime|-|last modified date|
|version|string|-|Business version of the questionnaire.|
|item|list of BackboneElement|-|items as defined in [FHIR Questionnaire](https://hl7.org/fhir/R4B/questionnaire.html)|
|language|optional string|e.g. "en"|Following IETF BCP-47 / [FHIR ValueSet languages](https://hl7.org/fhir/R4B/valueset-languages.html)|

#### Items

Items are commonly encoded using the following properties:

|Property|Type|Values|Comments|
|-|-|-|-|
|linkId|string|-|Unique id for item in questionnaire|
|definition|optional uri|-|Details for the item|
|prefix|optional string|e.g. "1(a)", "2.5.3"|Prefix of the item that isn't actually part of the name but may still be displayed.|
|text|string|-|Primary text for the item|
|type|code|e.g. "group", "display", "boolean", "decimal", "integer", "date", etc|See [QuestionnaireItemType](https://hl7.org/fhir/R4B/valueset-item-type.html) for available values.|
|date|DateTime|-|last modified date|

#### Example

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

### /medicationClasses/$medicationClassId$

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|e.g. "BETABLOCKER"||
|name|LocalizedText|-|A name for a given medicationClass to be displayed to a user.|
|videoPath|string|e.g. "/videoSectionId/1/videos/2"|The path to retrieve the respective video from Firestore.|

## /videoSections

In this section, we describe all data related to educational videos to be shown in the Engage-HF mobile apps. The videos are grouped into different categories to be displayed as sections in the mobile apps.

### /videoSections/$videoSectionId$

|Property|Type|Values|Comments|
|-|-|-|-|
|title|LocalizedText|e.g. "ENGAGE-HF Application"|May be localized.|
|description|LocalizedText|e.g. "Helpful videos on the ENGAGE-HF mobile application."|May be localized. Are there different videos / videoSections for each platform?|
|orderIndex|integer|e.g. 1|Since Firestore collections aren't necessarily ordered, we have this property to order the elements by on the clients. The list is supposed to be ordered ascending by `orderIndex`.|

### /videoSections/$videoSectionId$/videos/$videoId$

|Property|Type|Values|Comments|
|-|-|-|-|
|title|LocalizedText|e.g. "Beta Blockers for Heart Failure"|May be localized.|
|url|LocalizedText|e.g. "https://youtu.be/XfgcXkq61k0"|May be localized.|
|orderIndex|integer|e.g. 1|Since Firestore collections aren't necessarily ordered, we have this property to order the elements by on the clients. The list is supposed to be ordered ascending by `orderIndex`.|

## /users/$userId$

In this section, we describe all user-related data to be stored. The security rules shall be set up in a way to only allow for a patient to access its own information and a clinician to access all patients' information (or even more restrictive, if needed).

|Property|Type|Values|Comments|
|-|-|-|-|
|fullName|string|-|Contains a user's full name. TBD: May potentially be split up into firstName/lastName or firstName/middleNames/familyName.|
|dateOfBirth|Date|-|To be used for verification purposes.|
|invitationCode|string|-|The invitationCode to be used when logging in to the app for the first time.|
|language|optional string|e.g. "en"|Following IETF BCP-47 / [FHIR ValueSet languages](https://hl7.org/fhir/R4B/valueset-languages.html)|

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

Push notifications over APNS / FCM only contain text in a single language. For this, the device's `language` property shall be prioritized, falling back on the user's `language` property and using US-English if both are not present.

#### Adding a new device or modifying information of an existing one

A device can only be identified by its notification token. When updating a device's information, we therefore check if the notification token already exists in Firestore. If it already exists, we update all other existing fields' values - otherwise, we create a new device.

A device may receive a different notification token at any time though. Therefore, we might create a new device, even though that device already exists in the table with a different (now inactive) notification token. Therefore, every time we send out a new notification and receive the information that a token is no longer active, we need to remove the device from this table.

### /users/$userId$/messages/$messageId$

|Property|Type|Values|Comments|
|-|-|-|-|
|dueDate|optional DateTime|-|The due date of the message to be shown in-app.|
|triggerDate|optional DateTime|-|A date to trigger a notification on the device. If not set, then there is no notification to trigger. The notification should be triggered by the server. TBD: Are there cases where a message would trigger multiple times or event- rather than date-driven?|
|completionDate|optional DateTime|-|Specifies when a message has been completed. TBD: Messages containing a completionDate may either be hidden on user's devices or be shown crossed out.|
|type|optional string|e.g. "questionnaireReminder"|Some messages are sent out on a regular basis, where only the most recent message is really relevant for the patient (e.g. a reminder for a questionnaire). With this property, we can easily find existing messages of the same type and replace them with a new one, if necessary.|
|title|LocalizedText|e.g. "Watch Welcome Video in Education Page."|May be localized.|
|description|optional LocalizedText|e.g. "The video shows how you will be able to use this app."|May be localized.|
|action|optional string|e.g. "engage-hf:/videoSections/engage-hf/videos/welcome"|See "Available message actions".|

#### Available message actions

TODO: This subsection shall describe the format of actions to be performed by the clients on tap of a message.

### /users/$userId$/allergyIntolerances/$allergyIntoleranceId$

Based on [FHIR AllergyIntolerance](https://hl7.org/fhir/R4B/allergyintolerance.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|type|optional [allergyIntoleranceType](https://hl7.org/fhir/R4B/valueset-allergy-intolerance-type.html)|e.g. "allergy", "intolerance"||
|code|CodableContent|e.g. "{"coding":[{"system":"https://hl7.org/fhir/R4B/valueset-allergyintolerance-code.html","code":"293963004","display":"Cardioselective beta-blocker allergy"}],"text":"Cardioselective beta-blocker allergy"}"|Uses either [AllergyIntoleranceCode](https://hl7.org/fhir/R4B/valueset-allergyintolerance-code.html), `medicationId` as used in /medications/$medicationId$ and/or `medicationId` as used in /medicationClasses/$medicationClassId$.|
|patient|string|-|`userId` as used in /users/$userId$ and related collections.|

### /users/$userId$/medicationRequests/$medicationRequestId$

Based on [FHIR MedicationRequest](https://hl7.org/fhir/R4B/medicationrequest.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|type|optional [allergyIntoleranceType](https://hl7.org/fhir/R4B/valueset-allergy-intolerance-type.html)|e.g. "allergy", "intolerance"||
|code|CodableContent|e.g. "{"coding":[{"system":"https://hl7.org/fhir/R4B/valueset-allergyintolerance-code.html","code":"293963004","display":"Cardioselective beta-blocker allergy"}],"text":"Cardioselective beta-blocker allergy"}"|Uses either [AllergyIntoleranceCode](https://hl7.org/fhir/R4B/valueset-allergyintolerance-code.html), `medicationId` as used in /medications/$medicationId$ and/or `medicationId` as used in /medicationClasses/$medicationClassId$.|
|dosageInstruction|Dosage|-|-|
|patient|string|e.g. "allergy", "intolerance"|`userId` as used in /users/$userId$ and related collections.|

Q: Which codes should we use for contra-indications? We could simply assume a limited set for now (i.e. the ones we allow for selection in the web dashboard), but when interfacing with an EHR, we would need to be able to consider all relevant codes in the algorithm(s).

#### /users/$userId$/medicationRequests/$medicationRequestId$/dosageInstruction

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|text|optional string|-|Free text dosage instructions|
|additionalInstruction|list of CodableConcept|information like "with meals", "may cause drowsiness", etc|Supplemental instruction or warnings to the patient|
|patientInstruction|optional string|-|Patient or consumer oriented instructions|
|timing|optional [Timing](https://hl7.org/fhir/R4B/datatypes.html#timing)|-|When medication should be administered|
|doseAndRate|list of Element|-|Amount of medication administered|
|doseAndRate>type|optional [DoseRateType](https://hl7.org/fhir/R4B/codesystem-dose-rate-type.html)|e.g. "calculated", "ordered"||
|doseAndRate>dose|[Range](https://hl7.org/fhir/R4B/datatypes.html#Range) or [SimpleQuantity](https://hl7.org/fhir/R4B/datatypes.html#SimpleQuantity)|-|-|
|doseAndRate>rate|[Ratio](https://build.fhir.org/datatypes.html#ratio) or [Range](https://hl7.org/fhir/R4B/datatypes.html#Range) or [SimpleQuantity](https://hl7.org/fhir/R4B/datatypes.html#SimpleQuantity)|-|-|
|maxDosePerPeriod|optional [Ratio](https://build.fhir.org/datatypes.html#ratio)|-|Upper limit on medication per unit of time|
|maxDosePerAdministration|optional [SimpleQuantity](https://build.fhir.org/datatypes.html#SimpleQuantity)|-|Upper limit on medication per administration|
|maxDosePerLifetime|optional [SimpleQuantity](https://build.fhir.org/datatypes.html#SimpleQuantity)|-|Upper limit on medication per unit of time|

TBD: Which timings, doses and rates does the system need to be able to work with? How does this differ between input and processing (e.g. an algorithm might only be interested in the total amount administered per day/week)?

### /users/$userId$/observations/$observationId$

Based on [FHIR Observation](https://hl7.org/fhir/R4B/observation.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|identifier|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|

#### Blood Pressure

```
{
	"code": "mm[Hg]",
	"system": "http://unitsofmeasure.org",
	"unit": "mmHg",
	"value": 120
}
```

#### Body Mass

codes:

```
{
	"code": "29463-7",
	"display": "Body weight",
	"system": "http://loinc.org"
}
```

```
{
	"code": "HKQuantityTypeIdentifierBodyMass",
	"display": "Body Mass",
	"system": "http://developer.apple.com/documentation/healthkit"
}
```

TODO: Health Connect?!

values:

```
{
	"code": "[lb_av]",
	"system": "http://unitsofmeasure.org",
	"unit": "lbs",
	"value": 60
}
```

#### Body Mass (Lean)

codes:

```
{
	"code": "91557-9",
	"display": "Lean body weight",
	"system": "http://loinc.org"
}
```

```
{
	"code": "HKQuantityTypeIdentifierLeanBodyMass",
	"display": "Lean Body Mass",
	"system": "http://developer.apple.com/documentation/healthkit"
}
```

TODO: HealthConnect?!

values:

```
{
	"code": "[lb_av]",
	"system": "http://unitsofmeasure.org",
	"unit": "lbs",
	"value": 60
}
```

### /users/$userId$/questionnaireResponses/$questionnaireResponseId$

Based on [FHIR QuestionnaireResponse](https://hl7.org/fhir/R4B/questionnaireresponse.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
