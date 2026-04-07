// ========================================
// MEDIA/FILE UPLOAD FUNCTIONS
// ========================================

/**
 * Handle file upload
 */
function handleFileUpload(inputElement, previewElementId, count) {
    var file = inputElement.files[0];

    if (file) {
        // Validate file size (max 5MB)
        if (!validateFileSize(file)) {
            app.dialog.alert('Ukuran file terlalu besar! Maksimal 5MB');
            inputElement.value = '';
            return;
        }

        // Display preview
        displayImagePreview(file, previewElementId);
    }
}

/**
 * Display image preview
 */
function displayImagePreview(file, previewElementId) {
    var reader = new FileReader();

    reader.onload = function (e) {
        $$('#' + previewElementId).attr('src', e.target.result);
        $$('#' + previewElementId).show();
    };

    reader.readAsDataURL(file);
}

/**
 * Remove image
 */
function removeImage(inputId, previewId) {
    $$('#' + inputId).val('');
    $$('#' + previewId).attr('src', '');
    $$('#' + previewId).hide();
}

/**
 * Validate file size (max 5MB)
 */
function validateFileSize(file) {
    var maxSize = 5 * 1024 * 1024; // 5MB in bytes
    return file.size <= maxSize;
}