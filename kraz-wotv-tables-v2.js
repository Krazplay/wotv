/*
	WotV-tables v2
	Contain the common code used by all the html datatable pages and the functions to
	produce the array which will feed the datatables
	get_datatables_xxx => Create an array of objects to be used as data for datatables
*/

/*
*   ====================            TABLE            ====================
*	====================            Espers           ====================
*/
function get_datatable_Esper() {
	let line_id = 1;
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
			// Is this the highest awakening level ?
			line["bestv"] = (awk_nb == max_awk-1) ? 1 : 0;
			// Checkbox Owned
			line["owned"] = "<input type=\"checkbox\" id='"+esper.iname+"'></input>"
			// Memo input
			line["memo"] = "<input type=\"text\" class=\"memo\" id='"+esper.iname+"_memo'></input>"
			// Getting all the possible stats, status[1] is the object with max stats
			const stats = Object.keys(esper.status[1]);
			stats.forEach((stat) => {
				line[stat] = esper.status[1][stat];
			});
			// Alternative text format to show element and condition resistances (alternative to icons)
			let columns = ["asl","api","abl","ash","ama","ewi","eth","efi","eic","esh","eea","eda","ewa","cpo","cbl","csl","cmu","cpa","ccf","cpe","cfr","cch","csw","cst","cdm","cda","cbe","cdo"];
			line["stat_type_elmt_text"] = "";
			columns.forEach((stat) => {
				if (esper.status[1][stat]) {
					line["stat_type_elmt_text"] += stattxt[stat]
					if (esper.status[1][stat]>=0) line["stat_type_elmt_text"] += "+";
					line["stat_type_elmt_text"] +=esper.status[1][stat]+", ";
				}
			});
			line["stat_type_elmt_text"] = line["stat_type_elmt_text"].slice(0,-2); // remove last ", "
			// Element(s) of esper
			line["elem"] = elem_to_text(esper.elem)	
			
			// Get all the buffs of the esper at this awakening
			let buff_list = get_esper_buffs(iname, awk_nb);
			let sum_stats = {};
			for (let buff_id of buff_list) {
				let bonus_stats = buff_id_to_stat(buff_id, false);
				sum_stats = sum_of_stats(sum_stats, bonus_stats);
			}
			// Delete the key after using it, it's easier to check if some buffs are not handled
			columns = ["hp%","mp%","ap%","atk%","mag%","luk%","asl","api","abl","ash","ama"];
			columns.forEach((stat) => {
				line[stat] = (sum_stats[stat]) ? sum_stats[stat]+"%" : "";
				delete sum_stats[stat];
			});
			// Type atk buffs text format (alternative to icons)
			line["type_atk_buffs_text"] = "";
			columns = ["atk_asl","atk_api","atk_abl","atk_ash","atk_ama"];
			columns.forEach((stat) => {
				if (sum_stats[stat]) { line["type_atk_buffs_text"] += stattxt[stat]+"+"+sum_stats[stat]+", "; }
			});
			line["type_atk_buffs_text"] = line["type_atk_buffs_text"].slice(0,-2); // remove last ", "
			
			columns = ["hit","avd","crt","crta", "crtd", "atk_asl","atk_api","atk_abl","atk_ash","atk_ama","iniap"];
			columns.forEach((stat) => {
				line[stat] = (sum_stats[stat]) ? "+"+sum_stats[stat] : "";
				delete sum_stats[stat];
			});
			columns = ["def","mnd","evoc","activ_time"];
			columns.forEach((stat) => {
				line[stat] = (sum_stats[stat]) ? sum_stats[stat] : "";
				delete sum_stats[stat];
			});
			// Atk buffs text format
			line["atk_buffs"] = "";
			columns = ["atk_ewi","atk_eth","atk_efi","atk_eic","atk_esh","atk_eea","atk_eda","atk_ewa","eater_fire","eater_ice","eater_wind","eater_earth","eater_lightning","eater_Water","eater_light","eater_dark"];
			columns.forEach((stat) => {
				if (stattxt[stat]) {
					if (sum_stats[stat]) {
						line["atk_buffs"] += stattxt[stat]+"+"+sum_stats[stat]+", ";
						delete sum_stats[stat];
					}
				}
				else console.log("-Not handled in stattxt: "+stat);
			});
			line["atk_buffs"] = line["atk_buffs"].slice(0,-2); // remove last ", "
			// Everything remaining in hash go to Res buff column
			line["res_buffs"] = "";
			for (const [stat, value] of Object.entries(sum_stats)) {
				if (stattxt[stat]) {
					line["res_buffs"] += stattxt[stat]+"+"+value+", ";
				}
				else console.log("Not handled in stattxt: "+stat);
			}
			line["res_buffs"] = line["res_buffs"].slice(0,-2); // remove last ", "
			
			line["line_id"] = line_id++;
			result.push(line);
		}
	}
	return result;
}

/*
*   ====================            TABLE            ====================
*	====================          Equipment          ====================
*/

function get_datatable_Equipment() {
	let line_id = 1;
	result = [];
	// Loop on all equipment
	for (let [iname, value] of artifact) {
		let equip = get_equipment_stats(iname);
		// Skip the test equipment (Apprentice stuff not existing in-game)
		if (equip.type == -1) continue;
		
		let base_line = equip;
		base_line["owned"] = "<input type=\"checkbox\" id='"+equip.iname+"' class='"+equip.iname+"'></input>"
		base_line["memo"] = "<input type=\"text\" class=\"memo "+equip.iname+"_memo\" id='"+equip.iname+"_memo'></input>"
		
		base_line["bestv"] = 0; // Is it the best + version of the equipment
		let plus_one = equip.iname.charCodeAt(equip.iname.length-1) + 1;
		let test = equip.iname.slice(0, equip.iname.length-2)+"_"+String.fromCharCode(plus_one);
		if (!artifact.get(equip.iname+"_1") && !artifact.get(test)) base_line["bestv"] = 1;
		
		// Loop for each type existing for this equipment
		equip.grows.forEach((grow_id) => {
			// Line to push, starting from cloning base_line
			let line = Object.assign({}, base_line);
			
			line["useless_vital"] = 0;
			if ((equip.grows.length > 1) && (grow_id == "AFGROW_VIT_50")) {
				line["useless_vital"] = 1;
			}
			
			line["grow"] = grow_id;
			//console.log(equip[grow_id]);
			if (equip[grow_id]) {
				let stats_list = Object.keys(equip[grow_id]);
				stats_list.forEach((stat) => {
					line[stat] = equip[grow_id][stat];
				});
			}
			
			if (equip["best_skill"]) {
				line["skill_text"] = equip[equip["best_skill"]+"_text"];
			}
			
			line["line_id"] = line_id++;
			result.push(line);
		});
	}
	return result;
}

function get_equipment_stats(iname) {
	let equip = artifact.get(iname);
	equip["grows"] = []; // Types (Assault, Vital, etc...) of the equipment
	let lot_rtype = artifactRandLot.get(equip.rtype)["lot"][0];
	// Loop as long as I find growX in artifactRandLot
	for (let i=1; lot_rtype["grow"+i]; i++) {
		equip["grows"].push(lot_rtype["grow"+i]);
	}
	
	equip["name"] = artifactName[equip.iname] ? artifactName[equip.iname] : equip.iname;
	let typeName = ["Weapon","Armor","Accessory", "-1"];
	equip["typename"] = typeName[equip.type] ? typeName[equip.type] : equip.type;
	let catName = ["0","Dagger","Sword","Greatsword","Katana","Staff","Ninja Blade","Bow","Axe", "HammerNotUsed",
					"Spear","InstrumentNotUsed","WhipNotUsed","ProjectileNotUsed","Gun","Mace","Fists","Shield","Armor","Hat",
					"Helm","Clothing","Accessory","Gloves","CAT24","CAT25","CAT26"];
	equip["catname"] = ""
	equip.cat.forEach((cat) => {
		equip["catname"] += catName[cat]+", "
	});
	equip["catname"] = equip["catname"].slice(0,-2); // Remove last ", "
	
	// Loop on all possible types to calculate the stats in a hash {grow_id}
	equip.grows.forEach((grow_id) => {
		equip[grow_id] = {};
		let curr_grow = grow.get(grow_id);
		let curve = curr_grow["curve"][0];
		
		// Getting all the possible stats, status[1] is the object with max stats
		if (equip["status"][1]) {
			let stats_list = Object.keys(equip.status[1]);
			stats_list.forEach((stat) => {
				let value = equip["status"][1][stat];
				if (value < 0) equip[grow_id][stat] = curve[stat] ? Math.ceil(value + value * curve[stat] / 100) : value;
				else equip[grow_id][stat] = curve[stat] ? Math.floor(value + value * curve[stat] / 100) : value;
			});
		}
		
	});
	
	if (equip["passives_condition"]) {
		equip["condition_text"] = [];
		equip["passives_condition"].forEach((condition_id, i) => {
			//console.log("A "+condition_id);
			//console.log("B "+iname);
			let cond = artifactPassivesCondition.get(condition_id);
			equip["condition_text"][i] = "";
			// units condition
			if (cond["units"]) {
				cond["units"].forEach((unit_id) => {
					equip["condition_text"][i] += unitName[unit_id] + ", ";
				});
				equip["condition_text"][i] = equip["condition_text"][i].slice(0,-2);
			}
			// mainjobs condition
			if (cond["mainjobs"]) {
				cond["mainjobs"].forEach((job_id) => {
					equip["condition_text"][i] += jobName[job_id] + ", ";
				});
				equip["condition_text"][i] = equip["condition_text"][i].slice(0,-2);
			}
		});
	}
	
	// skl6 exist but seems a mistake (Ras Algethi only)
	["skl1","skl2","skl3","skl4","skl5","skl6"].forEach((skparam) => {
		if (equip[skparam]) {
			equip[skparam+"_text"] = "";
			equip[skparam].forEach((skill_id, i) => {
				// Passive index 0 apply to skill 0, index 1 to skill 1; i for counting
				if (equip["passives_condition"] && equip["passives_condition"][i]) {
					//artifactPassivesCondition
					// In between 2 skills with same conditions
					if ((equip["condition_text"][i] == equip["condition_text"][i+1]) && (equip["condition_text"][i] == equip["condition_text"][i-1])) {
						equip[skparam+"_text"] += skillid_to_txt(skill_id, true)+", ";
					}
					// Next skill same condition, don't close bracket {
					else if (equip["condition_text"][i] == equip["condition_text"][i+1]) {
						equip[skparam+"_text"] += equip["condition_text"][i]+"{ "+skillid_to_txt(skill_id, true)+", ";
					}
					// Previous skill same condition, don't repeat conditions
					else if (equip["condition_text"][i] == equip["condition_text"][i-1]) {
						equip[skparam+"_text"] += skillid_to_txt(skill_id, true)+" }<br/>  ";
					}
					// Normal
					else {
						equip[skparam+"_text"] += equip["condition_text"][i]+"{ "+skillid_to_txt(skill_id, true)+" }<br/>  ";
					}
				}
				else {
					equip[skparam+"_text"] += skillid_to_txt(skill_id, true)+", ";
				}
			});
			equip[skparam+"_text"] = equip[skparam+"_text"].slice(0,-2); // remove last ", " or "  "
			equip["best_skill"] = skparam;
		}
	});
	
	return equip;
}	

/*
*   ====================            TABLE            ====================
*	====================       Vision Cards V2       ====================
*/
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
		//if (object.type == 1) continue;
		let line = {};
		line["iname"] = object.iname;
		line["name"] = visionCardName[object.iname] ? visionCardName[object.iname] : object.iname;
		line["icon"] = object.icon;
		line["piece_num"] = object.piece_num;
		line["db_num"] = object.db_num;
		line["sell"] = object.sell;
		line["sell_mdl"] = object.sell_mdl;
		line["en_cost"] = object.en_cost;
		line["en_exp"] = object.en_exp;
		line["cost"] = object.cost;
		line["rare"] = rareName[object.rare];
		
		for (let awk=0; awk<5; awk++) {
			// Clone the existing line
			let line_2 = Object.assign({}, line);
			let lvl_todo = tlvlawa[object.rare][awk]-1;
			let lvl_max = tmaxlvl[object.rare]-1;
			let maxed = awk == 4 ? 1 : 0;
			line_2["awk"] = awk;
			line_2["lvl"] = lvl_todo+1;
			
			if (object["status"]) {
				// Status
				const stats = Object.keys(object["status"][1]);
				stats.forEach((stat, value) => {
						let lv1_stat = object["status"][0][stat]
						let max_stat = object["status"][1][stat]
						line_2[stat] = Math.floor(lv1_stat + ( (max_stat-lv1_stat) * lvl_todo / lvl_max ));
				});
				// Card_buffs
				line_2["PartyBuffs"] = "";
				line_2["CondPartyBuffs"] = "";
				object.card_buffs.forEach((card_buff) => {
					let cnds_iname = card_buff["cnds_iname"];
					let card_skill = skill.get(card_buff["card_skill"]);
					let add_card_skill_buff_awake = skill.get(card_buff["add_card_skill_buff_awake"]);
					let add_card_skill_buff_lvmax = skill.get(card_buff["add_card_skill_buff_lvmax"]);
					
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
			}
			/*
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
			}); */
			result.push(line_2);
		}
	}
	return result;
}


/*
*   ====================            TABLE            ====================
*	====================        Characters V2        ====================
*/
function get_datatable_Characters() {
	let result = [];
	let line_type = ["base","board","master","total"];
	let line_id = 1;
	
	// Loop only on playable characters
	for (const [iname] of unitAbilityBoard) {
		unit_obj = unit.get(iname);

		let base_line = {};
		base_line["iname"] = unit_obj.iname;
		base_line["name"] = unitName[unit_obj.iname] ? unitName[unit_obj.iname] : unit_obj.iname;
		base_line["sex"] = unit_obj.sex == 1 ? "M" : unit_obj.sex == 2 ? "F" : "?";
		base_line["rare"] = unit_obj.rare ? rareName[unit_obj.rare] : "";
		base_line["cost"] = unit_obj.cost;
		base_line["elem"] = elem_to_text(unit_obj.elem);
		base_line["birth"] = birthTitle[unit_obj.birth];
		base_line["species"] = species_to_text(unit_obj.species);
		base_line["mainjobs"] = "";
		for (const job_id of [unit_obj.jobsets[0],unit_obj.ccsets[0]["m"]]) {
			base_line["mainjobs"] += (jobName[job_id] ? jobName[job_id] : job_id) + "<br/>";
		}
		base_line["subjobs"] = "";
		for (const job_id of unit_obj.jobsets) {
			base_line["subjobs"] += (jobName[job_id] ? jobName[job_id] : job_id) + "<br/>";
		}
		// Filled up in the loop:
		base_line["lvl"] = "";
		base_line["type_atk"] = "";
		base_line["element_atk"] = "";
		base_line["status_atk"] = "";
		base_line["element_res"] = "";
		base_line["status_res"] = "";
		base_line["kill"] = "";
		base_line["party_buffs"] = "";
		// Checkbox and memo only for max level+total stats line
		base_line["owned"] = ""
		base_line["memo"] = ""
		
		let i = unit_obj.status.length-1;
		base_line["lvl"] = ["1","99","120"][i];
		base_line["owned"] = "<input type=\"checkbox\" id='"+unit_obj.iname+"'></input>";
		base_line["memo"] = "<input type=\"text\" class=\"memo\" id='"+unit_obj.iname+"_memo'></input>";
		
		let stats = get_unit_maxstats(iname);
		let typstat = "base";
		
		// Loop on all existing stats
		let stats_list = Object.keys(stats[typstat]);
		stats_list.forEach((stat) => {
			base_line[stat] = stats[typstat][stat];
		});
		
		
		result.push(base_line);
		/*
		// Status => [{Lv1}, {Lv99}, {Lv120}] Loop only on 99+
		let stats = get_unit_stats(iname);
		for (let i=1; unit_obj.status[i]; i++) {
			base_line["lvl"] = ["1","99","120"][i];
			// Loop on line_type
			for (const typstat of line_type) {
				

				
				if (stats[i][typstat]["hit_stat"] != null) {
					line["hit_stat"] = stats[i][typstat]["hit_stat"];
					delete stats[i][typstat]["hit_stat"];
				}
				else { line["hit_stat"] = ""; }
				
				if (stats[i][typstat]["avd_stat"] != null) {
					line["avd_stat"] = stats[i][typstat]["avd_stat"];
					delete stats[i][typstat]["avd_stat"];
				}
				else { line["avd_stat"] = ""; }
				
				// Party bonus
				let partybonus = stats[i][typstat]["party"];
				if (partybonus) {
					for (sign in partybonus) {
						for (stat in partybonus[sign]) {
							for (conds in partybonus[sign][stat]) {
								for (continues in partybonus[sign][stat][conds]) {
									line["party_buffs"] += condsTxt(conds)+ " allies: "
									line["party_buffs"] += abbrTxt(stat)+" "
									if (partybonus[sign][stat][conds][continues] >= 0) line["party_buffs"] += "+"
									line["party_buffs"] += partybonus[sign][stat][conds][continues];
									if (sign=="%") line["party_buffs"] += "%";
									line["party_buffs"] += "<br/>";
								}
							}
						}
					}
				}
				
				// Type attacks loop
				type_atk_list.forEach((type_atk) => {
					if (stats[i][typstat][type_atk]) {
						line["type_atk"] += abbr[type_atk.slice(3)] + " Atk "
						if (stats[i][typstat][type_atk] >= 0) line["type_atk"] += "+"
						line["type_atk"] += stats[i][typstat][type_atk] + "<br/>";
						delete stats[i][typstat][type_atk];
					}
				});
				
				// Element attacks loop
				element_atk_list.forEach((elmt_atk) => {
					if (stats[i][typstat][elmt_atk]) {
						line["element_atk"] += abbr[elmt_atk.slice(3)] + " Atk "
						if (stats[i][typstat][elmt_atk] >= 0) line["element_atk"] += "+"
						line["element_atk"] += stats[i][typstat][elmt_atk] + "<br/>";
						delete stats[i][typstat][elmt_atk];
					}
				});
				
				// Status attacks loop
				status_atk_list.forEach((sta_atk) => {
					if (stats[i][typstat][sta_atk]) {
						line["status_atk"] += abbr[sta_atk.slice(3)] + " "
						if (stats[i][typstat][sta_atk] >= 0) line["status_atk"] += "+"
						line["status_atk"] += stats[i][typstat][sta_atk] + "<br/>";
						delete stats[i][typstat][sta_atk];
					}
				});
				
				// Element resistances loop
				element_res_list.forEach((elmt_res) => {
					if (stats[i][typstat][elmt_res]) {
						line[elmt_res] = stats[i][typstat][elmt_res];
						delete stats[i][typstat][elmt_res];
					}
				});
				
				// Status resistances loop
				status_res_list.forEach((sta_res) => {
					if (stats[i][typstat][sta_res]) {
						line[sta_res] = stats[i][typstat][sta_res];
						delete stats[i][typstat][sta_res];
					}
				});
				
				// Element eater, type killer, etc...
				// If there is at least one killer bonus
				if (stats[i][typstat]["kill"]) {
					// Loop on the table keeping all the tag_id present
					for (const tag_id of stats[i][typstat]["kill"]) {
						// Do we have a name for this tag ?
						let tag_name = tagtxt[tag_id];
						if (tag_name) {	line["kill"] += tag_name+" "+stats[i][typstat]["kill"+tag_id]+"<br/>"; }
						else {
							console.log("Lack definition of tag "+tag_id);
							line["kill"] += "Something "+stats[i][typstat]["kill"+tag_id]+"<br/>";
						}
					}
				}
				// Push the line created
				line["line_id"] = line_id++;
				result.push(line);
			}
		}*/
	}
	return result;
}

/*
*   ====================            TABLE            ====================
*	====================          Buff list          ====================
*/
function get_datatable_Buff() {
	result = [];
	
	for (let [iname, buff_obj] of buff) {
		//buff_obj["raw"] = JSON.stringify(buff_obj);
		parse_buff(buff_obj);
		buff_obj["name"] = buffName[buff_obj.iname] ? buffName[buff_obj.iname] : buff_obj.iname;
		buff_obj["parse"] = buff_to_txt(buff_obj);
		result.push(buff_obj);
	}
	return result;
}

function parse_buff(buff) {
	buff["type_html"] = "";
	buff["calc_html"] = "";
	buff["val_html"] = "";
	buff["val1_html"] = "";
	buff["tags_html"] = "";
	buff["effects_html"] = "";
	// A buff can have multiple effects, loop on all typeX
	for (let i=1; buff["type"+i] != null ; i++) {
		buff["type_html"] += (i==1) ? buff["type"+i] : "<br>"+buff["type"+i];
		buff["calc_html"] += (i==1) ? buff["calc"+i] : "<br>"+buff["calc"+i];
		if (buff["val"+i] != null) buff["val_html"] += (i==1) ? buff["val"+i] : "<br>"+buff["val"+i];
			else buff["val_html"] += (i==1) ? "-" : "<br>-";
		if (buff["val"+i+"1"] != null) buff["val1_html"] += (i==1) ? buff["val"+i+"1"] : "<br>"+buff["val"+i+"1"];
			else buff["val1_html"] += (i==1) ? "-" : "<br>-";
		if (buff["tag"+i] != null) buff["tags_html"] += (i==1) ? buff["tag"+i].toString() : "<br>"+buff["tag"+i].toString();
			else buff["tags_html"] += (i==1) ? "-" : "<br>-";
		
		if (i!=1) buff["effects_html"] += "<br>";
		buff["effects_html"] += effect_to_txt(buff, i);
	}
	return buff;
}


/*
*   ====================            TABLE            ====================
*	====================          Skill list         ====================
*/
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

function get_datatable_Skills() {
	let result = [];
	let all_param = [];
	let line_id = 1;
	
	for (let [iname, skill_obj] of skill) {
		let line = {};
		line["name"] = skillName[skill_obj.iname] ? skillName[skill_obj.iname] : skill_obj.iname;
		line["line_id"] = line_id++;
		
		let param_list = Object.keys(skill_obj);
		param_list.forEach((param) => {
			line[param] = skill_obj[param];
			if (!all_param.includes(param)) all_param.push(param);
		});

		result.push(line);
	}
	
	console.log(all_param);
	//console.log(result);
	return result;
}

/*
*   ====================            TABLE            ====================
*	====================         VC Sub Buff         ====================
*/
function get_datatable_VC_Sub_Buff() {
	let line_id = 1;
	result = [];
	for (let [id, item] of visioncardsubbuff) {
		let line = {};
		line["itemid"] = id;
		line["buff"] = item.buff;
		line["buff_text"] = typetxt[item.buff];
		line["ratio1"] = item.card_ratios[0]/10;
		line["ratio2"] = item.card_ratios[1]/10;
		line["ratio3"] = item.card_ratios[2]/10;
		line["ratio4"] = item.card_ratios[3]/10;
		line["ratio5"] = item.card_ratios[4]/10;
		// Push the line created
		line["line_id"] = line_id++;
		result.push(line);
	}
	return result;
}


/*
*   ====================            TABLE            ====================
*	====================     Chocobo Adventure v2    ====================
*/
function get_datatable_Adventure() {
	result = [];
	const curDate = Date.now();
	const curDay = new Date().getDay();
	const areaDropTime = getAreaDropTime(); // easier way to get drop_start_at/end_at from AdventureArea
	
	for (let [key, value] of adventureAreaDropDeck) {
		// Determine if active today (area open + campaign + day of the week)
		// Is the area open ? First event areas
		let is_open = "";
		let dropTime = areaDropTime[value["area_iname"]];
		if (dropTime && dropTime["drop_start_at"] && dropTime["drop_end_at"]) {
			let begin = Date.parse(dropTime["drop_start_at"]);
			let end = Date.parse(dropTime["drop_end_at"]);
			if (curDate < end && curDate > begin) {
				is_open = "yes";
			}
		}
		
		// Loop first to get the rate sum of the tables
		let sum_table_rate = 0;
		value.drop.forEach((table_params) => {
			sum_table_rate += table_params.rate;
		});
		// Loop drops from AreaDropDeck
		value.drop.forEach((table_params) => {
			let table_loot = adventureDropDeckEntity.get(table_params.drop_id);
			// Loop first to get the rate sum of the rewards in the table
			let sum_reward_rate = 0;
			// table_loot may be null, they removed drop_ip 3002 in DeckEntity while it's still referenced in DropDeck for example...
			if (table_loot) {
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
					line["shard_rarity"] = unit.get(reward.iname) ? unit.get(reward.iname).rare : "";
					line["is_open"] = is_open;
					
					result.push(line);
				});
			}
			// Still add a line to indicate a drop table is missing in DeckEntity
			else {
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
				line["reward_name"] = "Table_"+table_params.drop_id+"_Missing";
				line["sum_reward_rate"] = sum_reward_rate;
				line["is_open"] = is_open;
				result.push(line);
			}
		});
	}
	return result;
}
// Because javascript
function round(value, decimals) {
	return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function getAreaDropTime() {
	let result = {}
	for (let [key, value] of adventureArea) {
		// If there is only one "drop", the begin/end date may only be present in the area data
		result[key] ??= {}; // init if undefined
		if ((value.drop.length == 0) || (!(value.drop[0]["drop_start_at"]))) {
			result[key]["drop_area_id"] = value["area_iname"];
			result[key]["drop_start_at"] = value["begin_at"];
			result[key]["drop_end_at"] = value["end_at"];
		}
		// Do not overwrite if no drop_start_at/drop_end_at
		value.drop.forEach((drop_param) => {
			if (drop_param["drop_start_at"]) { result[drop_param["drop_area_id"]] = drop_param; }
		});
	}
	return result;
}

/*
	Print current special area in html ID open_event_areas
*/
function print_AdventureArea() {
	// String result inserted in html element
	let result = "";
	let result2 = ""; // added for classic areas
	// Current date, needed to check if an area is active
	let curDate = Date.now();
	// Loop adventure area
	for (let [iname, object] of adventureArea) {
		// Want to check only the temporary areas
		if (object["begin_at"] && object["end_at"]) {
			let begin = Date.parse(object["begin_at"]);
			let end = Date.parse(object["end_at"]);
			// Only if currently active
			if (curDate > begin && curDate < end) {
				result += "Event area "+iname+" open from "+object["begin_at"]+" to "+object["end_at"]+"<br/>";
				// Multipart event have multiple dropset
				object["drop"].forEach((dropset) => {
					if (dropset["drop_start_at"]) {
						result += "&emsp;&emsp;&emsp;Switch to "+dropset["drop_area_id"]+" from "+dropset["drop_start_at"]+" to "+dropset["drop_end_at"]+"<br/>";
					}
				})
			}
		}
		// Classic areas do not have a begin_at and end_at
		else {
			
		}
	}
	document.getElementById("open_event_areas").innerHTML = result;
}

function print_ScheduledCampaigns() {
	// String result inserted in html element
	let result = "";
	const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	const shortday = ["sun","mon","tue","wed","thu","fri","sat"];
	// Current date, needed to check if a campaign is active
	const curDate = Date.now();
	const curDay = new Date().getDay();
	// Loop adventure campaign periods
	for (let [campaign_id, object] of adventureCampaignPeriod) {
		// Want to check only the temporary areas
		if (object["begin_at"] && object["end_at"]) {
			let begin = Date.parse(object["begin_at"]);
			let end = Date.parse(object["end_at"]);
			// Only if currently active
			if (curDate < end) {
				if (curDate > begin) { result += '<span style="color:rgb(255,0,0);font-weight:bold;">' }
				result += "Campaign ID "+campaign_id+" from "+object["begin_at"]+" to "+object["end_at"]+"<br/>";
				// Campaign effects
				let effects = adventureCampaignEffect.get(campaign_id)["effects"];
				effects.forEach((effect) => {
					if (effect["effect"] == "drop_rare_up") {
						result += "&emsp;&emsp;&emsp;Drop Rare Up: use "+ effect["value"] +" ( ";
					}
					else result += "&emsp;&emsp;&emsp;"+effect["effect"]+": "+ effect["value"] +"% ( ";
					for (let i = 0; i < 7; i++) {
						result += effect[shortday[i]] ? weekday[i]+" " : "";
					}
					result += ")<br/>";
				})
				if (curDate > begin) { result += "</span>" }
			}
		}
	}
	document.getElementById("next_scheduled_campaigns").innerHTML = result;
}


/*
*   ====================   Common functions used   ====================
*	====================  in all datatables pages  ====================
*/

// Array will be used by datatable columnDefs to set their visibility to false
function get_columns_to_hide() {
	// Get url parameters
	const queryString = window.location.search;
	urlParams = new URLSearchParams(queryString);
	const hidecol = urlParams.get('hidecol');
	// If hidecol param in url, use that
	if (hidecol != null) {
		console.log("Columns visibility loaded from URL");
		return hidecol.split(',').map(x=>+x); // convert to array of integers
	}
	// Nothing in url, check localstorage
	else if ( localStorage.getItem(getPageName()+"_columns") != null ) {
		console.log("Columns visibility loaded from localstorage");
		return localStorage.getItem(getPageName()+"_columns").split(',').map(x=>+x);
	}
}

// Return what language to use
function get_language() {
	let lang = localStorage.getItem("language");
	if ( lang == null ) { lang = "en" }
	console.log("Language="+lang);
	return lang;
}

// Return the game version data to use
function get_version() {
	let version = localStorage.getItem("version");
	if ( version == null ) { version = "gl" }
	console.log("Game version="+version);
	return version;
}

// Used to prefix some local storage variable names with the page name
function getPageName() {
	var url = window.location.pathname;
    var index = url.lastIndexOf("/") + 1;
    var filenameWithExtension = url.substr(index);
    var filename = filenameWithExtension.split(".")[0];
    return filename;
}

// For all checkbox inputs, check the local storage for a saved state
function load_checkboxes_state() {
	$("input[type=checkbox]").each(function() {
		var id = $(this).attr('id');
		$(this).prop('checked', localStorage.getItem(id) == "true"); // getItem return a string
	});
	
	$("input[type=text].memo").each(function() {
		var id = $(this).attr('id');
		$(this).val( localStorage.getItem(id) );
	});
}

// Add an event on all checkboxes, saving any state change in local storage
function add_event_save_checkbox() {
	$("input[type=checkbox]").change(function() {
		var id = $(this).attr('id');
		localStorage.setItem(id, $(this).prop('checked'));
		$( "input[type=checkbox]."+id ).prop('checked', $(this).prop('checked')); // Check all checkboxes same class
	});
	
	$("input[type=text].memo").on( 'keyup change', function() {
		var id = $(this).attr('id');
		localStorage.setItem(id, $(this).val());
		$( "input[type=text]."+id ).val( $(this).val() );
	});
}

// Proced by onkeyup event or memo size input
function memoSizeChange(e) {
	let val = parseInt(document.getElementById(e.target.id).value);
	if (!isNaN(val)) {
		localStorage.setItem(e.target.id, val);
		$( ".thmemo" ).css({"min-width": val+"px"});
		$( ".thmemo" ).css({"max-width": val+"px"});
	}
}

// Delay to avoid filtering while the user is still typing
function delay(fn, ms) {
	let timer = 0
	return function(...args) {
		clearTimeout(timer);
		timer = setTimeout(fn.bind(this, ...args), ms || 0);
	}
}

// If there are filters in the url as param, write them down in the input filter fields
// urlParams defined in get_columns_to_hide()
function prefill_filters_via_url() {
	// Filter prefilled via url
	let nb_columns = table.columns().count();
	let need_redraw = false;
	for (let i=0; i < nb_columns; i++) {
		let search_col = urlParams.get('filter'+i);
		if (search_col != null) {
			search_col = decodeURIComponent(search_col);
			if( $('input[name=regex_search]').is(':checked') ) {
				table.column(i).search( search_col, true, false );  // value, regex?, smart search?
			}
			else {
				table.column(i).search( search_col );
			}
			need_redraw = true;
			// write the url filter in the input field
			$( "table thead tr:eq(1) th[data-column-index='"+i+"'] input" ).val( search_col );
		}
	}
	if (need_redraw) table.draw(); // refresh only if an url filter was found
}

function attach_functions_on_events() {
	// Event fired when a column visibility change
	table.on( 'column-visibility.dt', function ( e, settings, column, state ) {
		save_col_vis_to_localstorage();
	});
	
	// Event fired when the user start moving a row
	nb_lines = table.rows().count();
	table.on( 'pre-row-reorder.dt', function ( e, node, index ) {
		for (let i=0; i < nb_lines; i++) {
			let r = table.row( ':eq('+i+')' )
			r.data().line_id = i+1;
			r.invalidate();
		}
	} );
	
	// Event fired when the user finish moving a row
	table.on( 'row-reordered.dt', function ( e, diff, edit ) {
		table.order( [ 0, 'asc' ] ).draw();
		load_checkboxes_state(); // needed to keep checkboxes state after the reorder
	} );
	
	// Event fired when the user finish moving a column
	table.on( 'column-reorder', function ( e, settings, details ) {
		load_checkboxes_state(); // needed to keep checkboxes state after the reorder
	} );
}

function set_default_val_dropdown() {
	$("#language").val(language);
	$("#version").val(version);
}

function languageChange(value) {
	console.log("Switch to "+value);
	localStorage.setItem("language", value);
	location.reload();
}

function versionChange(value) {
	console.log("Switch to "+value);
	localStorage.setItem("version", value);
	location.reload();
}

// Check columns visibility and input and write the equivalent url in #table_url
function refresh_url_span() {
	var table = $('#myTable').DataTable();
	let url_param = "";
	if (urlParams.get('file')) url_param += "?file="+urlParams.get('file');
	
	// Loop as much as there are columns
	let nb_columns = table.columns().count();
	for (let i=1; i < nb_columns; i++) {
		// Try to get the input val
		let input_val = $( "table thead tr:eq(1) th[data-column-index='"+i+"'] input" ).val();
		if (input_val != "" && input_val != null) {
			url_param += (url_param == "") ? "?" : "&";
			url_param += "filter"+i+"="+encodeURIComponent(input_val);
		}
	}
	// Write the url in the document now
	var url_table = window.location.protocol + '//' + window.location.hostname + window.location.pathname;
	$('#table_url').html(url_table+url_param);
};

// Save current columns visibility into localstorage
function save_col_vis_to_localstorage() {
	var resultset = table.columns().visible();
	var list_col = "";
	for (var i = 1; i < resultset.length; i++) {
		if (resultset[i] == false) {
			if (list_col != "") list_col += ",";
			list_col += i.toString()
		};
	}
	localStorage.setItem(getPageName()+"_columns", list_col);
}