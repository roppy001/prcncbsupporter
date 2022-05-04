
function hankakuToZenkaku(str) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}
function decodeTime(tstr){
    var arr = tstr.split(/[:：]/);
    return parseInt(hankakuToZenkaku(arr[0]))*60+parseInt(hankakuToZenkaku(arr[1]));
}

function encodeTime(t){
    s = t % 60;
    return parseInt(t/60) + ':' + ((s < 10) ? '0' : '') + s;
}

function calculateResultTl(){
    var preText = $('#pre_tl').val();
    var takeoverTime = parseInt($('#takeover_time').val());

    var postText = '＜持越'+takeoverTime+'秒のTL＞\n';
    var i;
    var linearray = preText.split(/\r\n|\n/);
    var flg=true;
    var zeroCutFlg = $('#zero_cut').prop('checked');

    for(i=0;i<linearray.length;i++){
        var tmpstr = linearray[i].replaceAll(/[0-9０-９]{1,2}[:：][0-9０-９]{2}[ 　]?/g,
        function(m, offset){
            var lastChar = m[m.length-1];
            var isLastSpace = lastChar == ' ' || lastChar == '　';
            var t = Math.max(0, decodeTime(m) + takeoverTime - 90);
            if (t == 0 && offset == 0 && isLastSpace) {
                flg=false;
            }
            return encodeTime(t) + (isLastSpace ? ' ' : '');
        } );

        if(flg || !zeroCutFlg){
            postText += tmpstr + '\n';
        }
    }

    $('#post_tl').val(postText);
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
        // 整数に再セット、21～90の値に強制変換
        var n = parseInt($('#takeover_time').val());
        n = Math.min(90,Math.max(21, n));
        $('#takeover_time').val(n);

        calculateResultTl();
    });
    $('#pre_tl').on('change',function(){
        calculateResultTl();
    });
    $('#zero_cut').on('change',function(){
        calculateResultTl();
    });
}  

$(function () {
    initEventHandler();
});