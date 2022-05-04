
function displayResultTl( preTl, takeoverTime){

}

function pasteInputTl(){
    
    if(navigator.clipboard){
        navigator.clipboard.readText()
        .then(function(text){
            $('#pre_tl').val(text);
        });
    }
}

function initEventHandler(){
    $('#paste_input_tl').on('click', pasteInputTl);
    $('#copy_result_tl1').on('click',function(){
    });
    $('#copy_result_tl2').on('click',function(){
    });
    $('#takeover_time').on('change',function(){
        // 整数に再セット


    });
    $('#pre_tl').on('change',function(){
    });
}  

$(function () {
    initEventHandler();
});