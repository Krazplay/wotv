
// Return what language to use (check if variable exist in localStorage)
function get_language() {
	let lang = localStorage.getItem("language");
	if ( lang == null ) { lang = "en" }
	console.log("Language="+lang);
	return lang;
}

// Return the game version data to use (check if variable exist in localStorage)
function get_version() {
	let version = localStorage.getItem("version");
	if ( version == null ) { version = "gl" }
	console.log("Game version="+version);
	return version;
}

// Download json files and parse them into variable data
function load_json_files(files_required) {
    // Initialize data variable
    if (typeof data === 'undefined') {
        data = new Map();
    }
    // Using Bismark github
    const GIT_BISM = 'https://raw.githubusercontent.com/bismark1221/wotv-'+version+'-assets/master';
    promiseList = [];
    files_required.forEach(file => {
        promiseList.push($.getJSON(GIT_BISM+file, function(filedata){
            console.log("JSON loaded: " + GIT_BISM + file);
            // Get last word from url minus .json, www.blabla.com/filename.json => filename
            let filename = file.match(/(\w+)\.json$/)[1];
            console.log("Parsing " + filename);
            data.set(filename, parse_JsonData(filedata))
        }));
    });
}

// Parse the Json file into a Map for ease of use
// The array parameter containing all the data is called "items" in data files but "infos" in localization files
// Also the unique identifier is called "iname" in data but "key" in localization files
function parse_JsonData(json_data) {
	let mapData = new Map();
    if (json_data.items != null) {
        // Data file
        json_data.items.forEach((item) => {
            mapData.set(item["iname"], item);
        });
    }
    else {
        // Localization file
        json_data.infos.forEach((info) => {
            if (info.value) mapData.set(info.key, info.value);
        });
    }
	return mapData;
}


// Add new parameters in the data for ease of use, like name in Unit.
// New parameters get k prefix to make sure it doesn't overwrite anything
function add_kraz_data() {
    // Both Unit and UnitName were loaded, add the name into the unit as 'kname'
    if (data.has("Unit") && data.has("UnitName")) {
        data.get("Unit").forEach((unit) => {
            unit.kname = data.get("UnitName").get(unit.iname);
        });
    }
    // Both VisionCard and VisionCardName were loaded, add the name into the vision card as 'kname'
    if (data.has("VisionCard") && data.has("VisionCardName")) {
        data.get("VisionCard").forEach((vc) => {
            vc.kname = data.get("VisionCardName").get(vc.iname);
        });
    }

    // Unit kmainjob => Name of the base main job of the unit
    if (data.has("Unit") && data.has("JobName")) {
        data.get("Unit").forEach((unit) => {
            if (unit.jobsets != null) unit.kmainjob = data.get("JobName").get(unit.jobsets[0]);
        });
    }

    // Unit kelement => Human readable elements
    if (data.has("Unit")) {
        data.get("Unit").forEach((unit) => {
            unit.kelement = elem_to_text(data.get("Unit").get(unit.iname)["elem"]);
        });
    }

    // VC kstats => Max stats of the cards in a Map
    //    kstatseffects => Max stats stored as Effects (object with calc/type/value)
    if (data.has("VisionCard")) {
        data.get("VisionCard").forEach((vc) => {
            let max_stats = new Map();
            vc.kstatseffects = [];
            // Loop vc stats (atk, mag, etc...)
            if (vc.status) {
                let vc_status = vc.status[vc.status.length - 1];
                for (const [stat, value] of Object.entries(vc_status)) {
                    max_stats.set(stat, value);
                    // VC stats converted to effect
                    vc.kstatseffects.push({ "calc":1, "type":ReverseEBuffStatusParam[stat], "val":value, "scope":"STATS" });
                }
            }
            vc.kstats = max_stats;
        });
    }

    // VC keffects => Array of effects (sum up all the skills effects of the card at max level)
    if (data.has("VisionCard") && data.has("Skill") && data.has("Buff")) {
        data.get("VisionCard").forEach((vc) => {
             vc.keffects = convert_vc_to_effects(vc.iname);
        });
    }

    // Unit vc_cond => All VisionCardLimitedCondition the unit fullfill
    if (data.has("Unit") && data.has("VisionCardLimitedCondition")) {
        data.get("Unit").forEach((unit) => {
            if (unit.jobsets != null && unit.jobsets.length == 3) { // playable characters ?
                unit.vc_cond = [];
                data.get("VisionCardLimitedCondition").forEach((vclc) => {
                    let fails = false;
                    // Loop on parameters
                    for (const [key, value] of Object.entries(vclc)) {
                        switch (key) {
                            case 'iname':
                                break;
                            case 'elem':
                                if (value.includes(unit.elem[0]) == false) fails = true;
                                break;
                            case 'units':
                                if (value.includes(unit.iname) == false) fails = true;
                                break;
                            case 'mainjobs':
                                if (value.includes(unit.jobsets[0]) == false) fails = true;
                                break;
                            case 'births':
                                if (value.includes(unit.birth) == false) fails = true;
                                break;
                            case 'jobs':
                                if (value.includes(unit.jobsets[0]) == false &&
                                    value.includes(unit.jobsets[1]) == false &&
                                    value.includes(unit.jobsets[2]) == false) fails = true;
                                break;
                            default:
                                console.log("WARNING: unsupported VC Limited Condition "+key);
                        }
                    }
                    if (fails == false) unit.vc_cond.push(vclc.iname);
                });
            }
        });
    }
}

// Convert elemental array to text
function elem_to_text(array) {
	if (!array) return "";
    if (array.length == 1) return ELEMENT[array[0]];
    // Return all elements from the array separated with ", "
    let result = ""
	array.forEach((elem) => {
		result += ELEMENT[elem] + ", ";
	});
	return result.slice(0,-2);
}


// Added "scope" => SELF or PARTY
// "vc_cond" => value of cnds_iname or buff_cond (they used 2 distincts parameters for card_buff and self_buff, I've merged them into one)
function convert_vc_to_effects(vc_iname) {
    vc = data.get("VisionCard").get(vc_iname);
    let party_buffs = [];
    let self_buffs = [];
    if (vc.card_buffs) {
        let raw_buffs = vc.card_buffs;
        // Loop on 'card_buffs' (it contains skills and sometimes a condition cnds_iname)
        for (const raw_buff of raw_buffs) {
            let buff_effects = [];
            for (const param of ["card_skill", "add_card_skill_buff_awake", "add_card_skill_buff_lvmax"]) {
                if (raw_buff[param] != null) buff_effects = merge_effects(buff_effects, convert_skill_to_effects(raw_buff[param]));
            }
            for (const effect of buff_effects) {
                effect.scope = "PARTY";
            }
            // Add the condition of this buff to all its effects 
            if (raw_buff["cnds_iname"] != null) {
                for (const effect of buff_effects) {
                    effect.vc_cond = raw_buff["cnds_iname"];
                }
            }
            party_buffs = merge_effects(party_buffs, buff_effects);
        }
    }
    if (vc.self_buffs) {
        let raw_buffs = vc.self_buffs;
        // Loop on 'self_buffs' (it contains skills and sometimes a condition cnds_iname)
        for (const raw_buff of raw_buffs) {
            let buff_effects = [];
            for (const param of ["self_buff", "add_self_buff_awake", "add_self_buff_lvmax"]) {
                if (raw_buff[param] != null) buff_effects = merge_effects(buff_effects, convert_skill_to_effects(raw_buff[param]));
            }
            for (const effect of buff_effects) {
                effect.scope = "SELF";
            }
            // Add the condition of this buff to all its effects 
            if (raw_buff["buff_cond"] != null) {
                for (const effect of buff_effects) {
                    effect.vc_cond = raw_buff["buff_cond"];
                }
            }
            self_buffs = merge_effects(self_buffs, buff_effects);
        }
    }
    
    return party_buffs.concat(self_buffs);
}

function convert_skill_to_effects(skill_id) {
    skill = data.get("Skill").get(skill_id);
    let effects = [];
    let new_effects = [];
    // Add a parameter buff_type to effects from t_buffs
    let buff_array = skill["t_buffs"] ? skill["t_buffs"] : [];
    for (const buff_id of buff_array) {
        new_effects = convert_buff_to_effects(buff_id);
        for (const effect of new_effects) { 
            effect["buff_type"] = "t";
            effect["slot"] = skill.slot;
        }
        effects = merge_effects(effects, new_effects);
    }
    // Add a parameter buff_type to effects from s_buffs
    buff_array = skill["s_buffs"] ? skill["s_buffs"] : [];
    for (const buff_id of buff_array) {
        new_effects = convert_buff_to_effects(buff_id);
        for (const effect of new_effects) {
            effect["buff_type"] = "s";
            effect["slot"] = skill.slot;
        }
        effects = merge_effects(effects, new_effects);
    }
    return effects
}

// Return an array of effect
function convert_buff_to_effects(buff_id) {
	let result = [];
    let buff = data.get("Buff").get(buff_id);
	
	// Loop as long as we find a buff effect
	for (let i=1; buff["type"+i] != null ; i++) {
        let new_effect = {};
        // buff shared properties
        new_effect["conds"] = buff["conds"]
        new_effect["continues"] = buff["continues"]
        new_effect["timing"] = buff["timing"]
        new_effect["chktgt"] = buff["chktgt"]
        new_effect["chktiming"] = buff["chktiming"]

        // effect properties
        new_effect["type"] = buff["type"+i];
        new_effect["calc"] = buff["calc"+i];
		new_effect["tags"] = buff["tag"+i];
		new_effect["val"] = buff["val"+i+"1"];

        if (new_effect["tags"] != null) {
            // Param tag to have an Integer instead of an Array
            if (new_effect["tags"].length == 1) new_effect["tag"] = new_effect["tags"][0];
            else new_effect["tag"] = new_effect["tags"];
            // Tag do not match the EBuffEffectCondition index, param effectcond will match the index
            if (new_effect["tags"].length == 1) new_effect["effectcond"] = tagToEffectCond(new_effect["type"], new_effect["tag"]);
            else {
                console.log('meh');
            }
        }

		result.push(new_effect);
	}
	return result;
}

function tagToEffectCond(type, tag) {
    switch (type) {
        case 119: // CondKillerElement
        case 125: // CondKillerElementP
        case 129: // CondKillerElementM
        case 133: // CondKillerElementDamage
            return tag+9;
        case 120: // CondKillerSpecies
        case 126: // CondKillerSpeciesP
        case 130: // CondKillerSpeciesM
        case 134: // CondKillerSpeciesDamage
        case 511: // CondResistSpecies
            return tag-71;
        case 121: // CondKillerBirth
        case 127: // CondKillerBirthP
        case 131: // CondKillerBirthM
        case 135: // CondKillerBirthDamage
        case 510: // CondResistBirth
            return tag-140;
        case 122: // CondKillerTag
        case 128: // CondKillerTagP
        case 132: // CondKillerTagM
        case 136: // CondKillerTagDamage
            return tag-71;
    }
    return tag;
}

// Prevent having duplicate effects, keep the sum instead (aka slash+10 and slash+5 become slash+15)
function merge_effects(array1, array2) {
    // For every effect in array2
    for (const effect2 of array2) {
        let duplicate = false;
        // Loop on array1 and check if we have a similar effect
        for (const effect1 of array1) {
            if (effect2["type"] == effect1["type"] && effect2["calc"] == effect1["calc"] && effect2["tag"] == effect1["tag"] && effect2["vc_cond"] == effect1["vc_cond"] && effect2["buff_type"] == effect1["buff_type"]) {
                // We found a match, we keep the sum of the val
                effect1["val"] += effect2["val"];
                duplicate = true;
                break;
            }
        }
        // This is a new effect, add it to array1
        if (duplicate == false) {
            array1.push(effect2);
        }
    }
    return array1;
}

function effect_to_txt(calc, type, tag, val= null) {
    let str = "";
    switch (calc) {
        case 1: // 0x1:"Strength"
            str = `${KTypeText[type]}`
            if (val != null && val >= 0) str += '+';
            if (val != null) str += val;
            return str;
        case 2: // 0x2:"StrengthRate
            str = `${KTypeText[type]}`
            if (val != null && val >= 0) str += '+';
            if (val != null) str += val;
            str += '%';
            return str;
        case 3: // 0x3:"Resist"
            str = `${KTypeText[type]}_Res`
            if (val != null && val >= 0) str += '+';
            if (val != null) str += val;
            return str;
        case 4: // 0x4:"ResistRate"
            str = `${KTypeText[type]}_Res`
            if (val != null && val >= 0) str += '+';
            if (val != null) str += val +'%';
            return str;
        case 10: // 0xA:"Heal"
            str = `Heal `;
            if (val != null) str += val+' ';
            str += `${KTypeText[type]}`;
            return str;
        case 11: // 0xB:"HealMaxRate"
            str = `Heal `;
            if (val != null) str += val+' ';
            str += `% Max ${KTypeText[type]}`;
            return str;
        case 12: // 0xC:"HealMagRate"
            str = `Heal `;
            if (val != null) str += val+' ';
            str += `%*MagPow ${KTypeText[type]}`;
            return str;
        case 20: // 0x14:"Damage"
            if (val != null) str += val+' ';
            str += `${KTypeText[type]} dmg`;
            return str;
        case 21: // 0x15:"DamageMaxRate"
            if (val != null) str += val;
            str += `% ${KTypeText[type]} dmg`;
            return str;
        case 22: // 0x16:"DamageRate"
            if (val != null) str += val;
            str += `% ${KTypeText[type]} dmg rate`;
            return str;
        case 30: // 0x1E:"Grant"
            str = `Grant `;
            if (tag != null) str += `${KTagText[tag]} `;
            str += `${KTypeText[type]}`;
            if (val != null) str += `[${val}]`;
            return str;
        case 31: // 0x1E:"Release"
            str = `Release `;
            str += `${KTypeText[type]}`;
            if (val != null) str += `[${val}]`;
            return str;
         case 32: // 0x20:"ReleaseBuff"
            str = `ReleaseBuff `;
            str += `${KTypeText[type]}`;
            if (val != null) str += `[${val}]`;
            return str;
        case 33: // 0x21:"ReleaseDebuff"
            str = `ReleaseDebuff `;
            str += `${KTypeText[type]}`;
            if (val != null) str += `[${val}]`;
            return str;
    }
    return EBuffStatusCalc[calc] +" "+ EBuffStatusParam[type]+" NotParsed";
}

// Because javascript
function round(value, decimals) {
	return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}