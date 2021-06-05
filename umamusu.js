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
  umamusu_array.unshift({ id: 0, text: "　", selcted: true })
  // ウマ娘詳細情報配列作成
  umamusu_status_hash = {}
  $.each(window.umamusu, function(index, value){
    umamusu_status_hash[value["id"]] = value
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
  // ウマ娘ステータス表示
  show_umamusu_status();
  // 全レース一覧表示
  show_race_list();

  // select2適用
  $(".umamusu-selecter .select2").select2({
    language: "ja",
    data: umamusu_array
  });
  $('.umamusu-selecter .select2').val(null).trigger('change');

  // 親ウマが決定した場合の処理
  $(".parent select").on("change", function(){
    calc_compatibility();
    show_race_list();
    show_umamusu_status();
    change_schedule_umamusu($(this), "");
    make_schedule_table();
    before_left_value = $(".grandmother-left select").val();
    before_right_value = $(".grandmother-right select").val();
    parent_element = $(".parent select");
    sort_umamusu_array = Array.from(umamusu_array)
    if(umamusu_compatibility_hash[Number(parent_element.val())] != null){
      sort_umamusu_array.sort(function(a, b){
        if(Number(b["id"] == 0)){
          return 1;
        } else {
          a_num = Number(umamusu_compatibility_hash[Number(parent_element.val())][Number(a["id"])]) || 0
          b_num = Number(umamusu_compatibility_hash[Number(parent_element.val())][Number(b["id"])]) || 0
          return b_num - a_num;
        }
      })
    }

    $(".grandmother .select2").empty();
    $(".grandmother-left .select2").select2({
      language: "ja",
      data: $.map(sort_umamusu_array, function(value, index){
        if(value["id"] == before_left_value){
          return { id: value["id"], text: value["text"], selected: true }
        } else {
          return value;
        }
      }),
    });
    $(".grandmother-right .select2").select2({
      language: "ja",
      data: $.map(sort_umamusu_array, function(value, index){
        if(value["id"] == before_right_value){
          return { id: value["id"], text: value["text"], selected: true }
        } else {
          return value;
        }
      }),
    });
  });
  // 祖母ウマが決定した場合の処理
  $(".grandmother select").on("change", function(){
    calc_compatibility();
    show_race_list();
    show_umamusu_status();
    change_schedule_umamusu($(this), "");
    make_schedule_table();
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
  if(parent_element.val() != null || (left_grandmother_element.val() != null || left_grandmother_element.val() != null)){
    $.each(race_hash, function(index, value){
      parent_goal_flg = $.inArray(Number(parent_element.val()), umamusu_race_hash[value["id"]]) != -1
      left_grand_goal_flg = $.inArray(Number(left_grandmother_element.val()), umamusu_race_hash[value["id"]]) != -1
      right_grand_goal_flg = $.inArray(Number(right_grandmother_element.val()), umamusu_race_hash[value["id"]]) != -1
      if(parent_goal_flg || left_grand_goal_flg || right_grand_goal_flg){
        parent_goal = parent_goal_flg ? "goal" : false
        left_grand_goal = left_grand_goal_flg ? "goal" : false
        right_grand_goal = right_grand_goal_flg ? "goal" : false
        race_data.push(make_once_race_data(value, parent_goal, left_grand_goal, right_grand_goal));
      } else if($(".set_other").prop("checked")) {
        if(value["grade_id"] == 1 || value["grade_id"] == 2 || value["grade_id"] == 3){
          parent_goal = parent_goal_flg ? "goal" : false
          left_grand_goal = left_grand_goal_flg ? "goal" : false
          right_grand_goal = right_grand_goal_flg ? "goal" : false
          race_data.push(make_once_race_data(value, parent_goal, left_grand_goal, right_grand_goal));
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
      pageLength: "10000000",
      order: [4, "asc"],

    });
  datatable.on("draw", function(){
    $(".checkbox_button").off("change.clear_group_check")
    $(".checkbox_button").on("change.clear_group_check", function(){
      group = $(this).attr('name');
      $(".checkbox_button").filter(function() {
        return $(this).attr('name') == group;
      }).not(this).removeAttr('checked');
    })
    $(".target_race").closest("td").addClass("target_race_wrapper")
    $(".select_all_parent_race").off("click.select_all_parent_race")
    $(".select_all_parent_race").on("click.select_all_parent_race", function(){
      $(".race_list").find(".parent_checkbox").prop("checked", true)
    });
  });
  change_entry_race_sum(datatable)
}

function change_entry_race_sum(datatable){
  entry_race_count = 0;
  ura_flag = true
  if(ura_flag) {
    entry_race_count += 3 * 2
  }
  $.each(datatable.$("tr"), function(index, value){
    grade = $($(value).find("td")[5]).find("span").text()
    // 重賞の場合数える
    if(grade == 1 || grade == 2 || grade == 3){
      check_parent = $($(value).find("td")[0]).find("input[type=checkbox]")
      check_grand_left = $($(value).find("td")[1]).find("input[type=checkbox]")
      check_grand_right = $($(value).find("td")[2]).find("input[type=checkbox]")
      if(check_parent.prop("checked") && check_grand_left.prop("checked")){
        entry_race_count++;
      }
      if(check_parent.prop("checked") && check_grand_right.prop("checked")){
        entry_race_count++;
      }
    }
  });
  $(".sum_compatibility .race_compatibility").text(entry_race_count);
  $(".sum_compatibility .all_sum").text(Number($(".grandmother-left .compatibility").text()) + Number($(".grandmother-right .compatibility").text()) + entry_race_count)
}

function make_once_race_data(value, parent_flg, left_grand_flg, right_grand_flg){
  parent_checked = ""
  left_grand_checked = ""
  right_grand_checked = ""
  parent_goal = ""
  left_grand_goal = ""
  right_grand_goal = ""
  if(parent_flg){
    parent_checked = " checked"
    if(parent_flg == "goal"){
      parent_goal = " target_race'"
    }
  }
  if(left_grand_flg){
    left_grand_checked = " checked"
    if(left_grand_flg == "goal"){
      left_grand_goal = " target_race'"
    }
  }
  if(right_grand_flg){
    right_grand_checked = " checked"
    if(right_grand_flg == "goal"){
      right_grand_goal = " target_race"
    }
  }
  return [
    "<label class='checkbox_label'><input type='checkbox' class='checkbox_button entry_race parent_checkbox" + parent_goal + "' onchange='change_entry_race_sum(datatable)' value='" + value["id"] + "' name='" + value["date"] + "-parent'" + parent_checked + "></input><span class='dummry_checkbox_inputer'></span><span class='checkbox_text'></span></label>",
    "<label class='checkbox_label'><input type='checkbox' class='checkbox_button entry_race grandmother-left_checkbox" + left_grand_goal + "' onchange='change_entry_race_sum(datatable)' value='" + value["id"] + "' name='" + value["date"] + "-left_grand'" + left_grand_checked + "></input><span class='dummry_checkbox_inputer'></span><span class='checkbox_text'></span></label>",
    "<label class='checkbox_label'><input type='checkbox' class='checkbox_button entry_race grandmother-right_checkbox" + right_grand_goal + "' onchange='change_entry_race_sum(datatable)' value='" + value["id"] + "' name='" + value["date"] + "-right_grand'" + right_grand_checked + "></input><span class='dummry_checkbox_inputer'></span><span class='checkbox_text'></span></label>",
    value["name"],
    "<span class='hidden'>" + ("000" + value["id"]).slice( -3 ) + "</span>" + value["date"],
    "<span class='hidden'>" + value["grade_id"] + "</span>" + value["grade"],
    value["baba"],
    value["distance"]
  ];
}

function show_umamusu_status(){
  parent_element = $(".parent select");
  left_grandmother_element = $(".grandmother-left select");
  right_grandmother_element = $(".grandmother-right select");
  $(".umamusu_data tbody").empty()
  if(parent_element.val() != null && parent_element.val() != 0){
    data = umamusu_status_hash[parent_element.val()]
    $(".umamusu_data tbody").append(make_status_tr(data))
  }
  if(left_grandmother_element.val() != null && left_grandmother_element.val() != 0){
    data = umamusu_status_hash[left_grandmother_element.val()]
    $(".umamusu_data tbody").append(make_status_tr(data))
  }
  if(right_grandmother_element.val() != null && right_grandmother_element.val() != 0){
    data = umamusu_status_hash[right_grandmother_element.val()]
    $(".umamusu_data tbody").append(make_status_tr(data))
  }
}
function make_status_tr(data){
  return "<tr>" + 
  "<td class='aptitude'>" + data["name"] + "</td>" +
  "<td class='aptitude aptitude-" + data["baba_aptitude"]["turf"].toLowerCase() + "'>" + data["baba_aptitude"]["turf"] + "</td>" +
  "<td class='aptitude aptitude-" + data["baba_aptitude"]["dirt"].toLowerCase() + "'>" + data["baba_aptitude"]["dirt"] + "</td>" +
  "<td class='aptitude aptitude-" + data["distance_aptitude"]["short"].toLowerCase() + "'>" + data["distance_aptitude"]["short"] + "</td>" +
  "<td class='aptitude aptitude-" + data["distance_aptitude"]["mile"].toLowerCase() + "'>" + data["distance_aptitude"]["mile"] + "</td>" +
  "<td class='aptitude aptitude-" + data["distance_aptitude"]["middle"].toLowerCase() + "'>" + data["distance_aptitude"]["middle"] + "</td>" +
  "<td class='aptitude aptitude-" + data["distance_aptitude"]["long"].toLowerCase() + "'>" + data["distance_aptitude"]["long"] + "</td>" +
  "</tr>"
}

function change_schedule_umamusu(element, target){
  id = element.val()
  name = element.find("option:selected").text()
  $(target).html(name)
}

function make_schedule_table(){
  tbody = $(".schedule_table tbody")
  $.each(window.school_year, function(index_school, value){
    for(index_month = 1; index_month <= 12; index_month++){
      $.each(window.half, function(index, value){
        tbody.append("<tr>" +
          "<td>" + (index_school + index_month + index) + "</td>" +
          "<td></td>" +
          "<td></td>" +
          "</tr>")
      });
    }
  });
}