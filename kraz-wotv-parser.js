/*
	*wotv-parser*
	Contain variables and fonctions for parsing skills/buffs to text
	This need to be updated when new effects are released
*/

//todo rescan buffs and check missing types
// from ruby code 
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
typetxt[81] = "Regen"
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
typetxt[105] = "Protect"
typetxt[106] = "Shell"
typetxt[110] = "Float"
typetxt[112] = "Quicken"
typetxt[113] = "Survive Fatal hit"
typetxt[114] = "Evade Physical hit"
typetxt[115] = "Evade Magical hit"
//typetxt[116] = "Conditional buff" special, va de pair avec le paramètre conds ?
typetxt[117] = "Next hit is Crit"
typetxt[119] = "" // Element Eater, require a tag
typetxt[120] = "" // Type Killer, require a tag
typetxt[122] = "" // Type Killer - Cette version est uniquement sur les 3 Master Ability
typetxt[123] = "Proc buff" // proc another buff param id1
typetxt[124] = "CT Up/Down"
typetxt[134] = "Flat Dmg" // Flat Damage Type Killer
typetxt[140] = "Poison, Blind, Sleep, Silence, Paralysis, Confusion, Petrify, Toad, Immobilize, Disable, Berserk, Stun" // Esuna
typetxt[142] = "All buffs" // Dispel Counter, Erase
typetxt[144] = "Male Killer?"
typetxt[151] = "Initial AP"
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
typetxt[190] = "Acquired AP"
typetxt[191] = "Evoc Gauge Boost"
typetxt[192] = "Brave (temp)"
typetxt[193] = "Faith (temp)"
typetxt[194] = "Acquired JP"
typetxt[200] = "Debuff Res"
typetxt[202] = "ATK debuff Res"
typetxt[300] = "Self-cast Buff duration"
typetxt[301] = "Self-cast Debuff duration"
typetxt[310] = "Unit Attack Res"
typetxt[311] = "AoE Attack Res"
typetxt[313] = "Evocation" // Evocation magic for esper, no one cares if I remove magic (annoying for filtering)
typetxt[314] = "Def Penetration"
typetxt[316] = "AP Cost Reduction"
typetxt[329] = "Magic Res Pen"
typetxt[347] = "Healing Power"

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

function skillid_to_txt(skill_id) {
	let result = "";
	skill_obj = skill.get(skill_id);
	
	// If skill type is 1, it's a castable skill
	if (skill_obj.type == 1) {
		result += skillName[skill_id]+"{";
		if (skill_obj["barrier"]) result += "barrier todo, ";
		if (skill_obj.s_buffs) result += bufflist_to_txt(skill_obj.s_buffs, true)+", ";
		if (skill_obj.t_buffs) result += bufflist_to_txt(skill_obj.t_buffs, true)+", ";
		if (skill_obj["barrier"] || skill_obj.s_buffs || skill_obj.t_buffs) result = result.slice(0,-2);
		result += "}"
	}
	// Type 6
	if (skill_obj.type == 6) {
		if (skill_obj.s_buffs) {
			result += bufflist_to_txt(skill_obj.s_buffs, true);
		}
		if (skill_obj.s_buffs && skill_obj.t_buffs) result += ", ";
		if (skill_obj.t_buffs) {
			result += bufflist_to_txt(skill_obj.t_buffs, true);
		}
	}
	
	if (result == "") result = skill_id;
	return result;
}

// The function expect by default a list of buff objects, if is_id is true, then the list contain only the iname of the buff
function bufflist_to_txt(buff_list, is_id=false) {
	let result = ""
	buff_list.forEach((buff_obj) => {
		if (is_id) result += buff_to_txt(buff.get(buff_obj));
		else result += buff_to_txt(buff_obj);
		result += ", ";
	});
	result = result.slice(0,-2);
	return result;
}

function buff_to_txt(buff_obj) {
	let result = ""
	
	for (let i=1; buff_obj["type"+i] != null ; i++) {
		result += effect_to_txt(buff_obj, i);
		result += ", ";
	}
	result = result.slice(0,-2);
	return result;
}

function effect_to_txt(buff_obj, nb) {
	let output = ""
	let type = buff_obj["type"+nb]
	let calc = buff_obj["calc"+nb]
	let tags = buff_obj["tag"+nb]
	let valmin = buff_obj["val"+nb]
	let valmax = buff_obj["val"+nb+"1"]
	
	let type_str = typetxt[type];
    // val: no need to show min and max if identical, add + if value is positive (Slash +15 instead of Slash 15)
	let val_str = null
    if (valmin !== null) {
      if (valmin == valmax) val_str = valmin >= 0 ? `+${valmin}` : `${valmin}`;
      else val_str = (valmin >= 0) ? `+${valmin}/${valmax}` : `${valmin}/${valmax}`;
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
	} else if (calc == 11 && type == 103) {	
		// calc 11 type 103 => Revive
		output += "Revive with "+val_str+"% HP (acc:"+buff_obj["rate"]+"% ∑Faith)";
	} else if (calc == 12) {
		// calc 12 recover hp (multiplier)
		output += "Heal "+val_str+"x "+type_str;
	} else if (calc == 30 && type == 123) {
		// calc 30 inflict another buff if type = 123, buff_id inflicted is in param id1
		output += "Inflict ";
		let buff_obj2 = buff.get(buff_obj["id1"]);
		output += buff_to_txt(buff_obj2);
	} else if (calc == 30 || calc == 21) {
		// calc 30 inflict status, calc 21 inflict poison
		if (tags_str) output += `${tags_str} `;
		output += `${type_str}`;
		output += " (";
		// rate = 200 mean it can't miss so I don't show the accuracy (minimum faith is 30, and 200%*(30+30)=120)
		if (buff_obj["rate"] && buff_obj["rate"] != 200) output += `acc:${buff_obj["rate"]}%∑Faith, `;
		if (buff_obj["turn"]) output += `${buff_obj["turn"]} turns, `;
		if (val_str) output += `effect:${val_str}, `;
		output = output.slice(0,-2);
		output += ")";
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
	if (buff_obj["sp"]) output += ` (${buff_obj["sp"]}sp)`;
	
	return output;
}