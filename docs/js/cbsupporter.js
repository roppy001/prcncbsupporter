
function calculateResultTl(){
    var preText = $('#pre_tl').val();
    $('#post_tl').val(preText);
}


function pasteInputTl(){
    if(navigator.clipboard){
        navigator.clipboard.readText()
        .then(function (text) {
            $('#pre_tl').val(text);
            calculateResultTl();
        });
    }
}

function copyResultTl(){
    navigator.clipboard.writeText($('#post_tl').val()).then(function (){alert('結果をクリップボードにコピーしました');});
}


function initEventHandler(){
    $('#paste_input_tl').on('click', pasteInputTl);
    $('#copy_result_tl1').on('click',copyResultTl);
    $('#copy_result_tl2').on('click',copyResultTl);
    $('#takeover_time').on('change',function(){
        // 整数に再セット

        calculateResultTl();
    });
    $('#pre_tl').on('change',function(){
        calculateResultTl();
    });
}  

$(function () {
    initEventHandler();
});