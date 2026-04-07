// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Apply shortcut conversion pada input value
 * Cek apakah input match dengan salah satu shortcut, jika ya convert
 * @param {string} value - Input value (sudah uppercase)
 * @returns {object} - { converted: boolean, original: string, result: string }
 */
function applyInputShortcut(value) {
    if (!value) return { converted: false, original: value, result: value };
    var upper = value.toUpperCase().trim();
    if (INPUT_SHORTCUTS[upper]) {
        console.log("🔄 Shortcut applied: " + upper + " -> " + INPUT_SHORTCUTS[upper]);
        return { converted: true, original: upper, result: INPUT_SHORTCUTS[upper] };
    }
    return { converted: false, original: upper, result: upper };
}

/**
 * Fungsi untuk menentukan warna text (hitam/putih) berdasarkan brightness background color
 * Menggunakan rumus luminance: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getContrastColor(hexColor) {
    // Remove # jika ada
    hexColor = hexColor.replace('#', '');

    // Convert hex to RGB
    var r = parseInt(hexColor.substr(0, 2), 16);
    var g = parseInt(hexColor.substr(2, 2), 16);
    var b = parseInt(hexColor.substr(4, 2), 16);

    // Hitung luminance
    // Formula: (0.299 * R + 0.587 * G + 0.114 * B)
    var luminance = (0.299 * r + 0.587 * g + 0.114 * b);

    // Jika luminance > 128 (terang), gunakan text hitam
    // Jika luminance <= 128 (gelap), gunakan text putih
    return luminance > 128 ? '#000000' : '#ffffff';
}

/**
 * Get similarity code untuk custom type
 * @param {string} type - Base type (HC, PP, PC)
 * @returns {string} - Similarity code
 */
function getCustomSimilarityCode(type) {
    var customKey = CUSTOM_TO_BASE[type];
    if (customKey && CUSTOM_SIMILARITY_CODES[customKey]) {
        return CUSTOM_SIMILARITY_CODES[customKey];
    }
    return type + '-112';
}

/**
 * Convert produk_id ke API-ready code
 * Jika produk_id adalah koper custom (HCC), convert ke similarity code
 * Jika bukan, return as-is
 * 
 * @param {string} produk_id - Produk ID dari input (bisa HCC, HC-112, TAS, dll)
 * @returns {string} - API-ready produk_id
 */
function getApiReadyProdukId(produk_id) {
    if (!produk_id) return produk_id;

    var upperProdukId = produk_id.toUpperCase();

    // Cek apakah ini koper custom
    if (CUSTOM_SIMILARITY_CODES[upperProdukId]) {
        // Return similarity code untuk custom koper
        return CUSTOM_SIMILARITY_CODES[upperProdukId];
    }

    // Bukan custom koper, return as-is
    return produk_id;
}

/**
 * Escape HTML untuk keamanan
 */
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

/**
 * Check if element is hidden (display:none atau parent hidden)
 */
function isElementHidden(element) {
    if (!element) return true;

    // Cek element sendiri
    var style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
        return true;
    }

    // Cek parent elements
    var parent = element.parentElement;
    while (parent && parent !== document.body) {
        var parentStyle = window.getComputedStyle(parent);
        if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
            return true;
        }
        parent = parent.parentElement;
    }

    return false;
}

/**
 * Sum elements by class name
 */
function sumElementsByClass(className) {
    const elements = document.getElementsByClassName(className);
    let sum = 0;
    for (let i = 0; i < elements.length; i++) {
        const elementValue = parseFloat(elements[i].value) || parseFloat(elements[i].textContent) || 0;
        sum += elementValue;
    }
    return sum;
}

/**
 * Clear array helper
 */
function clearArray() {
    jenis_produk = [];
    object_produk = {};
}

/**
 * Debug form validity - untuk troubleshooting validation issues
 */
function debugFormValidity() {
    var form = document.getElementById('performa_form');
    if (!form) {
        console.error('❌ Form not found!');
        return;
    }

    var invalidFields = [];
    var allInputs = form.querySelectorAll('input, select, textarea');

    console.log('🔍 ========== DEBUG FORM VALIDITY ==========');
    console.log('Total fields to check:', allInputs.length);

    allInputs.forEach(function (input) {
        // Cek apakah field required
        var isRequired = input.hasAttribute('required');
        var isValid = input.validity.valid;
        var isHidden = isElementHidden(input);
        var value = input.value;

        if (isRequired && !isValid) {
            var fieldInfo = {
                id: input.id || 'NO_ID',
                name: input.name || 'NO_NAME',
                type: input.type,
                value: value,
                isHidden: isHidden,
                validityState: {
                    valueMissing: input.validity.valueMissing,
                    typeMismatch: input.validity.typeMismatch,
                    patternMismatch: input.validity.patternMismatch,
                    tooLong: input.validity.tooLong,
                    tooShort: input.validity.tooShort,
                    rangeUnderflow: input.validity.rangeUnderflow,
                    rangeOverflow: input.validity.rangeOverflow,
                    stepMismatch: input.validity.stepMismatch,
                    badInput: input.validity.badInput,
                    customError: input.validity.customError
                }
            };

            invalidFields.push(fieldInfo);

            console.log('❌ INVALID FIELD:', {
                id: fieldInfo.id,
                name: fieldInfo.name,
                type: fieldInfo.type,
                value: value || '(EMPTY)',
                hidden: isHidden,
                reason: input.validity.valueMissing ? 'VALUE MISSING' : 'OTHER'
            });
        }
    });

    console.log('🔍 ========== END DEBUG ==========');
    console.log('Total invalid fields:', invalidFields.length);
    console.log('Invalid fields detail:', invalidFields);

    return invalidFields;
}