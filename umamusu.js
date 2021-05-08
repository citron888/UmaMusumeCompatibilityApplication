// datatable_checker
datatable = null;

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
    umamusu_compatibility_hash[value["parent_umamusu_id"]][value["groundmother_umamusu_id"]] = value["value"]
  });
  // レース一覧
  race_hash = {}
  $.each(window.race, function(index, value){
    race_hash[value["id"]] =
      {
        id: value["id"],
        date: window.school_year[value["school_year"]] + value["month"] + "月" + window.half[value["half"]],
        baba: window.baba[value["baba"]],
        name: value["name"],
        grade_id: value["grade"],
        grade: window.grade[value["grade"]],
        distance: window.distance[value["distance"]]
      }
  });
  // 出場レース
  umamusu_race_hash = {}
  $.each(window.umamusu_race, function(index, value){
    if(umamusu_race_hash[value["race_id"]] == null){
      umamusu_race_hash[value["race_id"]] = []
    }
    umamusu_race_hash[value["race_id"]].push(value["umamusu_id"])
  });
  show_race_list();

  $(".umamusu-selecter .select2").select2({
    language: "ja",
    data: umamusu_array
  });
  $('.umamusu-selecter .select2').val(null).trigger('change');

  // 親ウマが決定した場合の処理
  $(".parent select").on("change", function(){
    calc_compatibility();
    show_race_list();
    before_left_value = $(".grandmother-left select").val();
    before_right_value = $(".grandmother-right select").val();
    parent_element = $(".parent select");
    sort_umamusu_array = Array.from(umamusu_array)
    if(umamusu_compatibility_hash[Number(parent_element.val())] != null){
      sort_umamusu_array.sort(function(a, b){
        a_num = Number(umamusu_compatibility_hash[Number(parent_element.val())][Number(a["id"])]) || 0
        b_num = Number(umamusu_compatibility_hash[Number(parent_element.val())][Number(b["id"])]) || 0
        return b_num - a_num;
      })
    }

    $(".grandmother .select2").empty();
    $(".grandmother-left .select2").select2({
      language: "ja",
      data: $.map(sort_umamusu_array, function(value, index){
        if(value["id"] == before_left_value){
          return { id: value["id"], text: value["text"], selected: true }
        } else if (before_left_value == null && value["id"] == Number(parent_element.val())) {
          return { id: value["id"], text: value["text"], selected: true }
        } else {
          return value;
        }
      }),
    });
    if(before_left_value == null){
      $(".grandmother-left .select2-selection__rendered").text("");
    }
    $(".grandmother-right .select2").select2({
      language: "ja",
      data: $.map(sort_umamusu_array, function(value, index){
        if(value["id"] == before_right_value){
          return { id: value["id"], text: value["text"], selected: true }
        } else if (before_right_value == null && value["id"] == Number(parent_element.val())) {
          return { id: value["id"], text: value["text"], selected: true }
        } else {
          return value;
        }
      }),
    });
    if(before_right_value == null){
      $(".grandmother-right .select2-selection__rendered").text("");
    }
  });
  // 祖母ウマが決定した場合の処理
  $(".grandmother select").on("change", function(){
    calc_compatibility();
    show_race_list();
  });
  $(".set_other").on("change", function(){
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
  parent_element = $(".parent select");
  left_grandmother_element = $(".grandmother-left select");
  right_grandmother_element = $(".grandmother-right select");
  race_data = []
  if(datatable) {
    datatable.state.clear();
    datatable.destroy();
    $(".race_list tbody > tr").remove();
  }
  // 親・祖母が片方でも選択済の場合は特定のレースだけ開く。まだの場合、全データ出力
  if(parent_element.val() != null && (left_grandmother_element.val() != null || left_grandmother_element.val() != null)){
    $.each(race_hash, function(index, value){
      parent_flg = $.inArray(Number(parent_element.val()), umamusu_race_hash[value["id"]]) != -1
      left_grand_flg = $.inArray(Number(left_grandmother_element.val()), umamusu_race_hash[value["id"]]) != -1
      right_grand_flg = $.inArray(Number(right_grandmother_element.val()), umamusu_race_hash[value["id"]]) != -1
      if(parent_flg || left_grand_flg || right_grand_flg){
        race_data.push(make_once_race_data(value, parent_flg, left_grand_flg, right_grand_flg));
      } else if($(".set_other").prop("checked")) {
        if(value["grade_id"] == 1 || value["grade_id"] == 2 || value["grade_id"] == 3){
          race_data.push(make_once_race_data(value, parent_flg, left_grand_flg, right_grand_flg));
        }
      }
    });
  } else {
    race_data = []
    $.each(race_hash, function(index, value){
      race_data.push(make_once_race_data(value));
    });
  }
  // datatable適用
  datatable =
    $(".race_list").DataTable({
      data: race_data,
      paging: false,
      pageLength: "10000000"
    });
  change_entry_race_sum(datatable)
}

function change_entry_race_sum(datatable){
  entry_race_count = 0;
  ura_flag = true
  if(ura_flag) {
    entry_race_count += 3
  }
  $.each(datatable.$("input[type='checkbox'].entry_race:checked"), function(index, value){
    grade = $($(value).closest("tr").find("td")[2]).find("span").text()
    // 重賞の場合数える
    if(grade == 1 || grade == 2 || grade == 3){
      entry_race_count++; 
    }
  });
  $(".sum_compatibility .race_compatibility").text(entry_race_count);
  $(".sum_compatibility .all_sum").text(Number($(".grandmother-left .compatibility").text()) + Number($(".grandmother-right .compatibility").text()) + entry_race_count)
}

function make_once_race_data(value, parent_flg, left_grand_flg, right_grand_flg){
  race_count = 0
  if(parent_flg){
    race_count++;
  }
  if(left_grand_flg){
    race_count++;
  }
  if(right_grand_flg){
    race_count++;
  }
  checked = ""
  if(parent_flg || left_grand_flg || right_grand_flg) {
    checked = " checked"
  }
  return [
    "<span class='hidden'>" + ("000" + value["id"]).slice( -3 ) + "</span><input type='checkbox' class='entry_race' onchange='change_entry_race_sum(datatable)' value='1' name='" + value["id"] + "'" + checked + "></input>" + value["name"],
    value["date"],
    "<span class='hidden'>" + value["grade_id"] + "</span>" + value["grade"],
    value["baba"],
    value["distance"],
    race_count,
    ""
  ];
}