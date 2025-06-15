export interface IconOption {
  name: string;
  path: string;
}

// Available icon files in the public/icons directory
// To add new icons:
// 1. Place the icon file in the public/icons directory
// 2. Add the filename to the AVAILABLE_ICON_FILES array below
// 3. The icon will automatically appear in the IconPicker
const AVAILABLE_ICON_FILES = [
  'AnnullOrb.png',
  'AttributeEssence.png',
  'AzmeriSocketableOwl.png',
  'BarterRefreshCurrency.png',
  'BreachCatalystAttack.png',
  'BreachCatalystAttribute.png',
  'BreachCatalystCaster.png',
  'BreachCatalystChaos.png',
  'BreachCatalystCold.png',
  'BreachCatalystDefences.png',
  'BreachCatalystFire.png',
  'BreachCatalystFire_1.png',
  'BreachCatalystLife.png',
  'BreachCatalystLightning.png',
  'BreachCatalystMana.png',
  'BreachCatalystPhysical.png',
  'BreachCatalystSpeed.png',
  'BreachJewel.png',
  'BreachstoneSplinter.png',
  'ColdRune.png',
  'CurrencyAddEquipmentSocket.png',
  'CurrencyAddEquipmentSocketShard.png',
  'CurrencyAddModToMagic.png',
  'CurrencyAddModToRare.png',
  'CurrencyArmourQuality.png',
  'CurrencyDuplicate.png',
  'CurrencyDuplicate_1.png',
  'CurrencyFlaskQuality.png',
  'CurrencyGemQuality.png',
  'CurrencyIdentification.png',
  'CurrencyModValues.png',
  'CurrencyRerollRare.png',
  'CurrencyRerollSocketNumbers01.png',
  'CurrencyRerollSocketNumbers02.png',
  'CurrencyRerollSocketNumbers03.png',
  'CurrencyUpgradeMagicToRare.png',
  'CurrencyUpgradeMagicToRareShard.png',
  'CurrencyUpgradeToMagicShard.png',
  'CurrencyUpgradeToRare.png',
  'CurrencyUpgradeToUnique.png',
  'CurrencyUpgradeToUniqueShard.png',
  'CurrencyVaal.png',
  'CurrencyWeaponMagicQuality.png',
  'CurrencyWeaponQuality.png',
  'DistilledDespair.png',
  'DistilledDespair_1.png',
  'DistilledDisgust.png',
  'DistilledEnvy.png',
  'DistilledFear.png',
  'DistilledGreed.png',
  'DistilledGuilt.png',
  'DistilledIre.png',
  'DistilledIsolation.png',
  'DistilledParanoia.png',
  'DistilledSuffering.png',
  'FracturingOrb.png',
  'GreaterSoulCoreCrit.png',
  'MeltingMaelstrom.png',
  'MirrorRing.png',
  'PinnacleKey1.png',
  'PrecursorTabletGeneric.png',
  'TwilightOrderReliquaryKeyWorld.png',
  'VoodooOmens1Blue.png',
  'VoodooOmens1Dark.png',
  'VoodooOmens1Green.png',
  'VoodooOmens1Purple.png',
  'VoodooOmens1Red.png',
  'VoodooOmens1Red_1.png',
  'VoodooOmens1Yellow.png',
  'VoodooOmens2Blue.png',
  'VoodooOmens2Dark.png',
  'VoodooOmens2Green.png',
  'VoodooOmens2Purple.png',
  'VoodooOmens2Red.png',
  'VoodooOmens2Yellow.png',
  'VoodooOmens3Blue.png',
  'VoodooOmens3Dark.png',
  'VoodooOmens3Purple.png',
  'VoodooOmens3Red.png',
  'VoodooOmens3Yellow.png',
  'VoodooOmens4Blue.png',
  'VoodooOmens4Dark.png',
  'VoodooOmens4Green.png',
  'VoodooOmens4Purple.png',
];

// Function to load available icons from public/icons directory
export const loadAvailableIcons = async (): Promise<IconOption[]> => {
  try {
    return AVAILABLE_ICON_FILES.map(file => ({
      name: file.replace(/\.(png|jpg|jpeg|svg|webp)$/i, ''), // Remove extension for display name
      path: `/icons/${file}`,
    }));
  } catch (error) {
    console.error('Failed to load icons:', error);
    return [];
  }
};

// Utility function to get icon path by name
export const getIconPath = (iconName: string): string => {
  // If iconName already includes an extension, use it as is
  if (iconName.includes('.')) {
    return `/icons/${iconName}`;
  }

  // Otherwise, assume it's a PNG file
  return `/icons/${iconName}.png`;
};

// Default icon fallback
export const DEFAULT_ICON = '/icons/CurrencyIdentification.png';

// Utility function to get icon path by name (for backward compatibility)
export const getIconComponentPath = (iconName: string): string => {
  return getIconPath(iconName);
};
