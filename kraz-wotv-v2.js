/*
	*wotv*
	Assume global variables with same name as file, ItemName.json => itemName, Buff.json => buff
*/

/*
	Parse a json file from folder 'en', the key parameter value become the key in the result
	ex unitName["UN_LW_P_MONT"] => {"key"=>"UN_LW_P_MONT", "value"=>"Mont Leonis"}
*/
function parse_AnyName(data) {
	let mapName = {};
	data.infos.forEach((info) => {
		if (info.value) mapName[info.key] = info.value;
	});
	quicktest_add_jp_names(mapName);
	return mapName;
}

function quicktest_add_jp_names(mapName) {
	if (mapName["UN_LW_P_MONT"]) {
		mapName["UN_LW_P_LILS_01"] = mapName["UN_LW_P_LILS_01"] || "Lilyth Swimsuit (JP)"
		mapName["UN_LW_P_KTON_01"] = mapName["UN_LW_P_KTON_01"] || "Kitton Swimsuit (JP)"
		mapName["UN_NIER_P_N2TB"] = mapName["UN_NIER_P_N2TB"] || "2B (JP)"
		mapName["UN_NIER_P_N9TS"] = mapName["UN_NIER_P_N9TS"] || "9S (JP)"
		mapName["UN_LW_P_MONT_01"] = mapName["UN_LW_P_MONT_01"] || "King Mont (JP)"
		mapName["UN_LW_P_RYEL"] = mapName["UN_LW_P_RYEL"] || "Ruel/Louelle (JP)"
		mapName["UN_LW_P_SIRM"] = mapName["UN_LW_P_SIRM"] || "Sylma? (JP)"
		mapName["UN_LW_P_HLNA_01"] = mapName["UN_LW_P_HLNA_01"] || "Helena Black Witch (JP)"
		mapName["UN_LW_P_THLA_01"] = mapName["UN_LW_P_THLA_01"] || "Salire Valentine (JP)"
		mapName["UN_LW_P_CMLO"] = mapName["UN_LW_P_CMLO"] || "Camillo (JP)"
		mapName["UN_LW_P_MORE"] = mapName["UN_LW_P_MORE"] || "Moore (JP)"
		mapName["UN_LW_P_CWEL"] = mapName["UN_LW_P_CWEL"] || "Cowell (JP)"
		mapName["UN_LW_P_CRLT"] = mapName["UN_LW_P_CRLT"] || "Charlotte (JP)";
	}
}

/*
	The iname is not always enough to have a unique identifier, a second parameter may be needed to create a unique key
	example: adventureAreaDropDeck, you have one object per iname per campaign, iname is not unique
	Return a Map, so use .get(key)
*/
function parse_AnyData(data, iname, iname2 = null) {
	let mapData = new Map();
	data.items.forEach((item) => {
		mapData.set(iname2 ? item[iname]+item[iname2] : item[iname], item);
	});
	return mapData;
}

function parse_BirthTitle(data) {
	let arrayName = [];
	let index = 2; // start at 2
	data.infos.forEach((info) => {
		arrayName[index] = info.value;
		index++;
		if (info.key == "aaa") index += 3;
	});
	arrayName[13] = "FFBE"
	arrayName[14] = "FINAL FANTASY I"
	arrayName[17] = "FINAL FANTASY IV"
	arrayName[23] = "FINAL FANTASY X"
	arrayName[27] = "FFXIV: Shadowbringers"
	arrayName[28] = "FINAL FANTASY XV"
	arrayName[29] = "FINAL FANTASY TACTICS"
	arrayName[30] = "Gouga"
	arrayName[31] = "Nier collab"
	arrayName[33] = "Tomb Raider"
	arrayName[34] = "Far Plane"
	arrayName[54] = "Unaffiliated"
	return arrayName;
}

function load_git_variables(gitName) {
    switch (gitName) {
        case "shalzuth": // 0x1:"Strength"
            gitUrl = 'https://raw.githubusercontent.com/shalzuth/wotv-ffbe-dump/master';
            gitUrlData = '/data/';
            if (language == "jp") gitUrlData = '/jpdata/';
            gitUrlLocalize = '/en/';
            break;
        case "bismark":
            gitUrl = 'https://raw.githubusercontent.com/bismark1221/wotv-'+version+'-assets/master';
            gitUrlData = '/data/';
            gitUrlLocalize = '/localize/'+language+'/';
            break;
    }
}

/*
	Require netherBeastAbilityBoard, buff
	Add the SP cost of the panel to the buff (as param sp)
	Return an array of buff id available to the esper at this awakening level
*/
function get_esper_buffs(base_esper_iname, awk_lvl) {
	let board = netherBeastAbilityBoard.get(base_esper_iname)["panels"];
	let buffs_list = [];
	board.forEach((panel) => {
		if (panel.unlock_awake == null || awk_lvl+1 >= panel.unlock_awake) {
			buffs_list.push(panel.value);
			buff.get(panel.value)["sp"] = panel.sp;
		}
	});
	return buffs_list;
}

/*
	Input:  iname of a buff
	Output: Object with stats provided by the buff [atk%:20, slash:15, slash_res:10, eater_fire:5]
*/
function buff_id_to_stat(buff_id, include_min=true) {
	let result = {}
	let buff_obj = buff.get(buff_id);
	// Conditional and party wide buffs
	if (buff_obj["conds"]) result["conds"] = buff_obj["conds"];
	if (buff_obj["continues"]) result["continues"] = buff_obj["continues"];
	
	// Safe net in case with have buff with conds != continues in the future
	if (buff_obj.conds && JSON.stringify(buff_obj.conds) != JSON.stringify(buff_obj.continues) ) {
		console.log("Warning, conds != continues in buff "+buff_id);
	}
	
	// As long as we find a buff effect type
	for (let i=1; buff_obj["type"+i] != null ; i++) {
		let type = buff_obj["type"+i];
		let calc = buff_obj["calc"+i];
		let tags = buff_obj["tag"+i];
		let valmin = buff_obj["val"+i];
		let valmax = buff_obj["val"+i+"1"];
		// Convert type integer to stat string name
		let stat = typestat[type];
		// Check it's a known type, new ones are 
		if (!stat) console.log("Buff "+buff_id+": Type "+type+" unknown in typestat");
		
		// calc 1 is the standard, flat bonus
		if (calc == 1) {
			if (type >= 42 && type <= 102) stat = "atk_"+stat;
			if (include_min) result[stat+"_min"] = valmin;
			result[stat] = valmax;
		}
		// calc 2 is usualy a % bonus
		else if (calc == 2) {
			if (include_min) result[stat+"%_min"] = valmin;
			result[stat+"%"] = valmax;
		}
		// calc 3 is used for resistance bonuses
		else if (calc == 3) {
			if (include_min) result[stat+"_min"] = valmin;
			result[stat] = valmax;
		}
		// calc 30 with type 119 or 120 is element eater ad type killer
		else if (calc == 30 && (type == 119 || type == 120)) {
			for (let tag_id of tags) {
				if (tagstat[tag_id]) {
					if (include_min) result[stat+"_"+tagstat[tag_id]+"_min"] = valmin;
					result[stat+"_"+tagstat[tag_id]] = valmax;
				}
				else {
					console.log("Missing tagstat "+tag_id+" (buff "+buff_id+")");
				}
			}
		}
		else {
			console.log("todo type "+type+"  calc "+calc+"  tags:"+tags);
		}
	}
	return result;
}

/*
	Return sum of 2 stats objects
*/
function sum_of_stats(hash1, hash2) {
	for (const [stat, value] of Object.entries(hash2)) {
		if (hash1[stat]) hash1[stat] += hash2[stat];
		else hash1[stat] = hash2[stat];
	}
	return hash1;
}

function elem_to_text(array) {
	if (!array) return "";
	let result = ""
	array.forEach((elem) => {
		result += typetxt[41+elem] + ", ";
	});
	return result.slice(0,-2);
}

function species_to_text(array) {
	if (!array) return "";
	let result = ""
	// TEMP todo UnitSpecies
	let translation = ["-", "Human", "Esper", "Beast", "Demon", "Dragon", "Plantoid", "Avian", "Insect", 
						"Aquatic", "Machina", "Fairy", "Reaper", "Stone", "Metal", "Arcana"];
	array.forEach((specie) => {
		result += translation[specie] + ", ";
	});
	return result.slice(0,-2);
}

const rareName = ["N","R","SR","MR","UR"];


/* Result: [0-2]["base","board","master","total"][stat name]
           0-2 is the level, 0=lvl 1, 1=lvl 99, 2=lvl 120
		   "total" is the sum base + board + master
*/
// Get level stats 1, 99, and 120, then if lvl 99 or 120, add job_bonus stats
function get_unit_maxstats(unit_iname) {
	let result = {};
	unit_obj = unit.get(unit_iname);
	// Must have status, units like chests don't have one
	if (unit_obj.status) {
		// Count the number of status hashes for the Unit 1:lv1,2:lv99,3:lv120. ex_star has no status here
		let s = unit_obj.status.length-1
		// Grab the highest level stats
		let lvl_stats = unit_obj.status[s];
		result["base"] = Object.assign({}, lvl_stats);
		// Get the unit jobs
		if (unit_obj.jobsets) {
			let jobs = unit_obj.jobsets;
			// If unit have an Ex job, replace main job with Ex
			if (unit_obj["ccsets"]) jobs[0] = unit_obj["ccsets"][0]["m"];
			// We do the sum of the bonus stat rates from jobs, that's how the game do it (you can lose stats with rounding otherwise)
			let job_rate = {};
			// Loop on the jobs
			jobs.forEach((job_id, index) => {
				// Get the job data
				let job_obj = job.get(job_id);
				let max_rank = job_obj["ranks"].length-1; // Highest job rank
				// First job bonus rate is 100%, else use the sub_rate (always 50% so far)
				let rate = (index == 0) ? 100 : job_obj["sub_rate"]
				// Sometimes we don't have full stats in a job, we only have them in the 'origin' job
				let job_origin = job.get(job_obj["origin"]);
				// Loop on all stat rate of the job (highest rank is used)
				let stats_list = Object.keys(job_obj.ranks[max_rank]);
				stats_list.forEach((stat) => {
					if (job_rate[stat] == null) job_rate[stat] = 0; // init
					job_rate[stat] += job_obj["ranks"][max_rank][stat] * rate / 100;
				});
				
				// iniap can be missing in unit stats, priority: unit, main job, main job origin
				if (index == 0 && lvl_stats["iniap"] == null) {
					if (job_obj["ranks"][max_rank]) lvl_stats["iniap"] = job_obj["ranks"][max_rank]["iniap"];
					else lvl_stats["iniap"] = job_origin["ranks"][max_rank]["iniap"];
				}
			});
			result["jobs_rate"] = job_rate;
			
			// Calculate base stats, loop on the job rate bonus to apply them
			let stats_list = Object.keys(job_rate);
			stats_list.forEach((stat) => {
				if (lvl_stats[stat]) {
					result["base"][stat] = lvl_stats[stat];
					result["base"][stat] += Math.floor(lvl_stats[stat] * job_rate[stat] / 10000);
				}
				//result["total"][stat] = rstats[i]["base"][stat];
			});
		}
		result["lvl_stats"] = lvl_stats;
	}
	console.log(result);
	return result;
}
		

// Assume all 3 jobs are at the same level
function get_unit_board_bonuses(unit_iname, job_level) {
	let bonuses = { "%":{}, "+":{} };
	let board = unitAbilityBoard.get(unit_iname);
	
	// For each panel
	board["panels"].forEach((panel) => {
		// If panel require a job lvl less or equal our parameter and is not a castable skill
		// Skill for damage max up, we handle it
		if (panel["need_level"] <= job_level && panel["panel_effect_type"] == 3) {
			// Look for the skill
			let skill_obj = skill.get(panel["value"]);
			if (!skill_obj["t_buffs"] || skill_obj["t_buffs"].length != 1) console.log("Unexpected t_buffs size != 1, panel "+panel["panel_id"]+" skill"+skill_obj.iname+" from "+unit_iname);
			// Look for the buff id in the panel
			let buff_id = skill_obj["t_buffs"][0];
			
			bonuses = sum_of_bonuses(bonuses, buff_id_to_stat(buff_id));
		}
		else if (panel["need_level"] <= job_level && panel["panel_effect_type"] != 1 && panel["panel_effect_type"] != 4) {
			let new_stats = buff_id_to_stat(panel["value"]);
			bonuses = sum_of_bonuses(bonuses, new_stats);
		}
	});
	
	return bonuses;
}

// Return the sum of 2 hash bonuses
function sum_of_bonuses(origin, new_stats) {
	if (new_stats["%"]) {
		Object.keys(new_stats["%"]).forEach((stat) => {
			if (!origin["%"][stat]) origin["%"][stat] = 0;
			origin["%"][stat] += new_stats["%"][stat];
		});
	}
	if (new_stats["+"]) {
		Object.keys(new_stats["+"]).forEach((stat) => {
			if (!origin["+"][stat]) origin["+"][stat] = 0;
			origin["+"][stat] += new_stats["+"][stat];
		});
	}
	// Conditional party bonus
	if (new_stats["party"]) {
		if (!origin["party"]) origin["party"] = { "%":{}, "+":{} };
		for (const sign in new_stats["party"]) {
			for (const stat in new_stats["party"][sign]) {
				if (!origin["party"][sign][stat]) origin["party"][sign][stat] = {};
				for (const conds in new_stats["party"][sign][stat]) {
					if (!origin["party"][sign][stat][conds]) origin["party"][sign][stat][conds] = {};
					for (const continues in new_stats["party"][sign][stat][conds]) {
						if (!origin["party"][sign][stat][conds][continues]) origin["party"][sign][stat][conds][continues] = 0;
						origin["party"][sign][stat][conds][continues] += new_stats["party"][sign][stat][conds][continues];
					}
				}
			}
		}
	}
	
	// To help with killxxx stats (element eater, type killer, etc...)
	if (new_stats["kill"]) {
		for (let tag_id of new_stats["kill"]) {
			if (!origin["kill"]) origin["kill"] = new Set();
			origin["kill"].add(tag_id);
		}
	}
	return origin;
}

// input skill_id
// ouput array of buffs
function get_buffs_from_skill_id(skill_id) {
	let skill_obj = skill.get(skill_id);
	let arr1 = skill_obj["t_buffs"] ? skill_obj["t_buffs"] : [];
	let arr2 = skill_obj["s_buffs"] ? skill_obj["s_buffs"] : [];
	return arr1.concat(arr2);
}

/*  v2
	Input:  iname of a buff
	Output: Hash with stats provided by the buff [atk%:20, slashAtk:15]
*/
function buff_id_to_stat_v2(buff_id, include_min=true) {
	let result = {}
	let buff_obj = buff.get(buff_id);
	// Conditional and party wide buffs
	if (buff_obj["conds"]) result["conds"] = buff_obj["conds"];
	if (buff_obj["continues"]) result["continues"] = buff_obj["continues"];
	
	// Safe net in case with have buff with conds != continues in the future
	if (buff_obj.conds && JSON.stringify(buff_obj.conds) != JSON.stringify(buff_obj.continues) ) {
		console.log("Warning, conds != continues in buff "+buff_id);
	}
	
	// As long as we find a buff effect type
	for (let i=1; buff_obj["type"+i] != null ; i++) {
		let type = buff_obj["type"+i];
		let calc = buff_obj["calc"+i];
		let tags = buff_obj["tag"+i];
		let valmin = buff_obj["val"+i];
		let valmax = buff_obj["val"+i+"1"];
		// Convert type integer to stat string name
		let stat = typestat[type];
		// Check it's a known type, new ones are 
		if (!stat) console.log("Buff "+buff_id+": Type "+type+" unknown in typestat");
		
		// calc 1 is the standard, flat bonus
		if (calc == 1) {
			if (include_min) result[stat+"_min"] = valmin;
			result[stat] = valmax;
		}
		// calc 2 is usualy a % bonus
		else if (calc == 2) {
			if (include_min) result[stat+"%_min"] = valmin;
			result[stat+"%"] = valmax;
		}
		// calc 3 is used for resistance bonuses
		else if (calc == 3) {
			if (include_min) result[stat+"_res_min"] = valmin;
			result[stat+"_res"] = valmax;
		}
		// calc 30 with type 119 or 120 is element eater ad type killer
		else if (calc == 30 && (type == 119 || type == 120)) {
			for (let tag_id of tags) {
				if (tagstat[tag_id]) {
					if (include_min) result[stat+"_"+tagstat[tag_id]+"_min"] = valmin;
					result[stat+"_"+tagstat[tag_id]] = valmax;
				}
				else {
					console.log("Missing tagstat "+tag_id+" (buff "+buff_id+")");
				}
			}
		}
		else {
			console.log("todo type "+type+"  calc "+calc+"  tags:"+tags);
		}
	}
	return result;
}

/*
	Input skill object and skill level
	Assume there is only one buff
	Return a buff object
*/
function get_skill_buff_at_level(skill_obj, skill_lvl) {
	if (skill_obj == null) return null;
	// Little check, currently all vc skills have only one buff
	let t_length = skill_obj["t_buffs"] ? skill_obj["t_buffs"].length : 0
	let s_length = skill_obj["s_buffs"] ? skill_obj["s_buffs"].length : 0
	if (t_length + s_length != 1) console.log("Error: buffs length != 1 in "+skill_obj.iname);
	// Get the buff id from either t_buff or s_buff
	let buff_id = t_length > 0 ? skill_obj.t_buffs[0] : skill_obj.s_buffs[0];
	// Clone the buff, we're going to modify it
	let buff_result = Object.assign({}, buff.get(buff_id));
	// The maxed vc skills have no grow, they're simply acquired when you reach max, so 1/1 will give full bonus
	let skill_grow = grow.get(skill_obj["grow"]);
	let start_lvl = skill_grow ? skill_grow["curve"][0]["val"] : 0;
	let lvl_max = skill_grow ? skill_grow["curve"][0]["lv"] : 1;
	
	// Loop as long as we find valid typeX in the buff params
	for (let i=1; buff_result["type"+i] != null ; i++) {
		let base_val = buff_result["val"+i];
		let max_gain = buff_result["val"+i+"1"] - buff_result["val"+i];
		
		// Modifying min/max value to current value so we can print the buff later
		// todo add ceil for negative values
		buff_result["val"+i] = Math.floor( base_val + ( max_gain * (skill_lvl-start_lvl) / (lvl_max-start_lvl) ) );
		buff_result["val"+i+"1"] = Math.floor( base_val + ( max_gain * (skill_lvl-start_lvl) / (lvl_max-start_lvl) ) );
	}
	
	return buff_result;
}

/*
	Two Buffs Enter, One Buff Leaves
	Buff 2 effect exist in Buff 1: values are added
	Else the effect is added in the first available slot in Buff 1
	Buff 1 is returned
*/
function fuse_buffs(buff1, buff2) {
	if (buff2 == null) return buff1;
	//todo check all buffs param
	// Loop as long as we find valid typeX in buff2 params
	for (let i=1; buff2["type"+i] != null ; i++) {
		// Loop on existing buff effects in buff1
		for (let j=1; buff1["type"+j] != null ; j++) {
			// Params to match
			if (buff2["type"+i] == buff1["type"+j] && buff2["calc"+i] == buff1["calc"+j] && JSON.stringify(buff2["tag"+i]) == JSON.stringify(buff1["tag"+j])) {
				buff1["val"+j] += buff2["val"+i];
				buff1["val"+j+"1"] += buff2["val"+i+"1"];
				break;
			}
		}
	}
	
	return buff1;
}
