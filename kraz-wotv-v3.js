
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

function load_git_variables(gitName) {
    switch (gitName) {
        case "shalzuth": // 0x1:"Strength"
            gitUrl = 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/master';
            gitUrlData = '/data/';
            if (version == "jp") gitUrlData = '/jpdata/';
            gitUrlLocalize = '/en/';
            break;
        case "bismark":
            gitUrl = 'https://raw.githubusercontent.com/bismark1221/wotv-'+version+'-assets/master';
            gitUrlData = '/data/';
            gitUrlLocalize = '/localize/'+language+'/';
            break;
    }
}

// Download json files and parse them into variable data
function load_json_files(files_required) {
    // Initialize data variable
    if (typeof data === 'undefined') {
        data = new Map();
    }
    promiseList = [];
    files_required.forEach(file => {
        promiseList.push($.getJSON(gitUrl+file, function(filedata){
            console.log("JSON loaded: " + gitUrl + file);
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
        let iname;
        if (json_data.items[0]["iname"]) iname = "iname";
        else if (json_data.items[0]["type"]) iname = "type"; // Grow
        json_data.items.forEach((item) => {
            mapData.set(item[iname], item);
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

    // Both Artifact and ArtifactName were loaded, add the name into the artifact as 'kname'
    if (data.has("Artifact") && data.has("ArtifactName")) {
        data.get("Artifact").forEach((arti) => {
            arti.kname = data.get("ArtifactName").get(arti.iname);
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

    // Unit kbase_stats => Max Base stats of the unit, useful to calculate % stat bonuses
    if (data.has("Unit") && data.has("Job")) {
        data.get("Unit").forEach((unit) => {
            // Calculate base stats
            // Must have status, units like chests don't have one
            if (unit.status) {
                // Grab the highest level stats
                let lvl_stats = unit.status[unit.status.length-1];
                let base_stats = {};
                // Get the unit jobs
		        if (unit.jobsets) {
                    let jobs = unit.jobsets;
                    // If unit have an Ex job, replace main job with Ex
                    if (unit["ccsets"]) jobs[0] = unit["ccsets"][0]["m"];
                    // We do the sum of the bonus stat rates from jobs, that's how the game do it (you can lose stats with rounding otherwise)
                    let job_rate = {};
                    // Loop on the jobs
                    jobs.forEach((job_id, index) => {
                        // Get the job data
                        let job = data.get("Job").get(job_id);
                        let max_rank = job["ranks"].length-1; // Highest job rank
                        // First job bonus rate is 100%, else use the sub_rate (always 50% so far)
                        let rate = (index == 0) ? 100 : job["sub_rate"]
                        // Sometimes we don't have full stats in a job, we only have them in the 'origin' job
                        let job_origin = data.get("Job").get(job["origin"]);
                        // Loop on all stat rate of the job (highest rank is used)
                        let stats_list = Object.keys(job.ranks[max_rank]);
                        stats_list.forEach((stat) => {
                            if (job_rate[stat] == null) job_rate[stat] = 0; // init
                            job_rate[stat] += job["ranks"][max_rank][stat] * rate / 100;
                        });
                        
                        // iniap can be missing in unit stats, priority: unit, main job, main job origin
                        if (index == 0 && lvl_stats["iniap"] == null) {
                            if (job["ranks"][max_rank]) lvl_stats["iniap"] = job["ranks"][max_rank]["iniap"];
                            else lvl_stats["iniap"] = job_origin["ranks"][max_rank]["iniap"];
                        }
                    });

                    // Calculate base stats, loop on the job rate bonus to apply them
                    let stats_list = Object.keys(job_rate);
                    stats_list.forEach((stat) => {
                        if (lvl_stats[stat]) {
                            base_stats[stat] = lvl_stats[stat];
                            base_stats[stat] += Math.floor(lvl_stats[stat] * job_rate[stat] / 10000);
                        }
                    });
                    unit.kbase_stats = base_stats;
                }
            }
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

    // Artifact keffects => Array of effects (sum up all the skills effects of the equipment at max level)
    if (data.has("Artifact") && data.has("Skill") && data.has("Buff")) {
        data.get("Artifact").forEach((arti) => {
             arti.keffects = convert_artifact_to_effects(arti.iname);
        });
    }

    // Unit vc_cond => All VisionCardLimitedCondition the unit fullfill
    if (data.has("Unit") && data.has("VisionCardLimitedCondition")) {
        data.get("Unit").forEach((unit) => {
            if (unit.jobsets != null && unit.jobsets.length == 3) { // playable characters ?
                unit.vc_cond = [];
                data.get("VisionCardLimitedCondition").forEach((vclc) => {
                    if (unitCheckCond(unit, vclc)) unit.vc_cond.push(vclc.iname);
                });
            }
        });
    }

    // Unit arti_cond => All ArtifactPassivesCondition the unit fullfill
    if (data.has("Unit") && data.has("ArtifactPassivesCondition")) {
        data.get("Unit").forEach((unit) => {
            if (unit.jobsets != null && unit.jobsets.length == 3) { // playable characters ?
                unit.arti_cond = [];
                data.get("ArtifactPassivesCondition").forEach((apc) => {
                    // If the unit respect the condition, add contidion ID to unit arti_cond array
                    if (unitCheckCond(unit, apc)) unit.arti_cond.push(apc.iname);
                });
            }
        });
    }

    // Artifact klot => Array with grows parameters from ArtifactRandLot
    //     klotnames => Array with names of grows (Assault, Barrier, etc) only if ArtifactGrow.json was loaded
    //        kstats => 
    if (data.has("Artifact") && data.has("ArtifactRandLot")) {
        data.get("Artifact").forEach((arti) => {
            if (arti.rtype) {
                let randLot = data.get("ArtifactRandLot").get(arti.rtype);
                arti.klot = [];
                arti.klotnames = [];
                arti.kstats = {};
                for (let i=1; randLot.lot[0]["grow"+i]; i++) {
                    let lot_id = randLot.lot[0]["grow"+i];
                    arti.klot.push(lot_id);
                    if (data.get("ArtifactGrow").get(lot_id) != null) arti.klotnames.push(data.get("ArtifactGrow").get(lot_id));
                    else arti.klotnames.push(lot_id); // If no name use ID as name instead

                    // Stats ratio for this Grow type
                    arti.kstats[lot_id] = {};
                    let grow = data.get("Grow").get(lot_id).curve[0];
                    // Special, lv stat from grow indicate max level, keep it
                    if (grow["lv"]) arti.kstats[lot_id]["lv"] = grow["lv"];
                    for (const [stat, value] of Object.entries(arti.status[arti.status.length-1])) {
                        if (grow[stat]) arti.kstats[lot_id][stat] = Math.floor( value + (value * grow[stat] / 100) );
                    }
                }
            }
        });
    }
}

// Check if an unit meet all the conditions
function unitCheckCond(unit, condition) {
    // Loop on condition parameters (units, elements, jobs, etc...)
    for (const [key, value] of Object.entries(condition)) {
        switch (key) {
            case 'iname':
                break;
            case 'elem':
                if (value.includes(unit.elem[0]) == false) return false;
                break;
            case 'units':
                if (value.includes(unit.iname) == false) return false;
                break;
            case 'mainjobs':
                if (value.includes(unit.jobsets[0]) == false) return false;
                break;
            case 'births':
                if (value.includes(unit.birth) == false) return false;
                break;
            case 'jobs':
                if (value.includes(unit.jobsets[0]) == false &&
                    value.includes(unit.jobsets[1]) == false &&
                    value.includes(unit.jobsets[2]) == false) return false;
                break;
            default:
                console.log("WARNING: unsupported VC Limited Condition "+key);
        }
    }
    return true;
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

// Added "scope" => SELF or PARTY
// "vc_cond" => value of cnds_iname or buff_cond (they used 2 distincts parameters for card_buff and self_buff, I've merged them into one)
function convert_artifact_to_effects(arti_iname) {
    arti = data.get("Artifact").get(arti_iname);
    let effects = [];
    // No buff at all
    if (arti["skl1"] == null) return [];
    // Find best skill level (should be 1, 5, or 6)
    let best_skl = "skl1";
    for (let i=2; arti["skl"+i]; i++) {
        best_skl = "skl"+i;
    }
    // Loop on skills
    /*for (const skill_id of arti[best_skl]) {
        let new_buff = convert_skill_to_effects(skill_id);
        buffs = merge_effects(buffs, new_buff);
    }*/

    // Loop on skills
    let length = arti[best_skl].length;
    for (let i=0; i<length; i++) {
        let skill_id = arti[best_skl][i];
        let new_effects = convert_skill_to_effects(skill_id);
        if (arti["passives_condition"]) {
            for (const effect of new_effects) {
                effect.arti_cond = arti["passives_condition"][i];
            }
        }
        // Add new buffs to total buffs
        effects = merge_effects(effects, new_effects);
    }
    return effects;
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