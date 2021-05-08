$(function(){
  // datatable日本語化
  $.extend( $.fn.dataTable.defaults, { 
    language: {
        url: "http://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Japanese.json"
    } 
  }); 

  // ウマ娘リスト作成
  umamusu_array =
    $.map(window.umamusu, function(value, index){
      return { id: value["id"], text: value["name"] }
    });
  // ウマ娘相性作成
  umamusu_compatibility_hash = {}
  $.each(window.umamusu_compatibility, function(index, value){
    if(umamusu_compatibility_hash[value["parent_umamusu_id"]] == null){
      umamusu_compatibility_hash[value["parent_umamusu_id"]] = {}
    }
    umamusu_compatibility_hash[value["parent_umamusu_id"]][value["groudmother_umamusu_id"]] = value["value"]
  });
  // レース一覧
  race_hash = {}
  $.each(window.race, function(index, value){
    race_hash[value["id"]] =
      {
        date: window.school_year[value["school_year"]] + value["month"] + "月" + window.half[value["half"]],
        baba: window.baba[value["baba"]],
        name: value["name"],
        grade: window.grade[value["grade"]],
        distance: window.distance[value["distance"]]
      }
  });

  $(".umamusu-selecter .select2").select2({
    language: "ja",
    data: umamusu_array
  });
  $('.umamusu-selecter .select2').val(null).trigger('change');
  // datatable適用
  $(".race_list").DataTable({
    lengthChange: false,
    paging: false
  });

  // 親ウマが決定した場合の処理
  $(".parent select").on("change", function(){
    calc_compatibility();
    show_race_list();
  });
  // 祖母ウマが決定した場合の処理
  $(".grandmother select").on("change", function(){
    calc_compatibility();
    show_race_list();
  });
});

function calc_compatibility(){
  parent_element = $(".parent select");
  left_grandmother_element = $(".grandmother-left select");
  right_grandmother_element = $(".grandmother-right select");
  if(parent_element.val() != null && left_grandmother_element.val() != null){
    text = ""
    if(umamusu_compatibility_hash[Number(parent_element.val())] != null){
      text = umamusu_compatibility_hash[Number(parent_element.val())][Number(left_grandmother_element.val())]
    }
    $(".grandmother-left .compatibility").text(text || "")
  }
  if(parent_element.val() != null && right_grandmother_element.val() != null){
    text = ""
    if(umamusu_compatibility_hash[Number(parent_element.val())] != null){
      text = umamusu_compatibility_hash[Number(parent_element.val())][Number(right_grandmother_element.val())]
    }
    $(".grandmother-right .compatibility").text(text || "")
  }
  if($(".grandmother-left .compatibility").val() != null && $(".grandmother-right .compatibility").val() != null){
    $(".sum_compatibility .all_sum").text(Number($(".grandmother-left .compatibility").text()) + Number($(".grandmother-right .compatibility").text()))
  }
}
function show_race_list() {
  $(".sum_compatibility .race_compatibility")
}