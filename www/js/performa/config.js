// ========================================
// GLOBAL CONFIGURATION & FEATURE FLAGS
// ========================================

/**
 * Feature flags untuk custom koper types
 * Set ke true untuk enable, false untuk disable
 */
const FEATURE_FLAGS = {
    ENABLE_HCC: true,   // Hard Case Custom - ACTIVE (satu-satunya custom koper)
    ENABLE_HPP: false,  // DISABLED - HPP sekarang jadi shortcut ke PP (katalog)
    ENABLE_HPC: false,  // DISABLED - HPC sekarang jadi shortcut ke PC (katalog)
};

/**
 * Similarity codes untuk custom types
 * Digunakan saat load ukuran/material/style dropdown
 * Code ini memiliki data lengkap di database
 */
const CUSTOM_SIMILARITY_CODES = {
    HCC: "HC-112",  // Hard Case yang paling lengkap
};

/**
 * Valid koper types
 * Array ini digunakan untuk validasi dan deteksi
 */
const KOPER_TYPES = {
    KATALOG: ["HC", "PP", "PC"],           // Koper katalog (2 atau 6 digit)
    CUSTOM: ["HCC"]          // Koper custom (jika enabled)
};

/**
 * Validation rules untuk format input
 */
const FORMAT_RULES = {
    KOPER_KATALOG: [2, 6],   // HC, PP, PC: 2 atau 6 digit
    KOPER_CUSTOM: null,       // HCC: flexible (HPP/HPC sudah jadi shortcut ke PP/PC)
    TAS: [3]                  // TAS: hanya 3 digit
};

/**
 * Input shortcuts - auto-convert ketikan user ke kode katalog
 * Contoh: user ketik "HCA" -> otomatis jadi "HC"
 * Yang dikirim ke backend tetap HC, PC, PP (kode katalog)
 */
const INPUT_SHORTCUTS = {
    "HCA": "HC",   // HCA -> HC (Hard Case katalog)
    "HPC": "PC",   // HPC -> PC (Polycarbonate katalog)
    "HPP": "PP"    // HPP -> PP (Polypropylene katalog)
};

/**
 * Mapping custom type ke base type
 */
const CUSTOM_TO_BASE = {
    "HCC": "HC"
};

/**
 * API Base URLs (dapat dikonfigurasi)
 */
// BASE_API dan BASE_PATH_IMAGE sudah didefinisikan di tempat lain
// Tidak perlu didefinisikan ulang di sini

/**
 * Non-indexed form fields yang tidak memerlukan index
 */
const NON_INDEXED_FIELDS = [
    'status_perusahaan', 'client_id',
    'total_performa_sum', 'total_performa_qty',
    'status_ongkir', 'biaya_kirim',
    'client_nama', 'alamat', 'kota', 'kota_id',
    'person', 'posisi', 'telepon', 'sales_kota',
    'performa_header_id', 'bank_performa'
];

/**
 * File upload field names
 */
const FILE_UPLOAD_FIELDS = [
    'customer_logo',
    'customer_logo_bordir',
    'customer_logo_tambahan'
];

/**
 * Checkbox field names
 */
const CHECKBOX_FIELDS = {
    grosir: '#grosir',
    xtra: '#xtra',
    extra: '#extra'
};