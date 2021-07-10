// before load umamusu.json.js
// this use only console
dictionary = [ ['ぁ', 'あ'], ['ぃ', 'い'], ['ぅ', 'う'], ['ぇ', 'え'], ['ぉ', 'お'], ['っ', 'つ'], ['ゃ', 'や'], ['ゅ', 'ゆ'], ['ょ', 'よ'], ['ゎ', 'わ'], ['ァ', 'ア'], ['ィ', 'イ'], ['ゥ', 'ウ'], ['ェ', 'エ'], ['ォ', 'オ'], ['ヵ', 'カ'], ['ヶ', 'ケ'], ['ッ', 'ツ'], ['ャ', 'ヤ'], ['ュ', 'ユ'], ['ョ', 'ヨ'], ['ヮ', 'ワ'] ]
 function convert_text(text){
  $.each(dictionary, function(index, value){
    text = text.replace(value[0], value[1])
  });
  return text;
 }

umamusu_list = {}
$.each(umamusu, function(index, val){
    umamusu_list[convert_text(val["name"])] = val["id"]
});

umamusu_index_number = {}
$("#sortabletable1 thead tr").each(function(index, tr){
  $(tr).find("th").each(function(th_index, th){
    if(th_index != 0){
      umamusu_index_number[th_index] = umamusu_list[convert_text($(th).text())]
    }
  });
});
umamusu_compatibility = []
id = 1
$("#sortabletable1 tbody tr").each(function(index, tr){
  source_umamusu_id = undefined
  $(tr).find("td").each(function(td_index, td){
    if(td_index == 0){
      source_umamusu_id = umamusu_index_number[index + 1]
      if (source_umamusu_id == undefined) {
        console.log(index)
      }
    } else {
      target_umamusu_id = umamusu_index_number[td_index]
      if(source_umamusu_id != target_umamusu_id){
        umamusu_compatibility.push({
          "id": id,
          "parent_umamusu_id": source_umamusu_id,
          "groundmother_umamusu_id": target_umamusu_id,
          "value": Number($(td).text())
        });
        id += 1;
      }
    }
  });
});
text = JSON.stringify(umamusu_compatibility, null , "\t")
var file = new Blob(["window.umamusu_compatibility = " + text], { type: "text/plain;charset=UTF-8" });
// ダウンロード
link = document.createElement('a');
// ダウンロードされるファイル名
link.download = 'umamusu_compatibility.json.js';
link.href = URL.createObjectURL(file);
// ダウンロード開始
link.click();