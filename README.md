<!-- 
This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project 
SPDX-FileCopyrightText: 2023 Stanford University
SPDX-License-Identifier: MIT 
-->

# ENGAGE-HF Firebase

Firebase cloud hosting infrastructure for the ENGAGE-HF project.

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

## invitations/$invitationId$

When a patient joins Engage-HF, we first create an invitation code on demand of an operator of the web dashboard. Upon entering the invitation code using an anonymous login, the userId is set. After successful registration, the user object will be fully created and the invitation is removed from this collection.

|Property|Type|Values|Comments|
|-|-|-|-|
|userId|optional string|-|The userId associated with the invitation. This is set when an anonymous user has entered an invitation code, but has not used a proper account to log in yet.|
|auth|optional Auth|Authentication information to be set when redeeming invitation.Will be undefined once invitation has been redeemed.|
|auth>displayName|optional string|Display name for the user.|
|auth>email|optional string|E-Mail address of the user.|
|auth>phoneNumber|optional string|Phone number of the user.|
|auth>photoURL|optional string|URL for a photo of the user.|
|user|optional User|See users/$userId$ for full specification. Will be undefined once invitation has been redeemed.|
|clinician|optional Clinician|See clinicians/$userId$ for full specification. Will be undefined once invitation has been redeemed.|
|patient|optional Patient|See patientts/$userId$ for full specification. Will be undefined once invitation has been redeemed.|

## medications

In this section, we describe information regarding all the medications to be specified in the Engage-HF context. These medications may be used by a clinician for medication requests to a patient (patients/$userId$/medicationRequests) or contra-indications (patients/$userId$/allergyIntolerances). The medications are generated from [functions/data/medicationCodes.json](functions/data/medicationCodes.json) file containing medications (incl. respective RxNorm SCD type codes) grouped by medication classes.

### medications/$medicationId$

Based on [FHIR Medication](https://hl7.org/fhir/R4B/medication.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|code|FHIRCodeableConcept|-|FHIRCodeableConcept containing an RxNorm code of the IN/MIN type, a display name and the RxNorm system url.|
|extension|list of Extension|-|See /medications/$medicationId$/extension for possible values|

Based on the [Extension](https://hl7.org/fhir/R4B/extensibility.html#Extension) format specified in FHIR, a medication may contain a list of these following extension properties. Each property will need to get a url assigned to fit the FHIR data format.

|Property|Type|Values|Comments|
|-|-|-|-|
|medicationClass|string|-|A `medicationClassId` referring to a medicationClass specified in /medicationClasses/$medicationClassId$. One medication object may contain multiple medicationClass extension properties.|
|minimumDailyDose|[SimpleQuantity](https://www.hl7.org/fhir/r4b/datatypes.html#SimpleQuantity)|-|Unit: mg/day. Occurs exactly once. Multi-ingredient pills contain an array of double rather than a double.|
|targetDailyDose|[SimpleQuantity](https://www.hl7.org/fhir/r4b/datatypes.html#SimpleQuantity)|-|Unit: mg/day. Occurs exactly once. Multi-ingredient pills contain an array of double rather than a double.|

### medications/$medicationId$/drugs/$drugId$

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|code|FHIRCodeableConcept|-|FHIRCodeableConcept containing an RxNorm code of the SCD type, a display name and the RxNorm system url.|
|ingredient|list of Ingredient|-|Use references to medications and strength for quantity information.|
|ingredient[x]>itemCodeableConcept|FHIRCodeableConcept|-|FHIRCodeableConcept containing an RxNorm code of the IN type, a display name and the RxNorm system url.|
|ingredient[x]>strength|Ratio|-|Uses "mg" as numerator unit, no denominator unit and denominator value is always 1.|

### medicationClasses/$medicationClassId$

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|-|
|name|LocalizedText|-|A name for a given medicationClass to be displayed to a user.|
|videoPath|string|e.g. "/videoSectionId/1/videos/2"|The path to retrieve the respective video from Firestore.|

## organizations/$organizationId$

|Property|Type|Values|Comments|
|-|-|-|-|
|name|string|e.g. "Stanford University"|-|
|contactName|string|e.g. "Alex Sandhu, MD"|-|
|phoneNumber|string|e.g. "(650) 493-5000"|-|
|emailAddress|string|e.g. "dothfteam@stanford.edu"|-|
|ssoProviderId|string|-|The providerId as used for single sign-on.|
|owners|list of string|-|All the userIds of the organization owners.|

## patients/$userId$

In this section, we describe all patient-related data to be stored.

|Property|Type|Values|Comments|
|-|-|-|-|
|dateOfBirth|Date|-|To be used for verification purposes.|
|clinician|optional string|-|userId of an associated clinician.|

### patients/$userId$/allergyIntolerances/$allergyIntoleranceId$

Based on [FHIR AllergyIntolerance](https://hl7.org/fhir/R4B/allergyintolerance.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|type|optional [allergyIntoleranceType](https://hl7.org/fhir/R4B/valueset-allergy-intolerance-type.html)|e.g. "allergy", "intolerance"|In addition to the FHIR defined value set, we also use "financial" - these values shall not be exposed to EHR systems.|
|code|CodableContent|e.g. "{"coding":[{"system":"https://hl7.org/fhir/R4B/valueset-allergyintolerance-code.html","code":"293963004","display":"Cardioselective beta-blocker allergy"}],"text":"Cardioselective beta-blocker allergy"}"|Uses either [AllergyIntoleranceCode](https://hl7.org/fhir/R4B/valueset-allergyintolerance-code.html), `medicationId` as used in /medications/$medicationId$ and/or `medicationId` as used in /medicationClasses/$medicationClassId$.|
|patient|string|-|`userId` as used in /users/$userId$ and related collections.|

We use RxNorm codes to identify contraindications using the following rules:

|Class|Medication|If allergy, not eligible for|If allergy with reaction type angioedema not eligible for|If intolerance not eligible for|If intolerance default to|If financial, not eligible for|
|-|-|-|-|-|-|-|-|-|-|-|-|-|-|
|BB|Metoprolol succinate ER|BB|BB|Metoprolol|Carvedilol|BB|
|BB|Carvedilol|BB|BB|Carvedilol|Metoprolol succinate|BB|
|BB|Carvedilol phosphate ER|BB|BB|Carvedilol|Metoprolol succinate|BB|
|BB|Bisoprolol|BB|BB|Bisoprolol|Carvedilol|BB|
|SGLT|Dapagliflozin|SGLT|SGLT|Dapagliflozin|Empagliflozin|SGLT|
|SGLT|Empagliflozin|SGLT|SGLT|Empagliflozin|Dapagliflozin|SGLT|
|SGLT|Sotagliflozin|SGLT|SGLT|Sotagliflozin|Empagliflozin|SGLT|
|SGLT|Bexagliflozin|SGLT|SGLT|Bexagliflozin|Empagliflozin|SGLT|
|SGLT|Canagliflozin|SGLT|SGLT|Canagliflozin|Empagliflozin|SGLT|
|SGLT|Ertugliflozin|SGLT|SGLT|Ertugliflozin|Empagliflozin|SGLT|
|MRA|Spironolactone|MRA|MRA|Spironolactone|Eplerenone|MRA|
|MRA|Eplerenone|MRA|MRA|Eplerenone|Spironolactone|MRA|
|ACE|Quinapril|ACEI|ACEI/ARB/ARNI|ACEI|Valsartan/ARNI|ACEI/ARB/ARNI|
|ACE|Perindopril|ACEI|ACEI/ARB/ARNI|ACEI|Valsartan/ARNI|ACEI/ARB/ARNI|
|ACE|Ramipril|ACEI|ACEI/ARB/ARNI|ACEI|Valsartan/ARNI|ACEI/ARB/ARNI|
|ACE|Benazepril|ACEI|ACEI/ARB/ARNI|ACEI|Valsartan/ARNI|ACEI/ARB/ARNI|
|ACE|Captopril|ACEI|ACEI/ARB/ARNI|ACEI|Valsartan/ARNI|ACEI/ARB/ARNI|
|ACE|Enalapril|ACEI|ACEI/ARB/ARNI|ACEI|Valsartan/ARNI|ACEI/ARB/ARNI|
|ACE|Lisinopril|ACEI|ACEI/ARB/ARNI|ACEI|Valsartan/ARNI|ACEI/ARB/ARNI|
|ACE|Fosinopril|ACEI|ACEI/ARB/ARNI|ACEI|Valsartan/ARNI|ACEI/ARB/ARNI|
|ACE|Trandolapril|ACEI|ACEI/ARB/ARNI|ACEI|Valsartan/ARNI|ACEI/ARB/ARNI|
|ACE|Moexepril|ACEI|ACEI/ARB/ARNI|ACEI|Valsartan/ARNI|ACEI/ARB/ARNI|
|ARB|Losartan|ARB/ARNI|ACEI/ARB/ARNI|ARB/ARNI|Lisinopril|ACEI/ARB/ARNI|
|ARB|Valsartan|ARB/ARNI|ACEI/ARB/ARNI|ARB/ARNI|Lisinopril|ACEI/ARB/ARNI|
|ARB|Candesartan|ARB/ARNI|ACEI/ARB/ARNI|ARB/ARNI|Lisinopril|ACEI/ARB/ARNI|
|ARB|Irbesartan|ARB/ARNI|ACEI/ARB/ARNI|ARB/ARNI|Lisinopril|ACEI/ARB/ARNI|
|ARB|Telmisartan|ARB/ARNI|ACEI/ARB/ARNI|ARB/ARNI|Lisinopril|ACEI/ARB/ARNI|
|ARB|Olmesartan|ARB/ARNI|ACEI/ARB/ARNI|ARB/ARNI|Lisinopril|ACEI/ARB/ARNI|
|ARB|Azilsartan|ARB/ARNI|ACEI/ARB/ARNI|ARB/ARNI|Lisinopril|ACEI/ARB/ARNI|
|ARB|Eprosartan|ARB/ARNI|ACEI/ARB/ARNI|ARB/ARNI|Lisinopril|ACEI/ARB/ARNI|
|ARNI|Sacubitril- Valsartan|ARB/ARNI|ACEI/ARB/ARNI|ARNI|Valsartan|ARNI|
|Diuretic|Furosemide||||||
|Diuretic|Bumetanide||||||
|Diuretic|Torsemide||||||
|Diuretic|Ethacrynic Acid||||||

### patients/$userId$/appointments

Based on [FHIR Appointment](https://hl7.org/fhir/R4B/appointment.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|status|[AppointmentStatus](https://hl7.org/fhir/R4B/valueset-appointmentstatus.html)|e.g. "booked"|-|
|created|Date||
|start|[Instant](https://hl7.org/fhir/R4B/datatypes.html#instant)|-|-|
|end|[Instant](https://hl7.org/fhir/R4B/datatypes.html#instant)|-|-|
|comment|optional string|-|May not be shown to the patient.|
|patientInstruction|optional string|-|May be shown to the patient.|
|participant|list of CodeableConcept|-|Must contain at least one element.|
|participant[x]>actor|Reference(Patient)|e.g. `patients/123`|The Firestore path to the patient.|
|participant[x]>status|[ParticipationStatus](https://hl7.org/fhir/R4B/valueset-participationstatus.html)|e.g. accepted, declined, tentative, needs-action|-|

### patients/$userId$/medicationRequests/$medicationRequestId$

Based on [FHIR MedicationRequest](https://hl7.org/fhir/R4B/medicationrequest.html), the following properties may be used, while additional properties are ignored by the Engage-HF system. Clients may ignore this list and simply query for patients/$userId$/medicationRecommendations and retrieve the relevant requests from the recommendations.

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
|doseAndRate>dose|optional [SimpleQuantity](https://hl7.org/fhir/R4B/datatypes.html#SimpleQuantity)|-|Unit is always "tablet". Value is usually 0.5, 1 or 2.|
|maxDosePerPeriod|optional [Ratio](https://hl7.org/fhir/R4B/datatypes.html#ratio)|-|Upper limit on medication per unit of time|
|maxDosePerAdministration|optional [SimpleQuantity](https://hl7.org/fhir/R4B/datatypes.html#SimpleQuantity)|-|Upper limit on medication per administration|
|maxDosePerLifetime|optional [SimpleQuantity](https://hl7.org/fhir/R4B/datatypes.html#SimpleQuantity)|-|Upper limit on medication per unit of time|

There may be up to three intakes per day (morning, mid-day and evening) with either 0.5, 1 or 2 pills. The dosages should always be grouped by medication, i.e. there should not be multiple medication elements concerning the same medication but different dosage instructions. Instead, one medication element shall be used for that medication with multiple dosage instructions.

### patients/$userId$/medicationRecommendations/$medicationRecommendationId$

These are the output values of the recommendation algorithms. Depending on the type, the recommendations should be displayed with different icons and texts.

|Property|Type|Values|Comments|
|-|-|-|-|
|currentMedication|optional Reference(FHIRMedicationRequest)|e.g. `{"reference":"patients/123/medicationRequest/2"}`|Reference to the existing medication request, if applicable.|
|recommendedMedication|optional Reference(FHIRMedication)|e.g. `{"reference":"medications/2"}`|Reference to the recommended medication, if applicable. This should always direct to a medication, not a drug.|
|type|MedicationRecommendationType|e.g. "notStarted"|This type describes the outcome of the recommendation algorithm and is described in more detail below.|

#### Medication Recommendation Type

|Type|Icon|Current Medication|Recommended Medication|Comments|
|-|-|-|-|-|-|
|targetDoseReached|Green Checkmark|exists|undefined|The target dose has been reached.|
|personalTargetDoseReached|Green Checkmark|exists|undefined|The personal target dose has been reached, meaning that vitals signal that we should not increase the dose (yet).|
|improvementAvailable|Yellow Up Arrow|exists|undefined|The patient should uptitrate.|
|morePatientObservationsRequired|Yellow|maybe|maybe (mutually exclusive to current medication)|There are not enough patient observations to recommend anything. They should probably do some blood pressure measuring.|
|moreLabObservationsRequired|Yellow|maybe|maybe (mutually exclusive to current medication)|More lab observations are required to recommend anything. The patient should probably schedule an appointment with a clinician.|
|notStarted|Gray Up Arrow|undefined|exists|Medication has not been started, but is eligible for initiation.|
|noActionRequired|Gray|undefined|exists|The recommended medication is not eligible, but should still be shown to the user as an option without recommending it to them.|

Diuretics, if currently present as medication request, will be shown as a recommendation with `personalTargetDoseReached`, so that the logic on the client becomes easier.

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
|effective|[Period](https://hl7.org/fhir/R4B/datatypes.html#period) with Date objects or Date|-|Use Date for instant observation and periods for longer observations (e.g. more than 1 minute).|

#### patients/$userId$/bloodPressureObservations/$observationId$

Blood pressure observations contain the following code and no value.

|code>system|code>code|code>display|
|-|-|-|
|"https://loinc.org"|"85354-9"|"Blood pressure panel with all children optional"|

Further, blood pressure observations have two components.

|code>system|code>code|code>display|value>system|value>value|value>code|value>unit|
|-|-|-|-|-|-|-|
|"http://loinc.org"|"8462-4"|"Diastolic blood pressure"|"http://unitsofmeasure.org"|double|"mm[Hg]"|"mmHg"|
|"http://loinc.org"|"8480-6"|"Systolic blood pressure"|"http://unitsofmeasure.org"|double|"mm[Hg]"|"mmHg"|

#### patients/$userId$/bodyWeightObservations/$observationId$

Body weight observations contain the following code and value.

|code>system|code>code|code>display|value>system|value>value|value>code|value>unit|
|-|-|-|-|-|-|-|
|"http://loinc.org"|"29463-7"|"Body weight"|double|"http://unitsofmeasure.org"|"kg" or "[lb_av]"|"kg" or "lbs"|

#### patients/$userId$/creatinineObservations/$observationId$

Creatinine observations contain the following code and value.

|code>system|code>code|code>display|value>system|value>value|value>code|value>unit|
|-|-|-|-|-|-|-|
|"http://loinc.org"|"2160-0"|"Creatinine [Mass/volume] in Serum or Plasma"|double|"http://unitsofmeasure.org"|"mg/dL"|"mg/dL"|

#### patients/$userId$/dryBodyWeightObservations/$observationId$

Dry body weight observations contain the following code and value.

|code>system|code>code|code>display|value>system|value>value|value>code|value>unit|
|-|-|-|-|-|-|-|
|"http://loinc.org"|"29463-7"|"Body weight"|double|"http://unitsofmeasure.org"|"kg"|"kg"|

#### patients/$userId$/eGfrObservations/$observationId$

Dry body weight observations contain the following code and value.

|code>system|code>code|code>display|value>system|value>value|value>code|value>unit|
|-|-|-|-|-|-|-|
|"http://loinc.org"|"98979-8"|"Glomerular filtration rate/1.73 sq M.predicted [Volume Rate/Area] in Serum, Plasma or Blood by Creatinine-based formula (CKD-EPI 2021)"|double|"http://unitsofmeasure.org"|"mL/min/{1.73_m2}"|"mL/min/1.73_m2"|

#### patients/$userId$/heartRateObservations/$observationId$

Heart rate observations contain the following code and value.

|code>system|code>code|code>display|value>system|value>value|value>code|value>unit|
|-|-|-|-|-|-|-|
|"http://loinc.org"|"8867-4"|"Heart rate"|double|"http://unitsofmeasure.org"|"/min"|"beats/minute"|

#### patients/$userId$/potassiumObservations/$observationId$

Potassium observations contain the following code and value.

|code>system|code>code|code>display|value>system|value>value|value>code|value>unit|
|-|-|-|-|-|-|-|
|"http://loinc.org"|"6298-4"|"Potassium [Moles/volume] in Blood"|double|"http://unitsofmeasure.org"|"meq/L"|"mEq/L"|

### patients/$userId$/questionnaireResponses/$questionnaireResponseId$

Based on [FHIR QuestionnaireResponse](https://hl7.org/fhir/R4B/questionnaireresponse.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|questionnaire|string|-|canonical representation of the questionnaire, i.e. t|
|author|string|-|The patient's `userId`|
|authored|Date|-|The date the answers were gathered.|
|status|[QuestionnaireResponseStatus](https://hl7.org/fhir/R4B/valueset-questionnaire-answers-status.html)|-|Will most likely always be `completed`.|
|item|list of Item|-|-|
|item[x]>linkId|string|-|Pointer to specific item from questionnaire|
|item[x]>definition|optional uri|-|details for item|
|item[x]>text|optional string|-|Name for group or question text|
|item[x]>answer|list of Answer|-|response(s) to the question|
|item[x]>answer[y]>value|any|-|Value depending on the type of question in the survey, e.g. boolean, integer, date, string, etc|

### patients/$userId$/symptomScores/$symptomScoreId$

Whenever a new questionnaire response is uploaded to Firestore, we calculate the score and keep the results here for easy retrieval later on. We also do not compute the score anywhere but simply refer to the scores listed in this collection.

 |Property|Type|Values|Comments|
 |-|-|-|-|
 |questionnaireResponseId|optional string|-|questionnaireResponseId as used in patients/$userId$/questionnaireResponses/$questionnaireResponseId$ to be able to verify score calculations afterwards. It should be ignored by all clients.|
 |date|Date|-|must be equivalent to the date specified in the linked questionnaire response.|
 |overallScore|number|must be between 0 and 100|-|
 |physicalLimitsScore|number|must be between 0 and 100|-|
 |socialLimitsScore|number|must be between 0 and 100|-|
 |qualityOfLifeScore|number|must be between 0 and 100|-|
 |specificSymptomsScore|number|must be between 0 and 100|-|
 |dizzinessScore|number|must be between 0 and 100|-|

## questionnaires

In this section, we describe all the information stored for questionnaires.

### questionnaires/$questionnaireId$

Based on [FHIR Questionnaire](https://hl7.org/fhir/R4B/questionnaire.html), the following properties may be used, while additional properties are ignored by the Engage-HF system.

|Property|Type|Values|Comments|
|-|-|-|-|
|id|string|-|[Resource](https://hl7.org/fhir/R4B/resource.html): Logical id of this artifact|
|meta|Meta|-|[Resource](https://hl7.org/fhir/R4B/resource.html#Meta): Metadata about the resource|
|identifier|list of Identifier|-|Business identifier for this questionnaire. There may be multiple questionnaire objects in this list, with differing `id` and `language` properties, but a common business identifier.|
|title|string|-|Human-friendly title of the questionnaire.|
|date|Date|-|last modified date|
|version|string|-|Business version of the questionnaire.|
|language|optional string|e.g. "en"|Following IETF BCP-47 / [FHIR ValueSet languages](https://hl7.org/fhir/R4B/valueset-languages.html)|
|item|list of BackboneElement|-|items as defined in [FHIR Questionnaire](https://hl7.org/fhir/R4B/questionnaire.html)|
|item[x]>linkId|string|-|Unique id for item in questionnaire|
|item[x]>definition|optional uri|-|Details for the item|
|item[x]>prefix|optional string|e.g. "1(a)", "2.5.3"|Prefix of the item that isn't actually part of the name but may still be displayed.|
|item[x]>text|string|-|Primary text for the item|
|item[x]>type|code|e.g. "group", "display", "boolean", "decimal", "integer", "date", etc|See [QuestionnaireItemType](https://hl7.org/fhir/R4B/valueset-item-type.html) for available values.|

You can find an example KCCQ-12 questionnaire in [functions/data/questionnaires.json](functions/data/questionnaires.json).

## users/$userId$

In this section, we describe all user-related data to be stored. The security rules shall be set up in a way to only allow for a patient to access its own information and a clinician to access all patients' information (or even more restrictive, if needed).

|Property|Type|Values|Comments|
|-|-|-|-|
|dateOfEnrollment|Date|-|The date when the invitation code was used to create this user.|
|organization|string|-|The id of the organization a clinician, patient or owner is associated with.|
|invitationCode|string|-|The invitationCode to be used when logging in to the app for the first time.|
|language|optional string|e.g. "en"|Following IETF BCP-47 / [FHIR ValueSet languages](https://hl7.org/fhir/R4B/valueset-languages.html).|
|messagesSettings|-|-|See properties below.|
|messagesSettings>dailyRemindersAreActive|boolean|true, false|Decides whether to send out daily reminder messages for this user.|
|messagesSettings>textNotificationsAreActive|boolean|true, false|Decides whether to send text notifications for this user.|
|messagesSettings>medicationRemindersAreActive|boolean|true, false|Decides whether to send medication reminder messages for this user.|
|timeZone|string|e.g. "America/Los_Angeles"|The value needs to correspond to an identifier from [TZDB](https://nodatime.org/TimeZones). It must not be an offset to UTC/GMT, since that wouldn't work well with daylight-savings (even if there is no daylight-savings time at that location). Also, don't use common abbreviations like PST, PDT, CEST, etc (they may be ambiguous, e.g. CST). If the timeZone is unknown, then "America/Los_Angeles" should be used.|

### users/$userId$/devices/$deviceId$

This data is required to send push notifications over the [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) System.

|Property|Type|Values|Comments|
|-|-|-|-|
|modifiedDate|Date|-|This date is updated whenever the token is sent to the server, even if it is not replaced by a different token. It simply reflects the last date we can definitely confirm the token was active. Idea: We may ignore some devices, if the token has not been updated for a long time, since the app has not been opened for a long time.|
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

### users/$userId$/messages/$messageId$

This data is used to display messages to a user (patient or clinician). For patients messages are describing recent changes in their respective data from clinicians (e.g. updated medication requests) or calls-to-action to the patient. Currently, there are no messages planned for the clinician, but they may be added in the future.

|Property|Type|Values|Comments|
|-|-|-|-|
|dueDate|optional Date|-|The due date of the message to be shown in-app.|
|completionDate|optional Date|-|Specifies when a message has been completed. TBD: Messages containing a completionDate may either be hidden on user's devices or be shown crossed out.|
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

## videoSections/$videoSectionId$

In this section, we describe all data related to educational videos to be shown in the Engage-HF mobile apps. The videos are grouped into different categories to be displayed as sections in the mobile apps.

|Property|Type|Values|Comments|
|-|-|-|-|
|title|LocalizedText|e.g. "ENGAGE-HF Application"|May be localized.|
|description|LocalizedText|e.g. "Helpful videos on the ENGAGE-HF mobile application."|May be localized. Are there different videos / videoSections for each platform?|
|orderIndex|integer|e.g. 1|Since Firestore collections aren't necessarily ordered, we have this property to order the elements by on the clients. The list is supposed to be ordered ascending by `orderIndex`.|

### videoSections/$videoSectionId$/videos/$videoId$

|Property|Type|Values|Comments|
|-|-|-|-|
|title|LocalizedText|e.g. "Beta Blockers for Heart Failure"|May be localized.|
|youtubeId|LocalizedText|e.g. "XfgcXkq61k0"|Contains the video id from YouTube.|
|orderIndex|integer|e.g. 1|Since Firestore collections aren't necessarily ordered, we have this property to order the elements by on the clients. The list is supposed to be ordered ascending by `orderIndex`.|

Embed links for YouTube: `https://youtube.com/embed/${youtubeId}`.
Short links for YouTube: `https://youtu.be/${youtubeId}`. 
Watch links for YouTube: `https://youtube.com/watch?v=${youtubeId}`. 

# Resources

- See [resources/algorithms] for diagrams describing the different algorithms for medication recommendations.
- For definitions relevant for the setup of static data, including questionnaires, medication classes, medications and videoSections, have a look at [functions/data].

# Security

A user can have one or more of the following roles assigned:

|Role|Scope|Rights|Source of Truth|
|-|-|-|-|
|Admin|Everything|R/W|`admins/$userId$` exists|
|Owner|In organization|R/W of users & patients, R/W of organization|`organization/$organizationId$` contains `userId` in `owners` property|
|Clinician|In organization|R/W of users & patients|`clinicians/$userId$` exists|
|Patient|In organization|R/W of `patients/$userId$`|`patients/$userId$` exists|
|User|Own data|R/W of `users/$userId$`|auth has same userId|

For more detail, please consult the Firestore rules defined in [firestore.rules](firestore.rules).
