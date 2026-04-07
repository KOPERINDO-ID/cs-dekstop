// ========================================
// BANK SELECTION FUNCTIONS
// ========================================

/**
 * Select box untuk bank dropdown
 */
function selectBoxBank() {
    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/get-bank",
        dataType: "JSON",
        success: function (data) {
            var select_box_bank = '';
            select_box_bank += '<option value="" selected>-- PILIH BANK --</option>';

            jQuery.each(data.data, function (i, val) {
                select_box_bank += '<option value="' + val.bank_id + '">' + val.bank_nama + '</option>';
            });

            $$('#bank_performa').html(select_box_bank);
        }
    });
}

/**
 * Handle bank selection
 */
function handleBankSelection() {
    var bankId = $$('#bank_performa').val();

    if (bankId && bankId !== '') {
        jQuery.ajax({
            type: "POST",
            url: BASE_API + "/get-bank-detail",
            dataType: "JSON",
            data: {
                bank_id: bankId
            },
            success: function (data) {
                if (data.status == 200 && data.data) {
                    globalBankData = data.data;
                }
            }
        });
    }
}

/**
 * Update bank info
 */
function updateBankInfo(bankId) {
    $$('#bank_performa').val(bankId);
    handleBankSelection();
}

/**
 * Load bank for edit mode
 */
function loadBankForEdit(selectedBankId) {
    jQuery.ajax({
        type: "POST",
        url: BASE_API + "/get-bank",
        dataType: "JSON",
        success: function (data) {
            var select_box_bank = '';
            select_box_bank += '<option value="">-- PILIH BANK --</option>';

            jQuery.each(data.data, function (i, val) {
                var selected = (val.bank_id == selectedBankId) ? 'selected' : '';
                select_box_bank += '<option value="' + val.bank_id + '" ' + selected + '>' + val.bank_nama + '</option>';
            });

            $$('#bank_performa').html(select_box_bank);
        }
    });
}