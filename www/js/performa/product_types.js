// ========================================
// PRODUCT TYPE DETECTION & VALIDATION
// ========================================

/**
 * Deteksi tipe produk dari input
 * @param {string} tipe - Input tipe (contoh: "HC-112", "PP", "PC-118")
 * @returns {object} - { type: 'HC'|'PP'|'PC'|'TAS', isCustom: boolean, isKoper: boolean }
 */
function detectProductType(tipe) {
    if (!tipe) return { type: null, isCustom: false, isKoper: false };

    // Check custom types first (lebih spesifik) - hanya jika enabled
    for (let customType of KOPER_TYPES.CUSTOM) {
        if (FEATURE_FLAGS['ENABLE_' + customType] && tipe.indexOf(customType) != -1) {
            const baseType = CUSTOM_TO_BASE[customType] || customType.substring(0, 2);
            return { type: baseType, isCustom: true, isKoper: true };
        }
    }

    // Check katalog types
    for (let koperType of KOPER_TYPES.KATALOG) {
        if (tipe.indexOf(koperType) != -1) {
            return { type: koperType, isCustom: false, isKoper: true };
        }
    }

    // Check tas
    if (tipe.indexOf("TAS") != -1) {
        return { type: 'TAS', isCustom: false, isKoper: false };
    }

    return { type: null, isCustom: false, isKoper: false };
}

/**
 * Validasi format input berdasarkan tipe
 * @param {string} tipe - Input tipe
 * @returns {object} - { valid: boolean, message: string }
 */
function validateInputFormat(tipe) {
    const productInfo = detectProductType(tipe);

    if (!productInfo.type) return { valid: true, message: '' };
    if (productInfo.isCustom) return { valid: true, message: '' };

    if (productInfo.isKoper) {
        const validLengths = FORMAT_RULES.KOPER_KATALOG;
        if (!validLengths.includes(tipe.length)) {
            return {
                valid: false,
                message: "Panjang Huruf Tipe " + productInfo.type + " harus " + validLengths.join(' atau ') + " Digit. Contoh: (" + productInfo.type + " atau " + productInfo.type + "-112)"
            };
        }
    }

    if (productInfo.type == 'TAS') {
        const validLengths = FORMAT_RULES.TAS;
        if (!validLengths.includes(tipe.length)) {
            return {
                valid: false,
                message: 'Panjang Huruf Tipe TAS adalah 3 Digit. Contoh: (TAS)'
            };
        }
    }

    return { valid: true, message: '' };
}