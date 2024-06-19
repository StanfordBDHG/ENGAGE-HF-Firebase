
const https = require('https')

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

async function getDrugs(name, expand) {
    const response = await get(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${name}&expand=${expand.join('+')}`)
    return JSON.parse(response.body)
}

async function getRxProperty(rxcui, prop) {
    const response = await get(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/property.json?propName=${prop}`)
    return JSON.parse(response.body)
}

async function getRxNormName(rxcui) {
    const response = await get(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}.json`)
    return JSON.parse(response.body)
}

// findRxcuiById('SNOMEDCT', 386870007).then(result => console.log(JSON.stringify(result)))
// getAllProperties(20352, ['ATTRIBUTES']).then(result => console.log(JSON.stringify(result)))
// getAllRelatedInfo(20352, []).then(result => console.log(JSON.stringify(result)))

const ids = `
Metoprolol succinate ER	25mg	879978003
Metoprolol succinate ER	50mg	879979006
Metoprolol succinate ER	100mg	879980009
Metoprolol succinate ER	200mg	879981008
Carvedilol	-	386870007
Carvedilol	3.125mg	318633000
Carvedilol	6.25mg	318635007
Carvedilol	12.5mg	318631003
Carvedilol	25mg	318632005
Carvedilol phosphate	-	426471008
Carvedilol phosphate ER	10mg	1187445001
Carvedilol phosphate ER	20mg	1187446000
Carvedilol phosphate ER	40mg	1208576006
Carvedilol phosphate ER	80mg	1208577002
Bisoprolol	-	386868003
Bisoprolol	5mg	318590006
Bisoprolol	10mg	318591005
Dapagliflozin	-	703674001
Dapagliflozin	10mg	1145541007
Empagliflozin	-	703894008
Empagliflozin	10mg	703896005
Empagliflozin	25mg	703897001
Sotagliflozin	-	TBD
Sotagliflozin	200mg	TBD
Sotagliflozin	400mg	TBD
Bexagliflozin	-	TBD
Bexagliflozin	20mg	TBD
Canagliflozin	-	703676004
Canagliflozin	100mg	703682001
Canagliflozin	300mg	765627002
Ertugliflozin	-	764274008
Ertugliflozin	5mg	1162397007
Ertugliflozin	15mg	1162394000
Spironolactone	-	387078006
Spironolactone	25mg	318056008
Spironolactone	50mg	318057004
Spironolactone	100mg	318058009
Eplerenone	-	407010008
Eplerenone	25mg	407011007
Eplerenone	50mg	407012000
Quinapril	-	386874003
Quinapril	5mg	318885001
Quinapril	10mg	318886000
Quinapril	20mg	318887009
Quinapril	40mg	318894007
Perindopril	-	372916001
Perindopril	2mg	318896009
Perindopril	4mg	318897000
Perindopril	8mg	374667004
Ramipril	-	386872004
Ramipril	1.25mg	tablet: 408040007, capsule: 318900007
Ramipril	2.5mg	tablet: 408050008, capsule: 318901006
Ramipril	5mg	tablet: 408051007, capsule: 318902004
Ramipril	10mg	tablet: 408052000, capsule: 318906001
Benazepril	-	372511001
Benazepril	5mg	376516008
Benazepril	10mg	376518009
Benazepril	20mg	376520007
Benazepril	40mg	376521006
Captopril	-	387160004
Captopril	12.5mg	318820009
Captopril	25mg	318821008
Captopril	50mg	318824000
Captopril	100mg	375105000
Enalapril	-	372658000
Enalapril	2.5mg	318850001
Enalapril	5mg	318851002
Enalapril	10mg	318853004
Enalapril	20mg	318855006
Lisinopril	-	386873009
Lisinopril	2.5mg	318857003
Lisinopril	5mg	318858008
Lisinopril	10mg	318859000
Lisinopril	20mg	318860005
Lisinopril	30mg	374040006
Lisinopril	40mg	376772000
Fosinopril	-	372510000, sodium: 108570006
Fosinopril	10mg	sodium: 318909008
Fosinopril	20mg	sodium: 318910003
Fosinopril	40mg	sodium: 376699008
Trandolapril	-	386871006
Trandolapril	1mg	375094007
Trandolapril	2mg	375095008
Trandolapril	4mg	375096009
Moexipril	-	373442003
Moexipril	7.5mg	318934008
Moexipril	15mg	318935009
Losartan	-	373567002, potassium: 108582002
Losartan	25mg	potassium: 318955005
Losartan	50mg	potassium: 318956006
Losartan	100mg	potassium: 407784004
Valsartan	-	386876001
Valsartan	40mg	416515008
Valsartan	80mg	375034009
Valsartan	160mg	375035005
Valsartan	320mg	376487009
Candesartan	-	372512008
Candesartan	2mg	cilexetil: 318977009
Candesartan	4mg	cilexetil: 318978004
Candesartan	8mg	cilexetil: 318979007
Candesartan	16mg	cilexetil: 318980005
Candesartan	32mg	cilexetil: 376998003
Irbesartan	-	386877005
Irbesartan	75mg	318968002
Irbesartan	150mg	318969005
Irbesartan	300mg	318970006
Telmisartan	-	387069000
Telmisartan	20mg	134463001
Telmisartan	40mg	318986004
Telmisartan	80mg	318987008
Olmesartan	-	412259001, medoxomil: 412260006
Olmesartan	5mg	medoxomil: 385541002
Olmesartan	10mg	medoxomil: 408055003
Olmesartan	20mg	medoxomil: 385542009
Olmesartan	40mg	medoxomil: 385543004
Azilsartan	-	385542009, medoxomil: 449561004
Azilsartan	20mg	medoxomil: 895430006
Azilsartan	40mg	medoxomil: 1137333005
Azilsartan	80mg	medoxomil: 1137623008
Eprosartan	-	396044005, mesilate: 129488003
Eprosartan	300mg	mesilate: 318994006
Eprosartan	400mg	mesilate: 318995007
Eprosartan	600mg	mesilate: 318996008
Eprosartan	800mg	TBD
Sacubitril- Valsartan	-	777480008
Sacubitril- Valsartan	24-26mg	1162681006
Sacubitril- Valsartan	49-51mg	1162682004
Sacubitril- Valsartan	97-103mg	1162718004
Furosemide	-	387475002
Furosemide	20mg	317971007
Furosemide	40mg	317972000
Furosemide	80mg	395510001
Furosemide	100mg	1187430008
Furosemide	500mg	317973005
Bumetanide	-	387498005
Bumetanide	0.5mg	375553009
Bumetanide	1mg	318021009
Bumetanide	2mg	375648005
Bumetanide	5mg	318022002
Torsemide	-	108476002
Torsemide	2.5mg	318040003
Torsemide	5mg	318041004
Torsemide	10mg	318042006
Torsemide	20mg	375711005
Torsemide	40mg	TBD
Torsemide	60mg	TBD
Torsemide	100mg	375714002
Ethacrynic Acid	-	373536004
Ethacrynic Acid	25mg	376668007
Ethacrynic Acid	50mg	376679002
`
.trim()
.split(/\s+/)
.map(Number)
.filter(i => !isNaN(i))

console.log(ids)

async function main() {
    for (const id of ids) {
        try {
            const rxcui = await findRxcuiById('SNOMEDCT', id)
            const nameBody = await getRxNormName(rxcui)
            console.log(`SNOMED CT: ${id}, rxcui: ${rxcui}, name: ${nameBody.idGroup.name}`)
        } catch (error) {
            console.log(`SNOMED CT: ${id}, error: ${error}`)
        }
    }
}

main().then(() => console.log('done')).catch(error => console.error('error', error))
