// ========================================
// GLOBAL VARIABLES & STATE MANAGEMENT
// ========================================

// Delay timer for input debounce
var delayTimer;
var delayTimer1;

// Flag untuk block submit saat restore after delete
var isRestoringAfterDelete = false;

// Counter untuk proforma yang sedang aktif
var currentProformaCount = 1;

// Global variable untuk data potongan
var globalPotonganData = {};

// Global variable untuk warna koper
var globalKoperColor = {
    name: '',    // Nama warna, contoh: "Biru benhor"
    hex: ''      // Kode hex, contoh: "#0033de"
};

// Global variable untuk edit performa
var isEditMode = false;
var editPerformaHeaderId = null;
var editPerformaData = null;

// Jenis produk tracking
var jenis_produk = [];
var object_produk = {};

// Full colour popup instance
let currentHCCount = null;
let fullColourPopup = null;

// Original performa process untuk edit mode wrapper
var originalPerformaProcess = null;

// Phone check state
var phoneCheckInProgress = false;
var phoneCheckResult = null;

// Bank data global
var globalBankData = [];