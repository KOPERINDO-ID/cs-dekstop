// ========================================
// FORM SUBMISSION FUNCTIONS
// ========================================

/**
 * Process performa form submission (CREATE)
 */
function performaProcess() {
    // Validate phone first
    if (!validatePhoneBeforeSubmit()) {
        return;
    }

    // Build form data
    var formData = buildCleanFormData();

    // Check if needs approval
    var hasApproval = hasNeedsApproval();

    // Show loading
    app.preloader.show();

    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/create-performa",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        dataType: "JSON",
        success: function (data) {
            app.preloader.hide();

            if (data.status == 200) {
                if (hasApproval) {
                    app.dialog.alert(
                        'Performa berhasil diajukan untuk persetujuan!',
                        function () {
                            mainView.router.back();
                        }
                    );
                } else {
                    app.dialog.alert(
                        'Data Performa berhasil disimpan!',
                        function () {
                            mainView.router.back();
                        }
                    );
                }
            } else {
                app.dialog.alert(data.message || 'Terjadi kesalahan saat menyimpan data');
            }
        },
        error: function (xhr, status, error) {
            app.preloader.hide();
            console.error('Error submitting form:', error);
            app.dialog.alert('Terjadi kesalahan saat mengirim data. Silakan coba lagi.');
        }
    });
}

/**
 * Process performa form update (EDIT)
 */
function updatePerformaProcess() {
    // Validate phone first
    if (!validatePhoneBeforeSubmit()) {
        return;
    }

    // Build form data
    var formData = buildCleanFormData();

    // Check if needs approval
    var hasApproval = hasNeedsApproval();

    // Show loading
    app.preloader.show();

    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/update-performa",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        dataType: "JSON",
        success: function (data) {
            app.preloader.hide();

            if (data.status == 200) {
                if (hasApproval) {
                    app.dialog.alert(
                        'Perubahan performa berhasil diajukan untuk persetujuan!',
                        function () {
                            mainView.router.back();
                        }
                    );
                } else {
                    app.dialog.alert(
                        'Data Performa berhasil diupdate!',
                        function () {
                            mainView.router.back();
                        }
                    );
                }
            } else {
                app.dialog.alert(data.message || 'Terjadi kesalahan saat mengupdate data');
            }
        },
        error: function (xhr, status, error) {
            app.preloader.hide();
            console.error('Error updating form:', error);
            app.dialog.alert('Terjadi kesalahan saat mengirim data. Silakan coba lagi.');
        }
    });
}