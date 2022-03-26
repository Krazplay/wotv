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
function get_unit_stats(unit_iname) {
	rstats = []; // Result, an array of stats hashes [{lv1},{lv99},{lv120}]
	unit_obj = unit.get(unit_iname);
	
	// Must have status, units like chests don't have one
	if (unit_obj.status) {
		// Status => [{Lv1}, {Lv99}, {Lv120}]
		for (let i=0; unit_obj.status[i]; i++) {
			if (!rstats[i]) rstats[i] =	{};
			if (!rstats[i]["base"]) rstats[i]["base"] =	{};
			if (!rstats[i]["total"]) rstats[i]["total"] =	{};
			rstats[i]["base"]["lvl"] = ["1","99","120"][i];
			// Easier name for current level stats
			let lvl_stats = unit_obj.status[i];
			// Get the jobs % stats bonuses
			job_bonus = {};
			// If the unit has jobs, grab bonus rates of all jobs, ignore for level 1
			if (unit_obj.jobsets && i>0) {
				unit_obj.jobsets.forEach((job_id, index) => {
					job_obj = job.get(job_id);
					// First job bonus is 100%, else use the sub_rate (always 50% so far)
					let rate = (index == 0) ? 100 : job_obj["sub_rate"]
					// Sometimes we don't have full stats in a job, we only have them in the 'origin' job
					let job_origin = job.get(job_obj["origin"]);
					// If no val for iniap in unit, use the main job one // todo check EX jobs
					if (index == 0 && lvl_stats["iniap"] == null) {
						if (job_obj["ranks"][14]) lvl_stats["iniap"] = job_obj["ranks"][14]["iniap"];
						else lvl_stats["iniap"] = job_origin["ranks"][14]["iniap"];
					}
					// For each stat, calculate the sum of job % bonus
					stats_list.forEach((stat) => {
						if (job_bonus[stat] == null) job_bonus[stat] = 0; // init
						// EX job replace the old job, check if level>=120, it's main job, and ccsets exist
						if (i>1 && index == 0 && unit_obj["ccsets"]) {
							let exjob_obj = job.get(unit_obj["ccsets"][0]["m"]);
							// Tricky, if EX stats are missing, check the job in param 'origin'
							if (exjob_obj["ranks"][1] == null) {
								exjob_obj = job.get(exjob_obj["origin"]);
							}
							max_rank = exjob_obj["ranks"].length-1
							// If the stat rate bonus exist, add it to job_bonus
							if (exjob_obj["ranks"][max_rank][stat]) {
								job_bonus[stat] += exjob_obj["ranks"][max_rank][stat] * rate / 100;
							}
						}
						else {
							// If the stat rate bonus exist, add it to job_bonus
							if (job_obj["ranks"][14] && job_obj["ranks"][14][stat]) {
								job_bonus[stat] += job_obj["ranks"][14][stat] * rate / 100;
							}
							// Once again trick, stat may be only in origin job
							else if (job_origin && job_origin["ranks"][14][stat]) {
								job_bonus[stat] += job_origin["ranks"][14][stat] * rate / 100;
							}
						}
					});
				});
			}
			// Calculate the stats
			stats_list.forEach((stat) => {
				if (job_bonus[stat] == null) job_bonus[stat] = 0;
				if (lvl_stats[stat]) {
					rstats[i]["base"][stat] = lvl_stats[stat];
					rstats[i]["base"][stat] += Math.floor(lvl_stats[stat] * job_bonus[stat] / 10000);
				}
				//else { rstats[i]["base"][stat] = ""; }
				rstats[i]["total"][stat] = rstats[i]["base"][stat];
			});
			// Can't have kill stats with base stats
			//rstats[i]["base"]["kill"] = [];
			
			//---------------------------
			// Board stats
			//---------------------------
			if (i>0) {
				// init
				if (!rstats[i]["board"]) rstats[i]["board"] = {};
				// Assume lvl99 = job lvl 15 is max, lvl 120 => main job level 25
				let board_job_level = [0,15,25][i];
				// Get the sum of bonuses for this job level
				let board_bonus = get_unit_board_bonuses(unit_obj.iname, board_job_level);
				// Add the bonuses to the hash "board"
				
				for (const [stat, bonus_amnt] of Object.entries(board_bonus["%"])) {
					if (!rstats[i]["board"][stat]) rstats[i]["board"][stat] = 0;
					if (!rstats[i]["total"][stat]) rstats[i]["total"][stat] = 0;
					let gain = Math.floor(bonus_amnt * rstats[i]["base"][stat] / 100);
					rstats[i]["board"][stat] += gain;
					rstats[i]["total"][stat] += gain;
				}
				for (const [stat, bonus_amnt] of Object.entries(board_bonus["+"])) {
					if (!rstats[i]["board"][stat]) rstats[i]["board"][stat] = 0;
					if (!rstats[i]["total"][stat]) rstats[i]["total"][stat] = 0;
					rstats[i]["board"][stat] += bonus_amnt;
					rstats[i]["total"][stat] += bonus_amnt;
				}
				if (board_bonus["kill"]) rstats[i]["board"]["kill"] = union(rstats[i]["board"]["kill"], board_bonus["kill"]);
				if (board_bonus["kill"]) rstats[i]["total"]["kill"] = union(rstats[i]["total"]["kill"], board_bonus["kill"]);
				// Party bonuses
				if (board_bonus["party"]) rstats[i]["board"]["party"] = board_bonus["party"];
				if (board_bonus["party"]) rstats[i]["total"]["party"] = board_bonus["party"];
			}
			
			//---------------------------
			// Master skill stats
			//---------------------------
			if (i>0 && unit_obj.mstskl) {
				// Get only the last master skill (when more than one, they don't stack)
				let mst_skl_id = unit_obj.mstskl[unit_obj.mstskl.length-1];
				let list_buffs = get_buffs_from_skill_id(mst_skl_id);
				let bonuses = { "%":{}, "+":{} };
				list_buffs.forEach((buff_id) => {
					bonuses = sum_of_bonuses(bonuses, buff_id_to_stat_v2(buff_id));
				});
				// init
				if (!rstats[i]["master"]) rstats[i]["master"] = {};
				// Add master bonus to the hash "master"
				for (const [stat, bonus_amnt] of Object.entries(bonuses["%"])) {
					if (!rstats[i]["master"][stat]) rstats[i]["master"][stat] = 0;
					if (!rstats[i]["total"][stat]) rstats[i]["total"][stat] = 0;
					let gain = Math.floor(bonus_amnt * rstats[i]["base"][stat] / 100);
					rstats[i]["master"][stat] += gain;
					rstats[i]["total"][stat] += gain;
				}
				for (const [stat, bonus_amnt] of Object.entries(bonuses["+"])) {
					if (!rstats[i]["master"][stat]) rstats[i]["master"][stat] = 0;
					if (!rstats[i]["total"][stat]) rstats[i]["total"][stat] = 0;
					rstats[i]["master"][stat] += bonus_amnt;
					rstats[i]["total"][stat] += bonus_amnt;
				}
				if (bonuses["kill"]) rstats[i]["master"]["kill"] = union(rstats[i]["master"]["kill"], bonuses["kill"]);
				if (bonuses["kill"]) rstats[i]["total"]["kill"] = union(rstats[i]["total"]["kill"], bonuses["kill"]);
				
				// Party bonuses
				if (bonuses["party"]) rstats[i]["master"]["party"] = bonuses["party"];
				if (bonuses["party"]) rstats[i]["total"]["party"] = sum_party_stats(rstats[i]["total"]["party"], bonuses["party"]);
			}
			
			// Still doubting about -1 in acc and evade => cause rounding issue when negative ? may switch to "worse round"
			// Accuracy = 11*dex^0.20 /20   + luk^0.96/200 -1
			// Evade    = 11*agi^0.90 /1000 + luk^0.96/200 -1
			// Crit     =    dex^0.35 / 4 -1
			// Crit avd =    luk^0.37 / 5 -1
			rstats[i]["base"]["hit_stat"]  = Math.floor( (100*11*Math.pow(rstats[i]["base"]["dex"], 0.20)/20) + (100*Math.pow(rstats[i]["base"]["luk"], 0.96)/200) - 100 )
			rstats[i]["total"]["hit_stat"] = Math.floor( (100*11*Math.pow(rstats[i]["total"]["dex"], 0.20)/20) + (100*Math.pow(rstats[i]["total"]["luk"], 0.96)/200) - 100 )
			if (rstats[i]["total"]["hit"]) rstats[i]["total"]["hit_stat"] += rstats[i]["total"]["hit"];
			rstats[i]["base"]["avd_stat"]  = Math.floor( (100*11*Math.pow(rstats[i]["base"]["spd"], 0.90)/1000) + (100*Math.pow(rstats[i]["base"]["luk"], 0.96)/200) - 100 )
			rstats[i]["total"]["avd_stat"] = Math.floor( (100*11*Math.pow(rstats[i]["total"]["spd"], 0.90)/1000) + (100*Math.pow(rstats[i]["total"]["luk"], 0.96)/200) - 100 )
			if (rstats[i]["total"]["avd"]) rstats[i]["total"]["avd_stat"] += rstats[i]["total"]["avd"];
		}
	}
	return rstats;
}