const prisma = require("../lib/prisma");

// ==========================
// FIND FARMER BY PHONE
// ==========================

const findFarmerByPhone = async (phone) => {
  if (!phone) {
    return null;
  }

  const normalizedPhone = String(phone).replace(/\D/g, "");

  if (!normalizedPhone) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      phone: normalizedPhone,
      role: "FARMER",
    },
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
      farmer: {
        select: {
          id: true,
          district: true,
          state: true,
        },
      },
    },
  });

  return user;
};

// ==========================
// LANGUAGE MENU
// ==========================

const getLanguageMenu = () => {
  return {
    action: "LANGUAGE_SELECTION",
    message:
      "Welcome to KisanSetu. Please select your language.",
    options: {
      1: "English",
      2: "Hindi",
      3: "Odia",
      4: "Punjabi",
      5: "Marathi",
    },
  };
};

// ==========================
// PROCESS LANGUAGE
// ==========================

const processLanguage = (input) => {
  const option = String(input);

  switch (option) {
    case "1":
      return {
        success: true,
        language: "en",
        message: "English selected. Welcome to KisanSetu.",
      };

    case "2":
      return {
        success: true,
        language: "hi",
        message: "Hindi selected. Welcome to KisanSetu.",
      };

    case "3":
      return {
        success: true,
        language: "or",
        message: "Odia selected. Welcome to KisanSetu.",
      };

    case "4":
      return {
        success: true,
        language: "pa",
        message: "Punjabi selected. Welcome to KisanSetu.",
      };

    case "5":
      return {
        success: true,
        language: "mr",
        message: "Marathi selected. Welcome to KisanSetu.",
      };

    default:
      return {
        success: false,
        language: null,
        message:
          "Invalid language option. Please try again.",
      };
  }
};

// ==========================
// MAIN MENU
// ==========================

const getMainMenu = (language = "en") => {
  const menus = {
    en: {
      message: "Please select an option.",
      options: {
        1: "My Booking",
        2: "My Token",
        3: "My Produce",
        4: "Help",
        9: "Repeat Menu",
      },
    },

    hi: {
      message: "कृपया एक विकल्प चुनें।",
      options: {
        1: "मेरी बुकिंग",
        2: "मेरा टोकन",
        3: "मेरी उपज",
        4: "सहायता",
        9: "मेनू दोहराएं",
      },
    },

    or: {
      message: "ଦୟାକରି ଗୋଟିଏ ବିକଳ୍ପ ବାଛନ୍ତୁ।",
      options: {
        1: "ମୋ ବୁକିଂ",
        2: "ମୋ ଟୋକନ",
        3: "ମୋ ଉତ୍ପାଦ",
        4: "ସହାୟତା",
        9: "ମେନୁ ପୁନରାବୃତ୍ତି",
      },
    },

    pa: {
      message: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵਿਕਲਪ ਚੁਣੋ।",
      options: {
        1: "ਮੇਰੀ ਬੁਕਿੰਗ",
        2: "ਮੇਰਾ ਟੋਕਨ",
        3: "ਮੇਰੀ ਉਪਜ",
        4: "ਮਦਦ",
        9: "ਮੇਨੂ ਦੁਹਰਾਓ",
      },
    },

    mr: {
      message: "कृपया एक पर्याय निवडा.",
      options: {
        1: "माझी बुकिंग",
        2: "माझा टोकन",
        3: "माझे उत्पादन",
        4: "मदत",
        9: "मेनू पुन्हा ऐका",
      },
    },
  };

  return {
    action: "MAIN_MENU",
    language,
    ...(menus[language] || menus.en),
  };
};

// ==========================
// GET MY PRODUCE
// ==========================

const getMyProduce = async (farmerId) => {
  const produce = await prisma.produce.findMany({
    where: {
      farmerId,
    },
    include: {
      crop: {
        select: {
          name: true,
          variety: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return produce;
};

// ==========================
// FORMAT PRODUCE FOR IVR
// ==========================

const formatProduceForIVR = (produce) => {
  if (!produce || produce.length === 0) {
    return "You have no produce listings.";
  }

  const listingText = produce.map((item, index) => {
    const cropName = item.crop?.name || "Unknown crop";

    const variety = item.crop?.variety
      ? `, ${item.crop.variety}`
      : "";

    const quantity = item.quantity;
    const unit = item.unit;

    const price =
      item.price !== null && item.price !== undefined
        ? ` at ${item.price} rupees per ${unit}`
        : " with no price set";

    return `${index + 1}. ${cropName}${variety}, ${quantity} ${unit}${price}.`;
  });

  return `You have ${produce.length} produce ${
    produce.length === 1 ? "listing" : "listings"
  }. ${listingText.join(" ")}`;
};

// ==========================
// PROCESS MAIN MENU INPUT
// ==========================

const processInput = (input, language = "en") => {
  const option = String(input);

  switch (option) {
    case "1":
      return {
        action: "MY_BOOKING",
        language,
        message: "Fetching your booking information.",
      };

    case "2":
      return {
        action: "MY_TOKEN",
        language,
        message: "Fetching your token information.",
      };

    case "3":
      return {
        action: "MY_PRODUCE",
        language,
        message: "Fetching your produce information.",
      };

    case "4":
      return {
        action: "HELP",
        language,
        message: "Connecting you to KisanSetu support.",
      };

    case "9":
      return getMainMenu(language);

    default:
      return {
        action: "INVALID",
        language,
        message: "Invalid option. Please try again.",
      };
  }
};

module.exports = {
  findFarmerByPhone,
  getLanguageMenu,
  processLanguage,
  getMainMenu,
  getMyProduce,
  formatProduceForIVR,
  processInput,
};