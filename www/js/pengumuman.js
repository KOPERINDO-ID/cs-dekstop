function getPengumuman() {
    var pengumuman = '';
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/get-pengumuman",
        dataType: 'JSON',
        data: {
        },
        beforeSend: function () {
        },
        success: function (data) {
            $("#count_pengumuman").html(data.data_count)

            $.each(data.data, function (i, item) {

                pengumuman += ' <div class="block block-strong">';
                pengumuman += '    <a class="float-right" style="color:red;" onclick="updatePengumuman(\'' + item.id + '\');"><i class="f7-icons" style="font-size:18px;">xmark</i></a>';
                pengumuman += '    <p>' + item.text + '</p>';
                pengumuman += '    <p style="font-weight: bold;">' + moment(item.dt_record).locale('id').format("dddd, DD MMM YYYY") + '</p>';
                pengumuman += ' </div> ';

            });
            jQuery('#data_pengumuman').html(pengumuman);
        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });
}

function updatePengumuman(id) {
    jQuery.ajax({
        type: 'POST',
        url: "" + BASE_API + "/update-pengumuman",
        dataType: 'JSON',
        data: {
            id: id,
            status: 1,
            user_modified: localStorage.getItem("karyawan_nama")
        },
        beforeSend: function () {
        },
        success: function (data) {
            if (data.status == 'success') {
                getPengumuman();
            } else {
                getPengumuman();
            }

        },
        error: function (xmlhttprequest, textstatus, message) {
        }
    });

}
