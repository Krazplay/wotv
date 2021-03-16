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
		for (awk_nb = 0; awk_nb < max_awk; awk_nb++) {
			// Pick the right esper unit depending of the awakening
			let esper = awk_nb == 0 ? base_esper : unit.get(base_esper.nb_awake_id[awk_nb-1])
			//console.log(esper);
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
			// Translate into a readable text
			line["skills_txt"] =  bufflist_to_txt(buff_list);
			result.push(line);
		}
	}
	//console.log(result);
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
	//console.log(buff_list);
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
	if (buff_obj["type1"] >= 61 && buff_obj["type1"] <= 65 && buff_obj["calc1"] === 3) return 19; // type res
	if (buff_obj["type1"] == 313) return 99; // Evocation magic
	return 50;
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
