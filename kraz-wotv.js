/*
	*wotv*
	get_datatables_xxx => Create an array of objects to be used as data for datatables
	Assume global variables with same name as file, ItemName.json => itemName, Buff.json => buff
	Be careful when naming variables
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
	return mapName;
}

// In case we want an easily iterable variable of a name file
function parse_AnyName_as_Map(data) {
	let mapName = new Map();
	data.infos.forEach((info) => {
		mapName.set(info["key"], info);
	});
	return mapName;
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

/*
	Require adventureAreaDropDeck, adventureDropDeckEntity, adventureAreaName, itemName
	Return an array of objects
*/
function get_datatable_Adventure() {
	result = [];
	for (let [key, value] of adventureAreaDropDeck) {
		value.drop.forEach((table_params) => {
			let table_loot = adventureDropDeckEntity.get(table_params.drop_id);
			table_loot.rewards.forEach((reward) => {
				let line = {};
				line["area_iname"] = value["area_iname"];
				line["area_name"] = adventureAreaName[value["area_iname"]] ? adventureAreaName[value["area_iname"]] : value["area_iname"];
				line["campaign_string"] = value["campaign_string"];
				line["drop_id"] = table_params.drop_id;
				line["is_rare"] = table_params.is_rare ? table_params.is_rare : "0";
				line["rate"] = table_params.rate;
				line["fever_rate"] = table_params.fever_rate;
				line["fix_rate"] = table_params.fix_rate;
				line["reward_name"] = itemName[reward.iname] ? itemName[reward.iname] : reward.iname;
				//todo Use the bonus value from AdventureUnitBonusSetting, they may change in the future
				//Bonus S=>1 M=>3 L=>5 XL=>10
				line["reward_rate"] = ((table_params.rate + 0*table_params.fix_rate) * reward.rate / table_params.rate) / 1000;
				line["reward_rate_s"] = round( ((table_params.rate + 1*table_params.fix_rate) * reward.rate / table_params.rate) / 1000, 3);
				line["reward_rate_m"] = round( ((table_params.rate + 3*table_params.fix_rate) * reward.rate / table_params.rate) / 1000, 3);
				line["reward_rate_l"] = round( ((table_params.rate + 5*table_params.fix_rate) * reward.rate / table_params.rate) / 1000, 3);
				line["reward_rate_xl"] = round( ((table_params.rate + 10*table_params.fix_rate) * reward.rate / table_params.rate) / 1000, 3);
				line["reward_rate_fever"] = round( ((table_params.fever_rate) * reward.rate / table_params.rate) / 1000, 3);
				result.push(line);
			});
		});
	}
	return result;
}

/*
	Require netherBeastAbilityBoard, unit, unitName + get_esper_buffs() + sum_of_buffs_id() + wotv-parse.js
	Return an array of objects
*/
function get_datatable_NetherBeast() {
	result = [];
	// If ID is in Esper Ability Board, then in unit file it's an equipable esper
	for (let [iname, item] of netherBeastAbilityBoard) {
		let base_esper = unit.get(iname)
		let max_awk = 1+base_esper.nb_awake_id.length;
		// One line per awakening + one for base
		for (let awk_nb = 0; awk_nb < max_awk; awk_nb++) {
			// Pick the right esper unit depending of the awakening
			let esper = awk_nb == 0 ? base_esper : unit.get(base_esper.nb_awake_id[awk_nb-1])
			let line = {};
			line["iname"] = esper.iname;
			line["name"] = unitName[esper.iname] ? unitName[esper.iname] : esper.iname;
			line["awk"] = awk_nb;
			// Getting all the possible stats, status[1] is the object with max stats
			stats_list.forEach((stat) => {
				line[stat] = esper.status[1][stat] ? esper.status[1][stat] : "";
			});
			// Element(s) of esper
			line["elem"] = ""
			esper.elem.forEach((elemt) => {
				line["elem"] += typetxt[41+elemt] + ", ";
			});
			line["elem"] = line["elem"].slice(0,-2); // remove last ", "		
			// Get all the buffs of the esper at this awakening
			let buff_list = get_esper_buffs(iname, awk_nb);
			// Merge similar buffs, this is now an array of buff objects
			buff_list = sum_of_buffs_id(buff_list);
			// Sort array to show most useful buffs first
			buff_list.sort((a, b) => a.sort_priority - b.sort_priority);
			// To improve readability I've added columns for specific buffs type
			line["atk_buffs"] = bufflist_to_txt(buff_list.filter(buff_obj => buff_obj["sort_priority"] == 1));
			line["elmt_buffs"] = bufflist_to_txt(buff_list.filter(buff_obj => buff_obj["sort_priority"] == 2));
			line["stat_buffs"] = bufflist_to_txt(buff_list.filter(buff_obj => buff_obj["sort_priority"] == 3));
			line["atk_res_buffs"] = bufflist_to_txt(buff_list.filter(buff_obj => buff_obj["sort_priority"] == 19));
			// Translate into a readable text
			line["skills_txt"] =  bufflist_to_txt(buff_list.filter(buff_obj => buff_obj["sort_priority"] > 3 && buff_obj["sort_priority"] != 19));
			result.push(line);
		}
	}
	return result;
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
	Input an array of buff ID, return an array of buff objects
	Require buff
	[buff_id1, buff_id2] (Slash+3, Slash+2) => [buff] (Slash+5)
	To be safe, create a buff from scratch to make sure we don't clone multiple types by error
	Also add sort_priority to easily sort them later if needed
*/
function sum_of_buffs_id(buff_list) {
	let result = new Map;
	buff_list.forEach((buff_id) => {
		let curBuff = buff.get(buff_id);
		// Loop as long as we find valid typeX in the buff params
		for (let i=1; curBuff["type"+i] != null ; i++) {
			// If the type, calc, and tags match, we consider it's the same kind of buff
			let key = 'Type '+curBuff["type"+i]+' calc '+curBuff["calc"+i]+' tags '+curBuff["tag"+i];
			// First time we meet this kind of buff
			if (result.has(key) == false) {
				let new_buff = clone_buff_minus_type(curBuff);
				// copy type and val X to 1 in the new buff 
				let param_list = ["type", "calc", "tag", "val", "val1"];
				param_list.forEach((param) => {
					new_buff[param+"1"] = curBuff[param+i];
				});
				// For easy sorting later if needed
				new_buff["sort_priority"] = calculate_sort_buff(new_buff);
				result.set(key, new_buff);
			}
			// Else we just add the value to the existing one
			else {
				result.get(key)["val1"] += curBuff["val"+i];
				result.get(key)["val11"] += curBuff["val1"+i];
				result.get(key)["sp"] += curBuff["sp"];
			}
		}
	});
	// Return only the values as an array, don't care for the keys
	return Array.from(result.values());
}

/*
	Clone the parameters except everything to do with the type (calc, tags, val, val1, etc...)
	Easier for maintenance if they add new params
*/
function clone_buff_minus_type(buff_obj) {
	let result = {};
	let param_list = ["iname", "rate", "turn", "timing", "chktgt", "chektiming", "conds", "continue", "sp"];
	param_list.forEach((param) => {
		result[param] = buff_obj[param];
	});
	return result;
}

/*
	Gives a sort order to a buff
	For the espers long list of buffs, I prefer to sort the buff by effect
	Warning interger return used for filtering in get_datatable_NetherBeast
*/
function calculate_sort_buff(buff_obj) {
	if (buff_obj["type1"] >= 61 && buff_obj["type1"] <= 65 && buff_obj["calc1"] != 3) return 1; // Dmg type
	if (buff_obj["type1"] >= 42 && buff_obj["type1"] <= 60 && buff_obj["calc1"] != 3) return 2; // Elements
	if (buff_obj["type1"] >= 21 && buff_obj["type1"] <= 26) return 3;  // Stats
	if (buff_obj["type1"] >= 1 && buff_obj["type1"] <= 4) return 5;  // HP TP AP +%
	if (buff_obj["type1"] == 155) return 7;  // Accuracy
	if (buff_obj["type1"] == 156) return 9;  // Evade
	if (buff_obj["type1"] == 158) return 11; // Crit
	if (buff_obj["type1"] == 159) return 13; // Crit evade
	if (buff_obj["type1"] == 120 && buff_obj["calc1"] == 30) return 15; // Type killer
	if (buff_obj["type1"] == 119 && buff_obj["calc1"] == 30) return 17; // Elt eater
	if (buff_obj["type1"] >= 61 && buff_obj["type1"] <= 65 && buff_obj["calc1"] === 3) return 19; // atk type res
	if (buff_obj["type1"] == 313) return 99; // Evocation magic
	return 50;
}

/*
	Require artifact, artifactRandLot, grow, skill, artifactName + wotv-parse.js
	Return an array of objects
*/
function get_datatable_Artifact() {
	result = [];
	
	let typeName = ["Weapon","Armor","Accessory", "-1"];
	let rareName = ["N","R","SR","MR","UR"];
	// todo replace catName with file data
	let catName = ["0","Dagger","Sword","Greatsword","Katana","Staff","Ninja Blade","Bow","Axe", "HammerNotUsed",
					"Spear","InstrumentNotUsed","WhipNotUsed","ProjectileNotUsed","Gun","Mace","Fists","Shield","Armor","Hat",
					"Helm","Clothing","Accessory","Gloves","CAT24","CAT25","CAT26"];
	// Loop on all equipment
	for (let [iname, equip] of artifact) {
		// All equipment have a rtype
		let lot_rtype = artifactRandLot.get(equip.rtype)["lot"][0];
		for (let i=1; lot_rtype["grow"+i]; i++) {
			let line = {};
			let grow_id = lot_rtype["grow"+i];
			line["iname"] = equip.iname;
			line["name"] = artifactName[equip.iname] ? artifactName[equip.iname] : equip.iname;
			line["type"] = typeName[equip.type] ? typeName[equip.type] : equip.type;
			line["cat"] = ""
			equip.cat.forEach((cat) => {
				line["cat"] += catName[cat]+", "
			});
			line["cat"] = line["cat"].slice(0,-2);
			line["rare"] = rareName[equip.rare];
			line["trust"] = equip.trust ? equip.trust : "";
			line["collaboType"] = equip.collaboType ? equip.collaboType : "";
			line["cap"] = equip.cap ? equip.cap : "";
			line["equip"] = equip.equip ? equip.equip : "";
			line["rtype"] = equip.rtype;
			line["grow"] = grow_id;
			let curr_grow = grow.get(grow_id);
			let curve = curr_grow["curve"][0];
			// Getting all the possible stats, status[1] is the object with max stats
			stats_list.forEach((stat) => {
				if (equip.status[1]) {
					let base_max = equip.status[1][stat] ? equip.status[1][stat] : "";
					if (base_max < 0) line["max"+stat] = curve[stat] ? Math.ceil(base_max + base_max * curve[stat] / 100) : base_max;
					else line["max"+stat] = curve[stat] ? Math.floor(base_max + base_max * curve[stat] / 100) : base_max;
				}
				else {
					line["max"+stat] = "";
				}
			});
			// skl6 exist but seems a mistake (Ras Algethi only)
			["skl1","skl2","skl3","skl4","skl5"].forEach((skparam) => {
				line[skparam] = "";
				if (equip[skparam]) {
					equip[skparam].forEach((skill_id) => {
						line[skparam] += skillid_to_txt(skill_id)+", ";
					});
					line[skparam] = line[skparam].slice(0,-2); // remove last ", "
				}
			});
			result.push(line);
		}
	}
	return result;
}


function get_datatable_Buff() {
	result = [];
	
	for (let [iname, buff_obj] of buff) {
		let line = {};
		line["iname"] = buff_obj.iname;
		line["name"] = buffName[buff_obj.iname] ? buffName[buff_obj.iname] : buff_obj.iname;
		line["parse"] = buff_to_txt(buff_obj);
		line["raw"] = JSON.stringify(buff_obj);
		line["rate"] = buff_obj.rate ? buff_obj.rate : "";
		line["turn"] = buff_obj.turn ? buff_obj.turn : "";
		line["timing"] = buff_obj.timing;
		line["chktgt"] = buff_obj.chktgt;
		line["chktiming"] = buff_obj.chktiming;
		result.push(line);
	}
	return result;
}

function get_datatable_Skill() {
	result = [];
	
	for (let [iname, skill_obj] of skill) {
		let line = {};
		line["iname"] = skill_obj.iname;
		line["name"] = skillName[skill_obj.iname] ? skillName[skill_obj.iname] : skill_obj.iname;
		line["parse"] = skillid_to_txt(iname);
		line["raw"] = JSON.stringify(skill_obj);
		result.push(line);
	}
	return result;
}

function get_datatable_Unit() {
	result = [];
	
	for (let [iname, object] of unit) {
		let line = {};
		line["iname"] = object.iname;
		line["name"] = unitName[object.iname] ? unitName[object.iname] : object.iname;
		// Status => [{Lv1}, {Lv99}, {Lv120}]
		line["lvl"] = "";
		if (object.status) {
			for (let i=0; object.status[i]; i++) {
				let stats_obj = object.status[i];
				// Clone the existing line
				let line_2 = Object.assign({}, line);
				line_2["lvl"] = ["1","99","120"][i];
				// Get the stats
				stats_list.forEach((stat) => {
					line_2[stat] = stats_obj[stat] ? stats_obj[stat] : "";
				});
				result.push(line_2);
			}
		}
		else {
			// No status, set all stats to "" or datatable will complain
			stats_list.forEach((stat) => {
				line[stat] = "";
			});
			result.push(line);
		}
	}
	return result;
}

function get_datatable_Unit_wjobs() {
	result = [];
	
	// Add param PC if playable character
	for (let [iname] of unitAbilityBoard) {
		unit.get(iname)["PC"] = 1;
	}
	
	for (let [iname, object] of unit) {
		let line = {};
		line["iname"] = object.iname;
		line["name"] = unitName[object.iname] ? unitName[object.iname] : object.iname;
		line["PC"] = (object.PC) ? object.PC : "";
		// Status => [{Lv1}, {Lv99}, {Lv120}]
		line["lvl"] = "";
		if (object.status) {
			for (let i=1; object.status[i]; i++) {
				let stats_obj = object.status[i];
				// Clone the existing line
				let line_2 = Object.assign({}, line);
				line_2["lvl"] = ["1","99","120"][i];
				// Get the jobs % stats bonuses
				job_bonus = {};
				// If the unit has jobs, grab bonus rates of all jobs
				if (object.jobsets) {
					object.jobsets.forEach((job_id, index) => {
						job_obj = job.get(job_id);
						// First job bonus is 100%, else use the sub_rate (always 50% so far)
						let rate = (index == 0) ? 100 : job_obj["sub_rate"]
						// If no val for iniap in unit, use the main job one // todo check EX jobs
						if (index == 0 && stats_obj["iniap"] == null) stats_obj["iniap"] = job_obj["ranks"][14]["iniap"];
						stats_list.forEach((stat) => {
							if (job_bonus[stat] == null) job_bonus[stat] = 0; // init
							// EX job replace the old job, check if level>=120, it's main job, and ccsets exist
							if (i>1 && index == 0 && object["ccsets"]) {
								let exjob_obj = job.get(object["ccsets"][0]["m"]);
								// Tricky, if EX stats are missing, check the job in param 'origin'
								if (exjob_obj["ranks"][9] == null) {
									exjob_obj = job.get(exjob_obj["origin"]);
								}
								// If the stat rate bonus exist, add it to job_bonus
								if (exjob_obj["ranks"][9][stat]) {
									job_bonus[stat] += exjob_obj["ranks"][9][stat] * rate / 100;
								}
							}
							else {
								// If the stat rate bonus exist, add it to job_bonus
								if (job_obj["ranks"][14][stat]) {
									job_bonus[stat] += job_obj["ranks"][14][stat] * rate / 100;
								}
							}
						});
						
					});
				}
				// Calculate the stats
				stats_list.forEach((stat) => {
					if (job_bonus[stat] == null) job_bonus[stat] = 0;
					if (stats_obj[stat]) {
						line_2[stat] = stats_obj[stat];
						line_2[stat] += Math.floor(stats_obj[stat] * job_bonus[stat] / 10000);
					}
					else { line_2[stat] = ""; }
				});
				
				result.push(line_2);
			}
		}
		else {
			// No status, set all stats to "" or datatable will complain
			stats_list.forEach((stat) => {
				line[stat] = "";
			});
			result.push(line);
		}
	}
	return result;
}

function get_datatable_VisionCard() {
	let rareName = ["N","R","SR","MR","UR"];
	let tmaxlvl =  [30, 40, 60, 70, 99]
	let tlvlawa =  [[10, 15, 20, 25, 30],
					[20, 25, 30, 35, 40],
					[20, 30, 40, 50, 60],
					[30, 40, 50, 60, 70],
					[40, 55, 70, 85, 99]];
	result = [];
	for (let [iname, object] of visionCard) {
		// Skip the VC exp cards
		if (object.type == 1) continue;
		let line = {};
		line["iname"] = object.iname;
		line["name"] = visionCardName[object.iname] ? visionCardName[object.iname] : object.iname;
		line["rare"] = rareName[object.rare];
		line["cost"] = object.cost;
		for (let awk=0; awk<5; awk++) {
			// Clone the existing line
			let line_2 = Object.assign({}, line);
			let lvl_todo = tlvlawa[object.rare][awk]-1;
			let lvl_max = tmaxlvl[object.rare]-1;
			let maxed = awk == 4 ? 1 : 0;
			line_2["awk"] = awk;
			line_2["lvl"] = lvl_todo+1;
			visions_stats_list.forEach((stat) => {
				// if stat is presend in card stats
				if (object["status"] && object["status"][0][stat] != null) {
					let lv1_stat = object["status"][0][stat]
					let max_stat = object["status"][1][stat]
					line_2[stat] = Math.floor(lv1_stat + ( (max_stat-lv1_stat) * lvl_todo / lvl_max ));
				}
				else line_2[stat] = "";
			});
			// Party skills buffs
			line_2["PartyBuffs"] = "";
			line_2["CondPartyBuffs"] = "";
			object.card_buffs.forEach((bonus_group) => {
				let cnds_iname = bonus_group["cnds_iname"];
				let card_skill = skill.get(bonus_group["card_skill"]);
				let add_card_skill_buff_awake = skill.get(bonus_group["add_card_skill_buff_awake"]);
				let add_card_skill_buff_lvmax = skill.get(bonus_group["add_card_skill_buff_lvmax"]);
				
				let buff1 = get_skill_buff_at_level(card_skill, line_2["lvl"]);
				if (awk > 0) {
					let buff2 = get_skill_buff_at_level(add_card_skill_buff_awake, awk);
					buff1 = fuse_buffs(buff1, buff2);
				}
				if (awk == 4) {
					let buff3 = get_skill_buff_at_level(add_card_skill_buff_lvmax, maxed);
					buff1 = fuse_buffs(buff1, buff3);
				}
				
				if (cnds_iname) {
					// I don't want to show elem condition because the cond is also present in the buff
					let condition = visionCardLimitedCondition.get(cnds_iname);
					if (condition["elem"] && Object.keys(condition).length) line_2["CondPartyBuffs"] += buff_to_txt(buff1);
					else line_2["CondPartyBuffs"] += vc_cond_to_txt(cnds_iname)+"{ "+buff_to_txt(buff1)+" }<br/>";
				}
				else line_2["PartyBuffs"] += buff_to_txt(buff1);
			});
			// Self skills buffs
			line_2["SelfBuffs"] = "";
			line_2["CondSelfBuffs"] = "";
			line_2["CastSkill"] = "";
			object.self_buffs.forEach((bonus_group) => {
				let buff_cond = bonus_group["buff_cond"];
				let self_buff = skill.get(bonus_group["self_buff"]);
				let add_self_buff_awake = skill.get(bonus_group["add_self_buff_awake"]);
				let add_self_buff_lvmax = skill.get(bonus_group["add_self_buff_lvmax"]);
				
				if (self_buff.slot == 1) {
					line_2["CastSkill"] += "todo";
					//todo, manage castable skills
				}
				else {
					let buff1 = get_skill_buff_at_level(self_buff, line_2["lvl"]);
					if (awk > 0) {
						let buff2 = get_skill_buff_at_level(add_self_buff_awake, awk);
						buff1 = fuse_buffs(buff1, buff2);
					}
					if (awk == 4) {
						let buff3 = get_skill_buff_at_level(add_self_buff_lvmax, maxed);
						buff1 = fuse_buffs(buff1, buff3);
					}
					
					if (buff_cond) {
						// I don't want to show elem condition because the cond is also present in the buff
						let condition = visionCardLimitedCondition.get(buff_cond);
						if (condition["elem"] && Object.keys(condition).length) line_2["CondSelfBuffs"] += buff_to_txt(buff1);
						else line_2["CondSelfBuffs"] += vc_cond_to_txt(buff_cond)+"{ "+buff_to_txt(buff1)+" }<br/>";
					}
					else line_2["SelfBuffs"] += buff_to_txt(buff1);
				}
			});
			result.push(line_2);
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
	//console.log(skill_obj.iname);
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
		let max_gain = buff_result["val1"+i] - buff_result["val"+i];
		
		// Modifying min/max value to current value so we can print the buff later
		// todo add ceil for negative values
		buff_result["val"+i] = Math.floor( base_val + ( max_gain * (skill_lvl-start_lvl) / (lvl_max-start_lvl) ) );
		buff_result["val1"+i] = Math.floor( base_val + ( max_gain * (skill_lvl-start_lvl) / (lvl_max-start_lvl) ) );
		//console.log(`Base=${base_val}, Max gain=${max_gain}, skill_lvl=${skill_lvl}, lvl_max=${lvl_max}, result=${buff_result["val"+i]}`);
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
			if (buff2["type"+i] == buff1["type"+j] && buff2["calc"+i] == buff1["calc"+j] && buff2["tag"+i] == buff1["tag"+j]) {
				buff1["val"+j] += buff2["val"+i];
				buff1["val1"+j] += buff2["val1"+i];
				break;
			}
		}
	}

	return buff1;
}

// Because javascript
function round(value, decimals) {
	return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

// 
var stats_list = [
				"hp","mp","ap",
				"atk","mag","def","mnd","hit","avd",
				"dex","spd","luk","crt","crta","iniap",
				"mov","jmp","dmax",
				"asl","api","abl","ash","ama","apl",
				"ewi","eth","efi","eic","esh","eea","eda","ewa",
				"cbl","csl","cmu","cch","cdo","cst","cda","cbe","cpo","cpa","ccf","cfr","cpe","cdm","csw"
				];
				
var visions_stats_list = [
				"hp","mp","ap",
				"atk","mag","def","mnd","hit","avd",
				"dex","spd","luk","crt","crta"
				];
