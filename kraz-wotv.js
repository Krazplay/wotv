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
	quicktest_add_jp_names(mapName);
	return mapName;
}

// Array version, useful for BirthTitle for example
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
	arrayName[54] = "Unaffiliated"
	return arrayName;
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
		// Loop first to get the rate sum of the tables
		let sum_table_rate = 0;
		value.drop.forEach((table_params) => {
			sum_table_rate += table_params.rate;
		});
		value.drop.forEach((table_params) => {
			let table_loot = adventureDropDeckEntity.get(table_params.drop_id);
			// Loop first to get the rate sum of the rewards in the table
			let sum_reward_rate = 0;
			table_loot.rewards.forEach((reward) => {
				sum_reward_rate += reward.rate;
			});
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
				line["sum_table_rate"] = sum_table_rate;
				line["reward_name"] = itemName[reward.iname] ? itemName[reward.iname] : reward.iname;
				line["reward_raw_rate"] = reward.rate;
				line["sum_reward_rate"] = sum_reward_rate;
				//todo Use the bonus value from AdventureUnitBonusSetting, they may change in the future
				//Bonus S=>1 M=>3 L=>5 XL=>10
				line["reward_rate"] =   round( ((table_params.rate + 0*table_params.fix_rate) * reward.rate / sum_reward_rate) / 1000, 3);
				line["reward_rate_s"] = round( ((table_params.rate + 1*table_params.fix_rate) * reward.rate / sum_reward_rate) / 1000, 3);
				line["reward_rate_m"] = round( ((table_params.rate + 3*table_params.fix_rate) * reward.rate / sum_reward_rate) / 1000, 3);
				line["reward_rate_l"] = round( ((table_params.rate + 5*table_params.fix_rate) * reward.rate / sum_reward_rate) / 1000, 3);
				line["reward_rate_xl"] = round( ((table_params.rate + 10*table_params.fix_rate) * reward.rate / sum_reward_rate) / 1000, 3);
				line["reward_rate_fever"] = round( ((table_params.fever_rate) * reward.rate / sum_reward_rate) / 1000, 3);
				result.push(line);
			});
		});
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
	if (buff_obj["type1"] >= 1 && buff_obj["type1"] <= 4) return 14;  // HP TP AP +%
	if (buff_obj["type1"] == 155) return 7;  // Accuracy
	if (buff_obj["type1"] == 156) return 9;  // Evade
	if (buff_obj["type1"] == 158) return 11; // Crit
	if (buff_obj["type1"] == 157) return 12; // Crit dmg
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
			line["bestv"] = 0;
			let plus_one = equip.iname.charCodeAt(equip.iname.length-1) + 1;
			let test = equip.iname.slice(0, equip.iname.length-2)+"_"+String.fromCharCode(plus_one);
			if (!artifact.get(equip.iname+"_1") && !artifact.get(test)) line["bestv"] = 1;
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
		line["sex"] = object.sex ? object.sex : "";
		line["rare"] = object.rare ? rareName[object.rare] : "";
		line["elem"] = elem_to_text(object.elem);
		line["species"] = species_to_text(object.species);
		
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

function elem_to_text(array) {
	if (!array) return "";
	let result = ""
	array.forEach((elem) => {
		result += typetxt[41+elem];
		result += ", ";
	});
	result = result.slice(0,-2);
	return result;
}

function species_to_text(array) {
	if (!array) return "";
	let result = ""
	// TEMP todo UnitSpecies
	let translation = ["-", "Human", "Esper", "Beast", "Demon", "Dragon", "Plantoid", "Avian", "Insect", 
						"Aquatic", "Machina", "Fairy", "Reaper", "Stone", "Metal", "Arcana"];
	array.forEach((specie) => {
		result += translation[specie];
		result += ", ";
	});
	result = result.slice(0,-2);
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

function buff_id_to_stat(buff_id) {
	let result = {}
	let buff_obj = buff.get(buff_id);
	// For conditional and party wide buffs
	let conds = buff_obj["conds"];
	let continues = buff_obj["continues"];
	if (conds || continues) result["party"] = { "%":{}, "+":{} };
	// Safe net in case with have buff with conds != continues in the future
	if (buff_obj.conds && JSON.stringify(buff_obj.conds) != JSON.stringify(buff_obj.continues) ) {
		console.log("Not handled, conds != continues in buff "+buff_id);
	}
	if ( (conds && conds.length > 1) || (continues && continues.length > 1) ) {
		console.log("Not handled, conds or continues length > 1 in buff "+buff_id);
	}
	// Not handling size > 1 because lazy
	if (conds) conds = conds[0];
	if (continues) continues = continues[0];
	
	
	// As long as we find a buff effect type
	for (let i=1; buff_obj["type"+i] != null ; i++) {
		let type = buff_obj["type"+i]
		let calc = buff_obj["calc"+i]
		let tags = buff_obj["tag"+i]
		let valmax = buff_obj["val"+i+"1"]
		// Convert type integer to the stat string name
		let stat = typestat[type];
		// Add 'atk' to not use the same code for both resistance and atk
		if (calc <= 2 && type >= 42 && type <= 102) {
			stat = "atk"+stat;
		}
		// Special case Res all elements
		if (calc == 3 && type == 50) {
			for (let elem of ["ewi","eth","efi","eic","esh","eea","eda","ewa"]) {
				if (!result["+"]) result["+"] = {};
				if (!result["+"][elem]) result["+"][elem] = 0;
				result["+"][elem] += valmax;
			}
		}
		// Special case Res all attack types
		else if (calc == 3 && type == 60) {
			for (let elem of ["asl","api","abl","ash","ama"]) {
				if (!result["+"]) result["+"] = {};
				if (!result["+"][elem]) result["+"][elem] = 0;
				result["+"][elem] += valmax;
			}
		}
		// Element eater, Type killer, etc...
		else if (calc == 30) {
			tags.forEach((tag_id) => {
				if (!result["+"]) result["+"] = {};
				if (!result["+"]["kill"+tag_id]) result["+"]["kill"+tag_id] = 0;
				result["+"]["kill"+tag_id] += valmax;
				// Ease of use, store all kill type id existing in a Set (no duplicate)
				if (!result["kill"]) result["kill"] = new Set();
				result["kill"].add(tag_id);
			});
		}
		// Classic stat bonuses
		else if (calc <= 3) {
			if (!stat) console.log("Error "+buff_id+" typestat "+type+" is null (calc "+calc+")");
			let sign = (calc ==  2) ? "%" : "+";
			
			if (!result[sign]) result[sign] = {};
			if (!result[sign][stat]) result[sign][stat] = 0;
			result[sign][stat] += valmax;
			
			// Conditional party bonus, they're already applied in stats but we still save them somewhere
			if (conds) {
				if (!result["party"][sign][stat]) result["party"][sign][stat] = {};
				if (!result["party"][sign][stat][conds]) result["party"][sign][stat][conds] = {};
				if (!result["party"][sign][stat][conds][continues]) result["party"][sign][stat][conds][continues] = 0;
				
				result["party"][sign][stat][conds][continues] += valmax;
			}
		}
		else {
			console.log("Not yet handled: calc "+calc+", type "+type+" of buff "+buff_id);
		}
	}
	return result;
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

// Sum of 2 "party" hashes which keep track of party bonuses
function sum_party_stats(origin, bonus) {
	if (!origin) origin = { "%":{}, "+":{} };
	for (const sign in bonus) {
		for (const stat in bonus[sign]) {
			if (!origin[sign][stat]) origin[sign][stat] = {};
			for (const conds in bonus[sign][stat]) {
				if (!origin[sign][stat][conds]) origin[sign][stat][conds] = {};
				for (const continues in bonus[sign][stat][conds]) {
					if (!origin[sign][stat][conds][continues]) origin[sign][stat][conds][continues] = 0;
					origin[sign][stat][conds][continues] += bonus[sign][stat][conds][continues];
				}
			}
		}
	}
	return origin
}

function get_datatable_VisionCard() {
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

function get_datatable_Skill_charac() {
	result = [];
	
	// Add param PC if playable character
	for (let [iname] of unitAbilityBoard) {
		unit.get(iname)["PC"] = 1;
	}
	
	for (let [iname, object] of unit) {
		let board = unitAbilityBoard.get(iname);
		// If has a board
		if (board) {
			let skill_list = get_unit_board_skills(iname, 25);
			let full_stats = get_unit_stats(iname);
			let stats = full_stats[full_stats.length - 1]; // use highest stats available
			
			skill_list.forEach((skill_id) => {
				let line = {};
				let sk = skill.get(skill_id);
				line["iname"] = iname;
				line["name"] = unitName[iname] ? unitName[iname] : iname;
				line["skill_id"] = skill_id;
				line["skill_name"] = skillName[skill_id] ? skillName[skill_id] : skill_id;
				line["slot"] = sk.slot ? sk.slot : ""; // castable, passive, counter, etc...
				line["cap"] = sk.cap ? sk.cap : "";    // Level cap
				line["count"] = sk.count ? sk.count : ""; // Number of cast per battle
				line["eff_val"] = sk.eff_val ? sk.eff_val+100 : "";       // Multiplier at level 1
				line["eff_val1"] = sk.eff_val1 ? sk.eff_val1+100 : "";    // Multiplier at max level
				line["cost_type"] = sk.cost_type ? sk.cost_type : ""; // Cost type (AP, TP...)
				line["cost_ap"] = sk.cost_ap ? sk.cost_ap : "";
				line["cost_mp"] = sk.cost_mp ? sk.cost_mp : "";
				line["hp_cost"] = sk.hp_cost ? sk.hp_cost : "";
				line["timing"] = sk.timing ? sk.timing : "";
				
				// Damage type
				line["atk_type"] = "";
				if (sk["atk_type"] != null) {
					let dmg_array = ["-", "Physical", "Magical", "Hybrid<br/>See FAQ"];
					if (dmg_array[sk["atk_type"]]) line["atk_type"] += dmg_array[sk["atk_type"]];
					else {
						line["atk_type"] += sk["atk_type"];
						console.log("Skill "+line["skill_name"]+" ("+line["name"]+") atk_type: "+sk["atk_type"]);
					}
				}
				// Attack type
				line["atk_det"] = "";
				if (sk["atk_det"] != null) {
					let atk_array = ["-", "Slash atk", "Pierce atk", "Strike atk", "Missile atk", "Magic atk"];
					if (atk_array[sk["atk_det"]]) line["atk_det"] += atk_array[sk["atk_det"]];
					else {
						line["atk_det"] += sk["atk_det"];
						console.log("Skill "+line["skill_name"]+" ("+line["name"]+") atk_det: "+sk["atk_det"]);
					}
				}
				
				// Main stat for calculating the skill power
				if (sk.atk_base) {
					if (atk_base[sk.atk_base]) line["atk_base"] = atk_base[sk.atk_base];
					else {
						line["atk_base"] = sk.atk_base;
						console.log("Skill "+line["skill_name"]+" ("+line["name"]+") atk_base "+sk.atk_base+" not translated");
					}
				}
				else line["atk_base"] = "";
				// Sub stats for calculating the skill power
				if (sk.atk_formula != null) {
					line["atk_formula"] = "";
					if (sk.atk_formula_t4) console.log("Warning atk_formula_t4 now exist");
					let formula_stat = [ [null, "DEX", "AGI", "LUCK"],
										 [null, "ATK"] ];
					for (let i=0; i<4; i++) {
						let atk_formula_tx = "atk_formula_t"+i;
						if (sk[atk_formula_tx]) {
							line["atk_formula"] += sk[atk_formula_tx]+"% "+formula_stat[sk.atk_formula][i]+"<br/>";
						}
					}
				}
				else line["atk_formula"] = "";
				
				// Stat power of the character for this skill
				line["stats_pow"] = ""
				if (sk.atk_base) {
					line["stats_pow"] = 0;
					if (atk_base_param[sk.atk_base]) line["stats_pow"] += stats["total"][atk_base_param[sk.atk_base]];
				}
				// From my memory the bonus for substats is truncated at each stats
				if (sk.atk_formula != null) {
					if (!line["stats_pow"]) line["stats_pow"] = 0;
					let formula_stat = [ [null, "dex", "spd", "luk"],
										 [null, "atk"] ];
					for (let i=0; i<4; i++) {
						let atk_formula_tx = "atk_formula_t"+i;
						if (sk[atk_formula_tx]) {
							line["stats_pow"] += Math.floor( sk[atk_formula_tx] * stats["total"][formula_stat[sk.atk_formula][i]] / 100 );
						}
					}
				}
				
				// Quick range
				line["range"] = "";
				if (sk["range_s"] != null || sk["range_l"] != null || sk["range_w"] != null || sk["range_h"] != null || sk["range_mh"] != null || sk["range_bns"] != null) {
					if (sk["range_s"] != null) line["range"] += `S${sk["range_s"]}`
					if (sk["range_l"] != null) line["range"] += `L${sk["range_l"]}`
					if (sk["range_w"] != null) line["range"] += `W${sk["range_w"]}`
					if (sk["range_h"] != null) line["range"] += `H${sk["range_h"]}`
					if (sk["range_mh"] != null) line["range"] += ` MH${sk["range_mh"]}`
					if (sk["range_bns"] != null) line["range"] += ` BNS${sk["range_bns"]}`
				}
				
				line["range_eff"] = "";
				if (sk["eff_s"] != null || sk["eff_l"] != null || sk["eff_w"] != null || sk["eff_h"] != null || sk["eff_mh"] != null || sk["eff_bns"] != null) {
					if (sk["eff_s"] != null) line["range_eff"] += `S${sk["eff_s"]}`
					if (sk["eff_l"] != null) line["range_eff"] += `L${sk["eff_l"]}`
					if (sk["eff_w"] != null) line["range_eff"] += `W${sk["eff_w"]}`
					if (sk["eff_h"] != null) line["range_eff"] += `H${sk["eff_h"]}`
					if (sk["eff_mh"] != null) line["range_eff"] += ` MH${sk["eff_mh"]}`
					if (sk["eff_bns"] != null) line["range_eff"] += ` BNS${sk["eff_bns"]}`
				}
				
				result.push(line);
			});
		}
	}
	return result;
}
atk_base = [];
atk_base[1] = "ATK";
atk_base[3] = "MAG";
atk_base[52] = "Max HP";
atk_base[56] = "Max TP";
atk_base[60] = "Max AP";
atk_base[102] = "Dmg taken";

atk_base_param = [];
atk_base_param[1] = "atk";
atk_base_param[3] = "mag";
atk_base_param[52] = "hp";
atk_base_param[56] = "mp";
atk_base_param[60] = "ap";


function get_unit_board_skills(unit_iname, job_level) {
	let result = [];
	
	let board = unitAbilityBoard.get(unit_iname);
	
	// For each panel
	board["panels"].forEach((panel) => {
		// If panel require a job lvl less or equal our parameter and is not a castable skill
		// Skill for damage max up, we handle it
		if ( (!panel["need_level"] || panel["need_level"] <= job_level) && panel["panel_effect_type"] == 1) {
			result.push(panel["value"]);
		}
	});
	
	return result;
}

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
					bonuses = sum_of_bonuses(bonuses, buff_id_to_stat(buff_id));
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

function get_unit_bonus_stats_wpassives(unit_iname) {
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
			
		}
	}
}

// TODO
function get_unit_passives(unit_iname, job_level) {
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



// input skill_id
// ouput array of buffs
function get_buffs_from_skill_id(skill_id) {
	let skill_obj = skill.get(skill_id);
	let arr1 = skill_obj["t_buffs"] ? skill_obj["t_buffs"] : [];
	let arr2 = skill_obj["s_buffs"] ? skill_obj["s_buffs"] : [];
	return arr1.concat(arr2);
}

// Used in craft guide
function get_craft_stats(iname, grow_id) {
	let result = {"max":{}, "%":{}};
	let equip = artifact.get(iname);
	let artgrow = grow.get(grow_id);
	result["max"]["lv"] = artgrow.curve[0]["lv"];
	for (const stat of equip_stat_list) {
		// Base max stat from item data before type multiplier
		let base_max = equip.status[1][stat];
		// Max stats
		if (base_max != null) {
			// Apply type multiplier
			if (base_max < 0) result["max"][stat] = Math.ceil(base_max + base_max * artgrow.curve[0][stat] / 100);
			else result["max"][stat] = Math.floor(base_max + base_max * artgrow.curve[0][stat] / 100);
		}
		// Base rate for stat Up before type modifier
		let base_rate = equip.randr[0][stat];
		// Final % Stat Up rate
		if (base_rate != null) {
			// Apply rate modifier
			result["%"][stat] = base_rate + artgrow.rstatus[0][stat];
		}
	}
	return result;
}

// Because javascript
function round(value, decimals) {
	return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function union(setA, setB) {
    let _union = new Set(setA)
    for (let elem of setB) {
        _union.add(elem)
    }
    return _union
}

// 
var stats_list = [
				"hp","mp","ap",
				"atk","mag","def","mnd","hit","avd",
				"dex","spd","luk","crt","crta","crtd","iniap",
				"mov","jmp","dmax",
				
				"atkasl","atkapi","atkabl","atkash","atkama",
				"asl","api","abl","ash","ama",
				
				"atkewi","atketh","atkefi","atkeic","atkesh","atkeea","atkeda","atkewa",
				"ewi","eth","efi","eic","esh","eea","eda","ewa",
				
				"atkcbl","atkcsl","atkcmu","atkcch","atkcdo","atkcst","atkcda","atkcbe","atkcpo","atkcpa",
				"atkccf","atkcfr","atkcpe","atkcdm","atkcsw",
				"cbl","csl","cmu","cch","cdo","cst","cda","cbe","cpo","cpa","ccf","cfr","cpe","cdm","csw",
				
				"unit_res", "aoe_res", "range",
				"hate", "skill_ct", "acquired_ap",
				"defpen", "sprpen", "apcostreduc", "slashrespen", "magicrespen",
				"healpow"
				];

const type_atk_list = ["atkasl","atkapi","atkabl","atkash","atkama"];
const element_atk_list = ["atkewi","atketh","atkefi","atkeic","atkesh","atkeea","atkeda","atkewa"];
const status_atk_list = ["atkcbl","atkcsl","atkcmu","atkcch","atkcdo","atkcst","atkcda","atkcbe","atkcpo","atkcpa",
						"atkccf","atkcfr","atkcpe","atkcdm","atkcsw"];
const element_res_list = ["ewi","eth","efi","eic","esh","eea","eda","ewa"];
const status_res_list = ["cbl","csl","cmu","cch","cdo","cst","cda","cbe","cpo","cpa","ccf","cfr","cpe","cdm","csw"];
				
const stats_list_table = [
				"hp","mp","ap",
				"atk","mag","def","mnd","hit","avd",
				"dex","spd","luk","crt","crta","crtd","iniap",
				"mov","jmp","dmax",
				
				"atkasl","atkapi","atkabl","atkash","atkama",
				"asl","api","abl","ash","ama",
				
				"atkewi","atketh","atkefi","atkeic","atkesh","atkeea","atkeda","atkewa",
				"ewi","eth","efi","eic","esh","eea","eda","ewa",
				
				"atkcbl","atkcsl","atkcmu","atkcch","atkcdo","atkcst","atkcda","atkcbe","atkcpo","atkcpa",
				"atkccf","atkcfr","atkcpe","atkcdm","atkcsw",
				
				"unit_res", "aoe_res", "range",
				"hate", "skill_ct", "activ_time", "acquired_ap",
				"defpen", "sprpen", "apcostreduc", "slashrespen", "magicrespen",
				"healpow"
				];
				
const visions_stats_list = [
				"hp","mp","ap",
				"atk","mag","def","mnd","hit","avd",
				"dex","spd","luk","crt","crta"
				];
				
const rareName = ["N","R","SR","MR","UR"];

const equip_stat_list = ["hp","mp","ap",
				"atk","mag","def","mnd","hit","avd",
				"dex","spd","luk","crt","crta"];
