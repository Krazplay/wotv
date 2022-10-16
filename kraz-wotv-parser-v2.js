/*
	*wotv-parser*
	Contain variables and fonctions for parsing skills/buffs to text
	This need to be updated when new effects are released
*/

var typetxt = []
typetxt[1] = "HP"
typetxt[2] = "TP"
typetxt[3] = "AP"
typetxt[4] = "CT"
typetxt[21] = "ATK"
typetxt[22] = "DEF"
typetxt[23] = "MAG"
typetxt[24] = "SPR"
typetxt[25] = "DEX"
typetxt[26] = "AGI"
typetxt[27] = "LUCK"
typetxt[28] = "Move"
typetxt[29] = "Jump"
typetxt[41] = "None" // Elmt for No elmt (Odin, Bahamut...)
typetxt[42] = "Fire"
typetxt[43] = "Ice"
typetxt[44] = "Wind"
typetxt[45] = "Earth"
typetxt[46] = "Lightning"
typetxt[47] = "Water"
typetxt[48] = "Light"
typetxt[49] = "Dark"
typetxt[50] = "All Elements"
typetxt[60] = "All Attack Types"
typetxt[61] = "Slash"
typetxt[62] = "Pierce"
typetxt[63] = "Strike"
typetxt[64] = "Missile"
typetxt[65] = "Magic"
typetxt[70] = "All attacks Res" // Purple Greatcoat BUFF_CLT_LW_RSNC_1 // unclear single + aoe res ?
typetxt[81] = "Regen"
typetxt[82] = "TP_Regen"
typetxt[83] = "AP_Regen"
typetxt[84] = "Poison"
typetxt[85] = "Blind"
typetxt[86] = "Sleep"
typetxt[87] = "Silence"
typetxt[88] = "Paralysis"
typetxt[89] = "Confusion"
typetxt[90] = "Charm"
typetxt[91] = "Petrify"
typetxt[92] = "Toad"
typetxt[95] = "Haste"
typetxt[96] = "Slow"
typetxt[97] = "Stop"
typetxt[98] = "Stun"
typetxt[99] = "Immobilize"
typetxt[100] = "Disable"
typetxt[101] = "Berserk"
typetxt[102] = "Doom"
typetxt[103] = "Revive"
typetxt[104] = "Reraise"
typetxt[105] = "Protect"
typetxt[106] = "Shell"
typetxt[110] = "Float"
typetxt[112] = "Quicken"
typetxt[113] = "Survive a fatal hit"
typetxt[114] = "Evade Physical hit"
typetxt[115] = "Evade Magical hit"
//typetxt[116] = "Conditional buff" special, va de pair avec le paramètre conds ?
typetxt[117] = "Next hit is Crit"
typetxt[119] = "Element Eater" // Element Eater, require a tag
typetxt[120] = "Type Killer" // Type Killer, require a tag
typetxt[121] = "Race Killer?" // Race Killer?, require a tag
typetxt[122] = "Type Killer Master Ability" // Type Killer - Cette version est uniquement sur les 3 Master Ability
typetxt[123] = "Proc buff" // proc another buff param id1
typetxt[124] = "CT Up/Down"
typetxt[126] = "with physical attack"
typetxt[130] = "with magic attack"
typetxt[134] = "Flat Dmg" // Flat Damage Type Killer
typetxt[140] = "Poison, Blind, Sleep, Silence, Paralysis, Confusion, Petrify, Toad, Immobilize, Disable, Berserk, Stun" // Esuna
typetxt[142] = "All buffs" // Dispel Counter, Erase
typetxt[144] = "Male Killer?"
typetxt[148] = "Gradual petrify?"
typetxt[151] = "Initial_AP"
typetxt[152] = "Range"
typetxt[155] = "ACC"
typetxt[156] = "EVA"
typetxt[157] = "Crit Dmg"
typetxt[158] = "CRIT"
typetxt[159] = "CRIT EVA"
typetxt[180] = "Hate"
typetxt[181] = "Brave"
typetxt[182] = "Faith"
typetxt[183] = "Skill CT Req"
typetxt[184] = "Activation CT Req"
typetxt[190] = "Acquired AP"
typetxt[191] = "Evoc Gauge Boost"
typetxt[192] = "Brave (temp)"
typetxt[193] = "Faith (temp)"
typetxt[194] = "Acquired JP"
typetxt[200] = "Debuff Res"
typetxt[202] = "ATK_debuff_Res"
typetxt[203] = "DEF_debuff_Res"
typetxt[204] = "MAG_debuff_Res" // to check
typetxt[205] = "SPR_debuff_Res"
typetxt[272] = "Slash_res_debuff_Res"
typetxt[273] = "Pierce_res_debuff_Res"
typetxt[274] = "Strike_res_debuff_Res"
typetxt[275] = "Missile_res_debuff_Res"
typetxt[276] = "Magic_res_debuff_Res"
typetxt[278] = "All_elements_debuff_Res"
typetxt[300] = "Self-cast Buff duration"
typetxt[301] = "Self-cast Debuff duration"
typetxt[310] = "Unit Attack Res"
typetxt[311] = "AoE Attack Res"
typetxt[312] = "Max Damage"
typetxt[313] = "Evocation" // Evocation magic for esper, no one cares if I remove magic (annoying for filtering)
typetxt[314] = "Def Penetration"
typetxt[316] = "AP Cost Reduction"
typetxt[319] = "Spr Penetration"
typetxt[321] = "Slash Res Pen"
typetxt[323] = "Pierce Res Pen"
typetxt[325] = "Strike Res Pen"
typetxt[327] = "Missile Res Pen"
typetxt[329] = "Magic Res Pen"
//typetxt[334] = "Fire Res Pen"
//typetxt[335] = "Ice Res Pen"
//typetxt[336] = "Wind Res Pen"
typetxt[337] = "Earth Res Pen"
typetxt[347] = "Healing Power"
typetxt[350] = "Reaction block rate"

typetxt[502] = "Frostbite?"
typetxt[509] = "Crit hit +5AP"
typetxt[511] = "Beast_Res"

//todo recheck killers
var tagtxt = []
tagtxt[2] = "Fire Eater"
tagtxt[3] = "Ice Eater"
tagtxt[4] = "Wind Eater"
tagtxt[5] = "Earth Eater"
tagtxt[6] = "Lightning Eater"
tagtxt[7] = "Water Eater"
tagtxt[8] = "Light Eater"
tagtxt[9] = "Dark Eater"
tagtxt[101] = "Man Eater"
tagtxt[102] = "Esper Eater"
tagtxt[103] = "Beast Killer"
tagtxt[104] = "Demon Killer"
tagtxt[105] = "Dragon Killer"
tagtxt[106] = "Plantoid Killer"
tagtxt[107] = "Avian Killer"
tagtxt[109] = "Aquatic Killer"
tagtxt[110] = "Machine Killer"
tagtxt[111] = "Spirit Killer"
tagtxt[112] = "Reaper Killer"
tagtxt[113] = "Stone Killer"
tagtxt[114] = "Metal Killer"
tagtxt[115] = "Magical Creature? Killer"
tagtxt[204] = "Fennes Killer"

// translate a stat buff effect to its stat name
var typestat = []
typestat[1] = "hp"
typestat[2] = "mp"
typestat[3] = "ap"
typestat[21] = "atk"
typestat[22] = "def"
typestat[23] = "mag"
typestat[24] = "mnd"
typestat[25] = "dex"
typestat[26] = "spd"
typestat[27] = "luk"
typestat[28] = "mov"
typestat[29] = "jmp"
// used for resistance
typestat[42] = "efi"
typestat[43] = "eic"
typestat[44] = "ewi"
typestat[45] = "eea"
typestat[46] = "eth"
typestat[47] = "ewa"
typestat[48] = "esh"
typestat[49] = "eda"
// used for resistance
typestat[61] = "asl"
typestat[62] = "api"
typestat[63] = "abl"
typestat[64] = "ash"
typestat[65] = "ama"
// used for resistance
typestat[84] = "cpo"
typestat[85] = "cbl"
typestat[86] = "csl"
typestat[87] = "cmu"
typestat[88] = "cpa"
typestat[89] = "ccf"
typestat[90] = "cch"
typestat[91] = "cpe"
typestat[92] = "cfr"
typestat[96] = "csw"
typestat[97] = "cst"
typestat[99] = "cdm"
typestat[100] = "cda"
typestat[101] = "cbe"
typestat[102] = "cdo"

typestat[119] = "eater"
typestat[120] = "killer"


typestat[151] = "iniap"
typestat[152] = "range"
typestat[155] = "hit"
typestat[156] = "avd"
typestat[157] = "crtd"
typestat[158] = "crt"
typestat[159] = "crta"

typestat[180] = "hate"
typestat[183] = "skill_ct" //Skill CT Req
typestat[184] = "activ_time" // "Decrease Activation Time"
typestat[190] = "acquired_ap" // Acquired AP
typestat[191] = "evoc_boost" // Evoc Gauge Boost

typestat[310] = "unit_res"
typestat[311] = "aoe_res"

typestat[312] = "dmax" // Max damage
typestat[313] = "evoc"
typestat[314] = "defpen" // "Def Penetration"
typestat[316] = "apcostreduc" // "AP Cost Reduction"
typestat[319] = "sprpen"

typestat[321] = "slashrespen" // "Slash Res Pen"
typestat[329] = "magicrespen" // "Magic Res Pen"
typestat[347] = "healpow" // "Healing Power"

var tagstat = []
tagstat[2] = "fire"
tagstat[3] = "ice"
tagstat[4] = "wind"
tagstat[5] = "earth"
tagstat[6] = "lightning"
tagstat[7] = "Water"
tagstat[8] = "light"
tagstat[9] = "dark"
tagstat[101] = "man"
tagstat[102] = "esper"
tagstat[103] = "beast"
tagstat[104] = "demon"
tagstat[105] = "dragon"
tagstat[106] = "plantoid"
tagstat[107] = "avian"
tagstat[109] = "aquatic"
tagstat[110] = "machine"
tagstat[111] = "spirit"
tagstat[112] = "reaper"
tagstat[113] = "stone"
tagstat[114] = "metal"
tagstat[115] = "magical_creature" // ???
tagstat[204] = "fennes"

var stattxt = {}


stattxt["asl"] = "Slash Res"
stattxt["api"] = "Pierce Res"
stattxt["abl"] = "Strike Res"
stattxt["ash"] = "Missile Res"
stattxt["ama"] = "Magic Res"
stattxt["atk_asl"] = "Slash Atk"
stattxt["atk_api"] = "Pierce Atk"
stattxt["atk_abl"] = "Strike Atk"
stattxt["atk_ash"] = "Missile Atk"
stattxt["atk_ama"] = "Magic Atk"

stattxt["iniap"] = "Ini AP"
stattxt["activ_time"] = "Atk skills CT"
stattxt["atk_ewi"] = "Wind Atk"
stattxt["atk_eth"] = "Thunder Atk"
stattxt["atk_efi"] = "Fire Atk"
stattxt["atk_eic"] = "Ice Atk"
stattxt["atk_esh"] = "Light Atk"
stattxt["atk_eea"] = "Earth Atk"
stattxt["atk_eda"] = "Dark Atk"
stattxt["atk_ewa"] = "Water Atk"
stattxt["ewi"] = "Wind Res"
stattxt["eth"] = "Thunder Res"
stattxt["efi"] = "Fire Res"
stattxt["eic"] = "Ice Res"
stattxt["esh"] = "Light Res"
stattxt["eea"] = "Earth Res"
stattxt["eda"] = "Dark Res"
stattxt["ewa"] = "Water Res"
stattxt["eater_fire"] = "Fire Eater"
stattxt["eater_ice"] = "Ice Eater"
stattxt["eater_wind"] = "Wind Eater"
stattxt["eater_earth"] = "Earth Eater"
stattxt["eater_lightning"] = "Lightning Eater"
stattxt["eater_Water"] = "Water Eater"
stattxt["eater_light"] = "Light Eater"
stattxt["eater_dark"] = "Dark Eater"
stattxt["killer_man"] = "Man Eater"
stattxt["killer_esper"] = "Esper Eater"
stattxt["killer_beast"] = "Beast Killer"
stattxt["killer_demon"] = "Demon Killer"
stattxt["killer_dragon"] = "Dragon Killer"
stattxt["killer_plantoid"] = "Plantoid Killer"
stattxt["killer_avian"] = "Avian Killer"
stattxt["killer_aquatic"] = "Aquatic Killer"
stattxt["killer_machine"] = "Machine Killer"
stattxt["killer_spirit"] = "Spirit Killer"
stattxt["killer_reaper"] = "Reaper Killer"
stattxt["killer_stone"] = "Stone Killer"
stattxt["killer_metal"] = "Metal Killer"
stattxt["killer_magical_creature"] = "Magical Creature? Killer"
stattxt["killer_fennes"] = "Fennes Killer"
stattxt["atk_cpo"] = "Poison"
stattxt["atk_cbl"] = "Blind"
stattxt["atk_csl"] = "Sleep"
stattxt["atk_cmu"] = "Silence"
stattxt["atk_cpa"] = "Paralyse"
stattxt["atk_ccf"] = "Confusion"
stattxt["atk_cpe"] = "Petrify"
stattxt["atk_cfr"] = "Toad"
stattxt["atk_cch"] = "Charm"
stattxt["atk_csw"] = "Slow"
stattxt["atk_cst"] = "Stop"
stattxt["atk_cdm"] = "Immobilize"
stattxt["atk_cda"] = "Disable"
stattxt["atk_cbe"] = "Berserk"
stattxt["atk_cdo"] = "Doom"
stattxt["cpo"] = "Poison Res"
stattxt["cbl"] = "Blind Res"
stattxt["csl"] = "Sleep Res"
stattxt["cmu"] = "Silence Res"
stattxt["cpa"] = "Paralyse Res"
stattxt["ccf"] = "Confusion Res"
stattxt["cpe"] = "Petrify Res"
stattxt["cfr"] = "Toad Res"
stattxt["cch"] = "Charm Res"
stattxt["csw"] = "Slow Res"
stattxt["cst"] = "Stop Res"
stattxt["cdm"] = "Immobilize Res"
stattxt["cda"] = "Disable Res"
stattxt["cbe"] = "Berserk Res"
stattxt["cdo"] = "Doom Res"

stattxt["aoe_res"] = "AoE Res"
stattxt["evoc_boost"] = "Evoc Gauge Boost"

// Convert stat string into human text
var abbr = [];


abbr["hp"] = "HP"
abbr["mp"] = "TP"
abbr["ap"] = "AP"
abbr["ct"] = "CT"
abbr["atk"] = "ATK"
abbr["def"] = "DEF"
abbr["mag"] = "MAG"
abbr["mnd"] = "SPR"
abbr["dex"] = "DEX"
abbr["spd"] = "AGI"
abbr["luk"] = "LUCK"

abbr["asl"] = "Slash"; abbr["api"] = "Pierce"; abbr["abl"] = "Strike"; abbr["ash"] = "Missile"; abbr["ama"] = "Magic"

abbr["ewi"] = "Wind"
abbr["eth"] = "Thunder"
abbr["efi"] = "Fire"
abbr["eic"] = "Ice"
abbr["esh"] = "Light"
abbr["eea"] = "Earth"
abbr["eda"] = "Dark"
abbr["ewa"] = "Water"

abbr["cpo"] = "Poison"
abbr["cbl"] = "Blind"
abbr["csl"] = "Sleep"
abbr["cmu"] = "Silence"
abbr["cpa"] = "Paralyse"
abbr["ccf"] = "Confusion"
abbr["cpe"] = "Petrify"
abbr["cfr"] = "Toad"
abbr["cch"] = "Charm"
abbr["csw"] = "Slow"
abbr["cst"] = "Stop"
abbr["cdm"] = "Immobilize"
abbr["cda"] = "Disable"
abbr["cbe"] = "Berserk"
abbr["cdo"] = "Doom"


// show_only_max_val => instead of min/max "+15/30", show only max "+30"
function skillid_to_txt(skill_id, show_only_max_val=false) {
	let result = "";
	skill_obj = skill.get(skill_id);
	
	// If skill type is 1, it's a castable skill
	if (skill_obj.type == 1) {
		result += skillName[skill_id]+"&lt;";
		if (skill_obj["barrier"]) result += "barrier todo, ";
		if (skill_obj.s_buffs) result += bufflist_to_txt(skill_obj.s_buffs, true, show_only_max_val)+", ";
		if (skill_obj.t_buffs) result += bufflist_to_txt(skill_obj.t_buffs, true, show_only_max_val)+", ";
		if (skill_obj["barrier"] || skill_obj.s_buffs || skill_obj.t_buffs) result = result.slice(0,-2);
		result += "&gt;"
	}
	// Type 6
	if (skill_obj.type == 6) {
		if (skill_obj.s_buffs) {
			result += bufflist_to_txt(skill_obj.s_buffs, true, show_only_max_val);
		}
		if (skill_obj.s_buffs && skill_obj.t_buffs) result += ", ";
		if (skill_obj.t_buffs) {
			result += bufflist_to_txt(skill_obj.t_buffs, true, show_only_max_val);
		}
	}
	
	if (result == "") result = skill_id;
	return result;
}

// The function expect by default a list of buff objects, if is_id is true, then the list contain only the iname of the buff
function bufflist_to_txt(buff_list, is_id=false, show_only_max_val=false) {
	let result = ""
	buff_list.forEach((buff_obj) => {
		if (is_id) result += buff_to_txt(buff.get(buff_obj), show_only_max_val);
		else result += buff_to_txt(buff_obj, show_only_max_val);
		result += ", ";
	});
	result = result.slice(0,-2);
	return result;
}

function buff_to_txt(buff_obj, show_only_max_val=false) {
	if (show_only_max_val == false) console.log(buff_obj);
	
	let result = ""
	// Conditions for all buff effects
	let conds_text = "";
	if (buff_obj["conds"]) {
		buff_obj["conds"].forEach((elem_id) => {
			conds_text += typetxt[31+elem_id]+", ";
		});
		conds_text = conds_text.slice(0,-2); // remove last ", "
	}
	// Buff effects
	for (let i=1; buff_obj["type"+i] != null ; i++) {
		result += effect_to_txt(buff_obj, i, show_only_max_val);
		result += ", ";
	}
	result = result.slice(0,-2);
	if (conds_text != "") result = conds_text+"{ "+result+" }";
	// Number of turns
	if (buff_obj["turn"]) {
		result += " ("+buff_obj["turn"]+"turns)";
	}
	
	return result;
}

function effect_to_txt(buff_obj, nb, show_only_max_val=false) {
	let output = ""
	let type = buff_obj["type"+nb]
	let calc = buff_obj["calc"+nb]
	let tags = buff_obj["tag"+nb]
	let valmin = buff_obj["val"+nb]
	let valmax = buff_obj["val"+nb+"1"]
	
	
	let type_str = typetxt[type];
	if (type_str == null) console.log("No text found for type "+type+" in buff "+buff_obj.iname);
    // val: no need to show min and max if identical, add + if value is positive (Slash +15 instead of Slash 15)
	let val_str = null
	let val_str_no_plus = null // alternative without adding the +
    if (valmin !== null) {
      if ((valmin == valmax) || (show_only_max_val == true)) val_str_no_plus = valmax;
      else val_str_no_plus = `${valmin}/${valmax}`;
	  val_str = (valmin >= 0) ? "+"+val_str_no_plus : val_str_no_plus;
    }
	// tags
	let tags_str = null;
	if (tags) {
		tags_str = ""
		tags.forEach((tag) => {
			if (tagtxt[tag]) tags_str += `${tagtxt[tag]}+`;
			else { tags_str += `Tag${tag}+`; console.log(`Tag ${tag} inconnu buff ${buff_obj["iname"]}`) }
		});
		tags_str = tags_str.slice(0,-1); // remove last +
	}
	
	if (calc == 1) {
		// calc 1 is usualy a flat bonus
		if (tags_str) output += `${tags_str} `;
		output += `${type_str}${val_str}`;
	} else if (calc == 2) {
		// calc 2 is usualy a % bonus
		if (tags_str) output += `${tags_str} `;
		output += `${type_str}${val_str}%`;
	} else if (calc == 3) {
		// calc 3 is used for resistance bonuses
		if (tags_str) output += `${tags_str} `;
		output += `${type_str} Res ${val_str}%`;
	} else if (calc == 10) {
		// calc 10 is used for CT
		if (tags_str) output += `${tags_str} `;
		output += `${type_str}${val_str}`;
	} else if (calc == 11 && (type == 1 || type == 2 || type == 3)) {
		// calc 11 type 1/2/3 => Restore X% of your HP/AP/TP
		let rstat = [null, "HP", "TP", "AP"];
		output += "Restore "+val_str_no_plus+"% "+rstat[type]
		// useless
		if (buff_obj["rate"] && buff_obj["rate"] != 200) output += ` (acc:${buff_obj["rate"]}%∑Faith)`;
	} else if (calc == 11 && type == 103) {	
		// calc 11 type 103 => Revive
		output += "Revive with "+val_str+"% HP (acc:"+buff_obj["rate"]+"% ∑Faith)";
	} else if (calc == 12) {
		// calc 12 recover hp (multiplier)
		output += "Heal "+val_str+"%*Pow "+type_str;
	} else if (calc == 30 && type == 123) {
		// calc 30 inflict another buff if type = 123, buff_id inflicted is in param id1
		output += "Inflict ";
		let buff_obj2 = buff.get(buff_obj["id1"]);
		output += buff_to_txt(buff_obj2, show_only_max_val);
	} else if (calc == 30 || calc == 21) {
		// calc 30 inflict status, calc 21 inflict poison
		if (tags_str) output += `${tags_str} `;
		output += `${type_str}`;
		let parenthese = "";
		// rate = 200 mean it can't miss so I don't show the accuracy (minimum faith is 30, and 200%*(30+30)=120)
		if (buff_obj["rate"] && buff_obj["rate"] != 200) parenthese += `acc:${buff_obj["rate"]}%∑Faith, `;
		if (buff_obj["turn"]) parenthese += `${buff_obj["turn"]} turns, `;
		if (val_str) parenthese += `effect:${val_str}, `;
		if (parenthese != "") {
			parenthese = parenthese.slice(0,-2); // cut last ", "
			output += " (" + parenthese + ")";
		}
	} else if (calc == 31) {
		// calc 31 status purification
		if (buff_obj["rate"] && buff_obj["rate"] != 200) output += `${buff_obj["rate"]}%∑Faith `;
		output += `Cure ${type_str}`;
	} else if (calc == 40) {	
		// calc 40 status is nullified for X turns
		if (buff_obj["rate"] && buff_obj["rate"] != 200) output += `${buff_obj["rate"]}%∑Faith `;
		output += `Nullify ${type_str} for ${buff_obj["turn"]} turns`;
	} else {
		output = "Not parsed";
		console.log(`Not parsed: Calc ${calc} Type ${type} (${buff_obj["iname"]})`);
	}
	
	// For esper table only, the sp cost has been added to the buff
	// if (buff_obj["sp"]) output += ` (${buff_obj["sp"]}sp)`; // Removed
	
	return output;
}