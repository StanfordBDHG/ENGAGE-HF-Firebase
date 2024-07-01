
const https = require('https')
const fs = require('fs')

async function get(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            let body = Buffer.alloc(0)
            response.on('data', (chunk) => body += chunk)
            response.on('error', reject)
            response.on('end', () => {
                if (response.statusCode >= 200 && response.statusCode <= 299) {
                    resolve({ statusCode: response.statusCode, headers: response.headers, body: body })
                } else {
                    reject(Error(`Request failed with status code ${response.statusCode})`))
                }
            })
        })
        request.on('error', reject)
        request.end()
    })
}

// docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.findRxcuiById.html
async function findRxcuiById(idtype, id, allsrc = false) {
    const response = await get(`https://rxnav.nlm.nih.gov/REST/rxcui.json?idtype=${idtype}&id=${id}&allsrc=${allsrc ? 1 : 0}`)
    return JSON.parse(response.body).idGroup.rxnormId
}

// docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.getAllProperties.html
async function getAllProperties(rxcui, props) {
    const response = await get(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/allProperties.json?prop=${props.join('+')}`)
    return JSON.parse(response.body)
}

// docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.getAllRelatedInfo.html
async function getAllRelatedInfo(rxcui, expand) {
    const response = await get(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/allrelated.json?expand=${expand.join('+')}`)
    return JSON.parse(response.body)
}

// docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.getDrugs.html
async function getDrugs(name, expand) {
    const response = await get(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${name}&expand=${expand.join('+')}`)
    return JSON.parse(response.body)
}

// docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.getRxProperty.html
async function getRxProperty(rxcui, prop) {
    const response = await get(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/property.json?propName=${prop}`)
    return JSON.parse(response.body)
}

// docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.getRxNormName.html
async function getRxNormName(rxcui) {
    const response = await get(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}.json`)
    return JSON.parse(response.body).idGroup.name
}

// docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxTerms.getAllRxTermInfo.html
async function getAllRxTermInfo(rxcui) {
    const response = await get(`https://rxnav.nlm.nih.gov/REST/RxTerms/rxcui/${rxcui}/allinfo.json`)
    return JSON.parse(response.body).rxtermsProperties
}

String.prototype.removingSuffix = function(suffix) {
    return this.endsWith(suffix) ? this.toString().slice(0, -suffix.length) : this
}

// docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.getRelatedByType.html
async function getRelatedDrugs(rxcui) {
    const response = await get(`https://rxnav.nlm.nih.gov/REST/RxTerms/rxcui/${rxcui}/related.json?tty=SCD`)
    const data = JSON.parse(response.body)
    return data.relatedGroup.conceptGroup.filter(group => group.tty === 'SCD')[0].conceptProperties
}

async function getDrugsContaining(rxcui) {
    const ingredientResponse = await get(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?rela=ingredient_of`)
    const ingredientsData = JSON.parse(ingredientResponse.body)
    const ingredients = ingredientsData.relatedGroup.conceptGroup?.filter(group => group.tty === 'SCDC')[0]?.conceptProperties ?? []
    let allDrugs = []
    for (const ingredient of ingredients) {
        const drugResponse = await get(`https://rxnav.nlm.nih.gov/REST/rxcui/${ingredient.rxcui}/related.json?rela=constitutes`)
        const drugs = JSON.parse(drugResponse.body).relatedGroup.conceptGroup.filter(group => group.tty === 'SCD')[0].conceptProperties
        allDrugs.push(...drugs)
    }
    return allDrugs
}

async function buildFHIRMedication(rxcui, name, medicationClass, minimumDailyDose, targetDailyDose) {
    const result = {
        id: rxcui,
        code: {
            coding: [
                {
                    system: "http://www.nlm.nih.gov/research/umls/rxnorm",
                    code: rxcui,
                    display: name
                }
            ]
        },
        text : name,
        status: "active",
        extension: []
    }
    if (medicationClass) {
        result.extension.push({
            url: "http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/medicationClass",
            valueString: medicationClass
        })
    }
    if (minimumDailyDose) {
        result.extension.push({
            url: "http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/minimumDailyDose",
            valueQuantity: {
                value: minimumDailyDose,
                unit: "mg/day"
            }
        })
    }
    if (targetDailyDose) {
        result.extension.push({
            url: "http://engagehf.bdh.stanford.edu/fhir/StructureDefinition/Medication/extension/targetDailyDose",
            valueQuantity: {
                value: targetDailyDose,
                unit: "mg/day"
            }
        })
    }
    return result
}

async function buildFHIRDrug(rxcui, ingredients, fallbackTerms) {
    let rxTermInfo = await getAllRxTermInfo(rxcui)
    if (Object.entries(rxTermInfo ?? {}).length === 0) {
        console.error(`Error getting term info for ${rxcui}. Using fallback terms...`)
        rxTermInfo = fallbackTerms ?? {}
    }
    const amounts = rxTermInfo.strength.trim().removingSuffix('mg').removingSuffix('MG').trim().split('-').map(parseFloat)
    return {
        "id": rxcui,
        "code": {
            "coding": [
                {
                    "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                    "code": rxcui,
                    "display": rxTermInfo.displayName ?? rxTermInfo.fullName
                }
            ]
        },
        "text" : rxTermInfo.fullName,
        "status": "active",
        "form": {
            "coding": [
                {
                    "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                    "code": rxTermInfo.rxnormDoseForm,
                    "display": rxTermInfo.rxnormDoseForm
                }
            ]
        },
        "ingredient": ingredients.map((ingredient, index) => ({
            "itemCodeableConcept": {
                "coding": [
                    {
                        "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                        "code": ingredient.rxcui,
                        "display": ingredient.name
                    }
                ]
            },
            "strength": {
                "numerator": {
                    "value": amounts[index],
                    "unit": "mg"
                },
                "denominator": {
                    "value": 1
                }
            }
        }))
    }
}

async function logAvailableDrugs(rxcui) {
    const medicationName = await getRxNormName(rxcui)
    console.log(`Available drugs for ${rxcui}: ${medicationName}`)
    const drugsResponse = await getDrugs(medicationName, [])
    const drugs = drugsResponse.drugGroup.conceptGroup
        .filter(group => group.tty === 'SCD')[0]
        .conceptProperties
        .sort((a, b) => a.name.localeCompare(b.name))
    for (const drug of drugs) {
        console.log(`  -> ${drug.rxcui}: ${drug.name}`)
    }
}

async function createFHIRCollections(filename) {
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'))
    const medications = {}
    const drugs = {}

    for (let medicationClassIndex = 0; medicationClassIndex < data.length; medicationClassIndex++) {
        const medicationClass = data[medicationClassIndex]
        console.log(`Processing medication class ${medicationClassIndex}...`)

        for (let medicationIndex = 0; medicationIndex < medicationClass.medications.length; medicationIndex++) {
            const medication = medicationClass.medications[medicationIndex]
            const medicationName = await getRxNormName(medication.code)
            const fhirMedication = await buildFHIRMedication(medication.code, medicationName, medicationClass.key, medication.minimumDailyDose, medication.targetDailyDose)
            medications[medication.code] = fhirMedication
            drugs[medication.code] = {}

            let ingredients = [{name: medicationName, rxcui: medication.code}]
            if (medication.ingredients) {
                ingredients = []
                for (const ingredientRxcui of medication.ingredients) {
                    try {
                        const ingredientName = await getRxNormName(ingredientRxcui)
                        ingredients.push({name: ingredientName, rxcui: ingredientRxcui})
                    } catch (error) {
                        console.error(`Error processing ingredient ${ingredientRxcui}: ${error.message}`)
                    }
                }
            }
            console.log(`Processing medication ${fhirMedication.text}...`)

            try {
                if (medication.drugs) {
                    for (let drugIndex = 0; drugIndex < medication.drugs.length; drugIndex++) {
                        const drugRxcui = medication.drugs[drugIndex]
                        try {
                            const fhirDrug = await buildFHIRDrug(drugRxcui, ingredients, (medication.fallbackTerms ?? {})[drugRxcui] ?? {})
                            drugs[medication.code][drugRxcui] = fhirDrug
                        } catch (error) {
                            console.error(`Error processing drug ${drugRxcui}: ${error.message}`)
                        }
                    }
                } else {
                    const medicationDrugs = await getDrugsContaining(medication.code)
                    console.log(`Found ${medicationDrugs.length} drugs for ${medication.code}`)
                    for (let drugIndex = 0; drugIndex < medicationDrugs.length; drugIndex++) {
                        const drug = medicationDrugs[drugIndex]
                        console.log(`Processing drug ${JSON.stringify(drug)}...`)
                        try {
                            const fhirDrug = await buildFHIRDrug(drugRxcui, ingredients, (medication.fallbackTerms ?? {})[drugRxcui] ?? {})
                            drugs[medication.code][fhirDrug.id] = fhirDrug
                        } catch (error) {
                            console.error(`Error processing drug ${drug.rxcui}: ${error.message}`)
                        }
                    }
                }
            } catch (error) {
                console.error(`Error processing medication ${fhirMedication.text}: ${error.message}`)
            }
        }
    }

    return { medications, drugs }
}

async function logAvailableDrugsForAllMedications(filename) {   
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'))
    for (let medicationClassIndex = 0; medicationClassIndex < data.length; medicationClassIndex++) {
        const medicationClass = data[medicationClassIndex]
        for (let medicationIndex = 0; medicationIndex < medicationClass.medications.length; medicationIndex++) {
            const medication = medicationClass.medications[medicationIndex]
            try {
                await logAvailableDrugs(medication.code)
            } catch (error) {
                console.error(`Error processing medication ${medication.code}: ${error.message}`)
            }
        }
    }
}

module.exports.createFHIRCollections = createFHIRCollections
module.exports.logAvailableDrugsForAllMedications = logAvailableDrugsForAllMedications

async function main() {
    // await logAvailableDrugsForAllMedications('data/medicationCodes.json')
}

main().then(() => console.log('')).catch(error => console.error('Error:', error))