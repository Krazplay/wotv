
EAbilitySlot = [
	"None",
	"Main",
	"Sub",
	"Support",
	"Reaction",
	"NetherBeast",
	"Limit",
	"Master",
	"Party",
	"Enchant",
	"enumsNeedUpdate"
];

const EAttackBase = {
	0x0:"None",
	0x1:"Atk",
	0x2:"Def",
	0x3:"Mag",
	0x4:"Mnd",
	0x5:"Dex",
	0x6:"Spd",
	0x7:"Luk",
	0x14:"AtkMag50x50",
	0x32:"HpSelf",
	0x33:"HpTarget",
	0x34:"MHpSelf",
	0x35:"MHpTarget",
	0x36:"MpSelf",
	0x37:"MpTarget",
	0x38:"MMpSelf",
	0x39:"MMpTarget",
	0x3A:"ApSelf",
	0x3B:"ApTarget",
	0x3C:"MApSelf",
	0x3D:"MApTarget",
	0x3E:"CtSelf",
	0x3F:"CtTarget",
	0x64:"Value",
	0x65:"KillerValue",
	0x66:"Damage",
	0x67:"DamageValue",
	0x68:"enumsNeedUpdate"
};

const EAttackFormula = [
    "Default",
    "BraveFaith",
	"enumsNeedUpdate"
];

const EAttackType = [
    "None",
    "PhyAttack",
    "MagAttack",
    "PhyMagAttack",
	"enumsNeedUpdate"
];

const EBarrierType = [ //todo barrier
    "None",
    "Guard",
    "Life",
    "Count",
    "CountLife",
    "Turn",
    "TurnLife",
	"enumsNeedUpdate"
];

const ESkillCostType = [
    "Ap",
    "Mp",
    "MpAp",
	"enumsNeedUpdate"
];

const ESkillEffectType = {
    0x0:"None",
    0x1:"Defence",
    0x2:"Attack",
    0x3:"Absorb",
    0x4:"Buff",
    0x5:"Debuff",
    0xA:"Heal",
    0xB:"ConditionHeal",
    0xC:"ConditionInvalid",
    0xD:"BuffHeal",
    0xE:"DebuffHeal",
	0xF:"enumsNeedUpdate",
    0x14:"Revive"
};

const ESkillMoveType = [
	"None",
	"Move",
	"MoveToSkill",
	"SkillToMove",
	"enumsNeedUpdate"
];

const ESkillTarget = {
    0x0:"Self",
    0x1:"NotSelf",
    0x2:"NotSelfOfSide",
    0xA:"SelfSide",
    0xB:"EnemySide",
    0xC:"All",
    0x14:"KnockOutSelfSide",
    0x15:"KnockOutEnemySide",
    0x16:"KnockOutAll",
    0x1E:"Body",
    0x1F:"Part",
    0x20:"BodyAndPart",
	0x21:"enumsNeedUpdate",
    0x5A:"Grid"
};

const ESkillTiming = {
	0x0:"Used",
	0x1:"Passive",
	0x2:"Wait",
	0x3:"Dead",
	0x4:"DamageControl",
	0x5:"Reaction",
	0x6:"FirstReaction",
	0x7:"Dying",
	0x8:"Auto",
	0x9:"enumsNeedUpdate",
	0x63:"UsedEnchant"
};

const ESkillType = [
    "NormalAttack",
    "CommandAction",
    "CommandReaction",
    "CommandPassive",
    "ArtifactAction",
    "ArtifactReaction",
    "ArtifactPassive",
    "VisionAction",
    "VisionReaction",
    "VisionPassive",
    "Leader",
    "Item",
    "Status",
    "ArtifactActionNoDuplicate",
    "ArtifactReactionNoDuplicate",
    "ArtifactPassiveNoDuplicate",
	"enumsNeedUpdate"
];

const EStatusAttack = [
    "None",
    "Slash",
    "Pierce",
    "Blow",
    "Shot",
    "Magic",
    "Jump",
	"enumsNeedUpdate"
];



