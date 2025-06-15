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
  'ExaltedOrb.png',
  'DivineOrb.png',
  'ChaosOrb.png',
  'AnnulmentOrb.png',
  'VaalOrb.png',
  'AlchemyOrb.png',
  'RegalOrb.png',
  'AugmentationOrb.png',
  'AncientOrb.png',
  'RegalShard.png',
  'AncientShard.png',
  'TransmutationShard.png',
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
  'CurrencyArmourQuality.png',
  'CurrencyDuplicate.png',
  'CurrencyFlaskQuality.png',
  'CurrencyGemQuality.png',
  'CurrencyIdentification.png',
  'CurrencyRerollSocketNumbers01.png',
  'CurrencyRerollSocketNumbers02.png',
  'CurrencyRerollSocketNumbers03.png',
  'CurrencyWeaponMagicQuality.png',
  'CurrencyWeaponQuality.png',
  'DistilledDespair.png',
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
  'OmenOfWhittling.png',
  'OmenOftheHunt.png',
  'OmenOfSinistralExaltation.png',
  'OmenOfSinistralErasure.png',
  'OmenOfSinistralCoronation.png',
  'OmenOfSinistralAnnulment.png',
  'OmenOfSinistralAlchemy.png',
  'OmenOfSecretCompartments.png',
  'OmenOfResurgence.png',
  'OmenOfReinforcements.png',
  'OmenOfRefreshment.png',
  'OmenOfGreaterExaltation.png',
  'OmenOfGreaterAnnulment.png',
  'OmenOfDextralExaltation.png',
  'OmenOfDextralErasure.png',
  'OmenOfDextralCoronation.png',
  'OmenOfDextralAnnulment.png',
  'OmenOfDextralAlchemy.png',
  'OmenOfCorruption.png',
  'OmenOfAnsweredPrayers.png',
  'OmenOfAmelioration.png',
];

function parseIconName(filename: string) {
  // Remove file extension
  let name = filename.replace(/\.(png|jpg|jpeg|svg|webp)$/i, '');
  // Add spaces before capital letters
  name = name.replace(/([A-Z])/g, ' $1').trim();

  return name;
}

function getIconFilename(iconName: string) {
  return AVAILABLE_ICON_FILES.find(file => parseIconName(file) === iconName);
}

// Function to load available icons from public/icons directory
export const loadAvailableIcons = async (): Promise<IconOption[]> => {
  try {
    return AVAILABLE_ICON_FILES.map(file => ({
      name: parseIconName(file),
      path: `/icons/${file}`,
    }));
  } catch (error) {
    console.error('Failed to load icons:', error);
    return [];
  }
};

// Utility function to get icon path by name
export const getIconPath = (iconName: string): string => {
  if (iconName.includes('.')) {
    return `/icons/${iconName}`;
  }

  return `/icons/${getIconFilename(iconName)}`;
};

// Default icon fallback
export const DEFAULT_ICON = '/icons/CurrencyIdentification.png';

// Utility function to get icon path by name (for backward compatibility)
export const getIconComponentPath = (iconName: string): string => {
  return getIconPath(iconName);
};
