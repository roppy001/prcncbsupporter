var screenId = 0;
var CHARACTER_MAX = 8;

function zenkakuToHankaku(str) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}

function parseIntWithEmpty(str) {
    if(str == '') {
        return 0;
    } else {
        return parseInt(str);
    }

}

// TL変換関連
function decodeTime(tstr){
    var arr = tstr.split(/[:：]/);
    return parseInt(zenkakuToHankaku(arr[0]))*60+parseInt(zenkakuToHankaku(arr[1]));
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
            return encodeTime(t) + (isLastSpace ? lastChar : '');
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

// 持越秒数関連
function calculateTakeoverResult(){
    // ボスHPを取得
    var bossHp = parseIntWithEmpty($('#boss_hp').val());

    // キャラを登録
    var characterArray = new Array();

    var i=0;
    for(i=0;i<CHARACTER_MAX;i++) {
        var c ={}
        c['id'] = i;
        c['name'] = $('[name="character_name"]:eq('+i+')').val();
        c['damage'] = parseIntWithEmpty($('[name="character_damage"]:eq('+i+')').val());

        if(c.damage > 0) {
            characterArray.push(c);
        }
    }

    // ボスのHPが0 もしくは 登録キャラが0名の場合は空文字列をセットして終了
    if(bossHp == 0 || c.length == 0){
        $('#tocal_result').val('');
    }

    // ダメージが大きい順にソート
    characterArray.sort(function(a, b) {
        return b.damage - a.damage;
    })

    // 持越計算結果を登録
    resultArray = new Array();

    // 持越対象でループ
    var targetIndex=0;
    for(targetIndex=0;targetIndex<characterArray.length;targetIndex++) {
        var result = {};
        var totalDamage = 0;
        var attackIndexArray = new Array();
        result['targetIndex'] = targetIndex;

        // 持越対象を除いたメンバでダメージ高い順に通した場合の
        // 持越秒数を計算
        // 持越対象がダメージを入れたら倒せるラインまで加算
        var i =0;
        for(i=0;i<characterArray.length && totalDamage + characterArray[targetIndex].damage < bossHp ;i++) {
            if(i == targetIndex){
                continue;
            }
            totalDamage += characterArray[i].damage;
            attackIndexArray.push(i);
        }

        result['attackIndexArray'] = attackIndexArray;
        result['totalDamage'] = totalDamage;

        // 既にボスのHPが0の場合は無効とする
        if(totalDamage >= bossHp) {
            continue;
        }

        // 持越秒数計算
        // ダメージが足りない場合は0秒と記載する
        var takeoverTime;

        if(totalDamage + characterArray[targetIndex].damage < bossHp){
            takeoverTime = 0;
        } else{
            takeoverTime = Math.min(90, Math.max(21, parseInt(110 - 90 * (bossHp - totalDamage) / characterArray[targetIndex].damage)));
        }

        result['takeoverTime'] = takeoverTime;

        resultArray.push(result);
    }


    // 以下の辞書順でソート
    // 1. 凸人数が少ない
    // 2. 持越秒数が多い
    // 3. 通し順のcharacterArrayのインデックス値が小さい
    // 4. 対象のインデックス値が大きい
    
    resultArray.sort(function(a, b){
        if (a.attackIndexArray.length != b.attackIndexArray.length) {
            return a.attackIndexArray.length - b.attackIndexArray.length;
        } else if(a.takeoverTime != b.takeoverTime) {
            return b.takeoverTime-a.takeoverTime;
        } else {
            var i = 0;
            for(i < 0;i<a.attackIndexArray.length;i++){
                if (a.attackIndexArray[i] != b.attackIndexArray[i]) {
                    return a.attackIndexArray[i] - b.attackIndexArray[i];
                }
            }
            return b.targetIndex - a.targetIndex;
        }
    });

    var resultStr = '';

    var resultIndex = 0;
    for(resultIndex < 0;resultIndex<resultArray.length;resultIndex++){
        result = resultArray[resultIndex];
        var str = '';
        if (result.attackIndexArray.length==0) {
            str += characterArray[result.targetIndex].name + 'が凸をした場合、\n'
        }else{
            var i=0;
            for(i=0;i<result.attackIndexArray.length;i++){
                str+=characterArray[result.attackIndexArray[i]].name+' → ';
            }

            str += characterArray[result.targetIndex].name + 'の順に凸をした場合、\n'
        }

        if(result.takeoverTime == 0) {
            str += characterArray[result.targetIndex].name + 'はダメージが足りません\n\n'
        } else {
            str += characterArray[result.targetIndex].name + 'は'+result.takeoverTime+'秒の持越秒数となります\n\n'
        }

        resultStr += str;
    }

    $('#tocal_result').val(resultStr);
}

function copyTakeoverResult(){
    navigator.clipboard.writeText($('#tocal_result').val()).then(function (){alert('結果をクリップボードにコピーしました');});
}


// 共通制御部分

function setScreen() {
    $('#tlconverter').addClass('cbs_hidden');
    $('#tocal').addClass('cbs_hidden');
    $('#select_tlconverter').removeClass('active');
    $('#select_tocal').removeClass('active');

    switch(screenId) {
        case 0:
            $('#tlconverter').removeClass('cbs_hidden');
            $('#select_tlconverter').addClass('active');
            break;
        case 1:
            $('#tocal').removeClass('cbs_hidden');
            $('#select_tocal').addClass('active');
            break;
    }
}

function initEventHandler(){
    // タブ切り替え
    $('#select_tlconverter').on('click',function(){
        screenId = 0;
        setScreen();
    });
    $('#select_tocal').on('click',function(){
        screenId = 1;
        setScreen();
    });

    // TL変換関連
    $('#paste_input_tl').on('click', pasteInputTl);
    $('#copy_result_tl1').on('click',copyResultTl);
    $('#copy_result_tl2').on('click',copyResultTl);
    $('#takeover_time').on('change',function(){
        // 整数に再セット、21～90の値に強制変換
        var n = parseIntWithEmpty($('#takeover_time').val());
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

    // 持越し秒数計算関連
    $('[name="character_name"]').on('change',function(){
        calculateTakeoverResult();
    });
    $('[name="character_damage"]').on('change',function(){
        calculateTakeoverResult();
    });
    $('#boss_hp').on('change',function(){
        calculateTakeoverResult();
    });
    $('#copy_tocal_result1').on('click',copyTakeoverResult);
    $('#copy_tocal_result2').on('click',copyTakeoverResult);
}  

$(function () {
    setScreen();
    initEventHandler();
});