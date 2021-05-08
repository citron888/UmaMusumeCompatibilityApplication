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
});

function show_race_list() {
  parent_element = $("")
  left_grandmother_element = $("")
  right_grandmother_element = $("")
  if(parent_element.val() != null){
    console.log("test")
  }
}