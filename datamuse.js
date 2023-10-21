async function datamuse(value, tp) {
    // store title as searchedWord
    const searchedWord = tp.file.title

    const fs = require('fs');

    const searchDataMuseApi = (searchedWord, param) => {
        return new Promise((resolve, reject) => {
            // Build the API URL
            let apiUrl = `https://api.datamuse.com/words?${param}=${searchedWord}`
            fetch(apiUrl)
                .then((res) => res.json())
                .then((data) => resolve(data)) // Resolving the data if successful
                .then((error) => reject(error)) // Rejecting with error if unsuccessful
        })
    }

    const searchDataMuseApiRes = (searchedWord) => {
        return new Promise((resolve, reject) => {
            // Build the API URL
            let apiUrl = `https://api.datamuse.com/words?sp=${searchedWord}&&md=srdpf&ipa=1`
            fetch(apiUrl)
                .then((res) => res.json())
                .then((data) => resolve(data)) // Resolving the data if successful
                .then((error) => reject(error)) // Rejecting with error if unsuccessful
        })
    }

    const searchDataMuseRes = await searchDataMuseApiRes(searchedWord)
    const tags = searchDataMuseRes[0].tags
    switch (value) {
        // print 'title' (name) of note in quotes
        case "title":
            return tp.file.title.toLowerCase()
        // print 'part of speech'
        case "pos":
            // let tagsUp = tags.slice(0, 2)
            let tagsCheck = tags
            let newTags = []
            if (tagsCheck.includes('n') || tagsCheck.includes('N')) {
                newTags.push('noun')
            }
            if (tagsCheck.includes('adj')) {
                newTags.push('adjective')
            }
            if (tagsCheck.includes('v')) {
                newTags.push('verb')
            }
            if (tagsCheck.includes('unknown')) {
                newTags.push('unknown')
            }
            return newTags;

        case "length":
            return tp.file.title.length
        case "syllables":
            return searchDataMuseRes[0].numSyllables
        case "score":
            return searchDataMuseRes[0].score
        case "frequency":
            return getFreqTag(tags)
        case "definitions":
            let definitionArray = searchDataMuseRes[0].defs?.map((index) => index).join(", ")
            if (definitionArray === undefined) {
                return 'Data Not Available'
            } else {
                return definitionArray
            }
        case "arpabet":
            return getArpabetTag(tags)
        case "arpanum":
            return getArpanumTag(tags)
        case "arpacat":
            return toArpaCat(getArpabetTag(tags))
        case "arpasubcat":
            return toArpaSubCat(getArpabetTag(tags))
        case "ipa":
            return `"${getIpaTag(tags)}"`
        case "ipasimp":
            return `"${getIpaSimpTag(tags)}"`

        // related
        case "ml":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "ml"),
                "means-like"
            )
        case "sl":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "sl"),
                "sounds-like"
            )
        case "sp":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "sp"),
                "spelled-like"
            )
        case "jja":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "rel_jja"),
                "nouns-for"
            )
        case "jjb":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "rel_jjb"),
                "adj-for"
            )
        case "trg":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "rel_trg"),
                "triggers"
            )
        case "syn":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "rel_syn"),
                "synonyms"
            )
        case "ant":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "rel_ant"),
                "antonyms"
            )
        case "spc":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "rel_spc"),
                "hypernyms"
            )
        case "gen":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "rel_gen"),
                "hyponyms"
            )
        case "com":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "rel_com"),
                "comprises"
            )
        case "par":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "rel_par"),
                "meronyms"
            )
        case "bga":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "rel_bga"),
                "followers"
            )
        case "bgb":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "rel_bgb"),
                "leaders"
            )
        case "rhy":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "rel_rhy"),
                "rhymes-with"
            )
        case "nry":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "rel_nry"),
                "approx-rhymes"
            )
        case "hom":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "rel_hom"),
                "homophones"
            )
        case "cns":
            return setMetaData(
                await searchDataMuseApi(searchedWord, "rel_cns"),
                "consonants"
            )
    }
}

function getFreqTag(value) {
    return value
        .filter((index) => index.startsWith("f:"))
        .toString()
        .replace("f:", "")
}

const alphabet = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
]

function getArpabetTag(value) {
    let metaData = value.filter((index) => index.startsWith("pron:"))
    return metaData
        .toString()
        .replace("pron:", "")
        .replace(/[0-9]*/g, "")
}

function getArpanumTag(value) {
    let metaData = value.filter((index) => index.startsWith("pron:"))
    return metaData.toString().replace("pron:", "")
}

function getIpaTag(value) {
    let metaData = value.filter((index) => index.startsWith("ipa_pron:"))
    return metaData
        .toString()
        .replace("ipa_pron:", "")
        .replace(/[0-9]*/g, "")
}

function getIpaSimpTag(value) {
    let metaData = value.filter((index) => index.startsWith("ipa_pron:"))
    return metaData.toString().replace("ipa_pron:", "").replace(/ˈ*/g, "")
}

// Return MetaData By Letter
function setMetaData(value, meta) {

    try {
        let array = []
        for (let i = 0; i < alphabet.length; i++) {
            array += sortMetaData(value, meta, alphabet[i])
        }

        array += `${meta}-all: ${value
            .map((index) => `[[metadata/${index.word}|${index.word}]]`)
            .sort()
            .join(", ")}`
        return array
    } catch {
        console.log('my bad')
    }
}

// Sort MetaData from A-Z
function sortMetaData(value, meta, letter) {
    let metaData = value.filter((index) => index.word.startsWith(letter))
    if (metaData.length > 0) {
        return `${meta}-${letter}: ${metaData
            .map((index) => `[[metadata/${index.word}|${index.word}]]`)
            .sort()
            .join(", ")} \n`
    } else {
        return ""
    }
}

function toArpaSubCat(values) {
    let splits = values.split(" ")
    return Object.values(splits)
        .map(function (split) {
            if (
                split === "IY" ||
                split === "IH" ||
                split === "EY" ||
                split === "EH" ||
                split === "AE"
            ) {
                return `FrV`
            } else if (
                split === "AA" ||
                split === "AO" ||
                split === "OW" ||
                split === "UH" ||
                split === "UW"
            ) {
                return `BkV`
            } else if (split === "ER" || split === "AX" || split === "AH") {
                return `MdV`
            } else if (
                split === "AY" ||
                split === "AW" ||
                split === "OY" ||
                split === "IX"
            ) {
                return `DpT`
            } else if (split === "B" || split === "D" || split === "G") {
                return `StCv`
            } else if (split === "P" || split === "T" || split === "K") {
                return `StCu`
            } else if (
                split === "V" ||
                split === "DH" ||
                split === "Z" ||
                split === "ZH"
            ) {
                return `FrIv`
            } else if (
                split === "F" ||
                split === "TH" ||
                split === "S" ||
                split === "SH"
            ) {
                return `FrIu`
            } else if (split === "L" || split === "EL" || split === "R") {
                return `SmVl`
            } else if (split === "W" || split === "WH" || split === "Y") {
                return `SmVg`
            } else if (
                split === "M" ||
                split === "N" ||
                split === "NX" ||
                split === "NG"
            ) {
                return `NaSn`
            } else if (split === "EM" || split === "EN") {
                return `NaSv`
            } else if (split === "CH" || split === "JH") {
                return `AfR`
            } else if (split === "HH") {
                return `OwSp`
            } else if (split === "DX" || split === "DD") {
                return `OvOc`
            } else if (split === "Q") {
                return `OgLs`
            }
        })
        .join(" ")
}

function toArpaCat(values) {
    let splits = values.split(" ")
    return Object.values(splits)
        .map(function (split) {
            if (
                split === "IY" ||
                split === "IH" ||
                split === "EY" ||
                split === "EH" ||
                split === "AE"
            ) {
                return `VoW`
            } else if (
                split === "AA" ||
                split === "AO" ||
                split === "OW" ||
                split === "UH" ||
                split === "UW"
            ) {
                return `VoW`
            } else if (split === "ER" || split === "AX" || split === "AH") {
                return `VoW`
            } else if (
                split === "AY" ||
                split === "AW" ||
                split === "OY" ||
                split === "IX"
            ) {
                return `DiP`
            } else if (split === "B" || split === "D" || split === "G") {
                return `StC`
            } else if (split === "P" || split === "T" || split === "K") {
                return `StC`
            } else if (
                split === "V" ||
                split === "DH" ||
                split === "Z" ||
                split === "ZH"
            ) {
                return `FrI`
            } else if (
                split === "F" ||
                split === "TH" ||
                split === "S" ||
                split === "SH"
            ) {
                return `FrI`
            } else if (split === "L" || split === "EL" || split === "R") {
                return `SmV`
            } else if (split === "W" || split === "WH" || split === "Y") {
                return `SmV`
            } else if (
                split === "M" ||
                split === "N" ||
                split === "NX" ||
                split === "NG"
            ) {
                return `NaS`
            } else if (split === "EM" || split === "EN") {
                return `NaS`
            } else if (split === "CH" || split === "JH") {
                return `AfF`
            } else if (split === "HH") {
                return `OwH`
            } else if (split === "DX" || split === "DD") {
                return `OvO`
            } else if (split === "Q") {
                return `OgS`
            }
        })
        .join(" ")
}

function getArpaSubCatJSON(word) {
    try {
        // Read the JSON file synchronously (You might want to cache this if called frequently)
        const data = fs.readFileSync('words.json', 'utf8');
        const words = JSON.parse(data);

        // Use the word (converted to uppercase for the given example) to look up the object
        const wordData = words[word.toUpperCase()];

        // Return the arpasubcat if exists or null if not
        return wordData ? wordData.arpasubcat : null;
    } catch (err) {
        console.error('Error reading or parsing words.json:', err);
        return null;
    }
}


module.exports = datamuse
