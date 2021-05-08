$(function(){
  umamusu_array =
    $.map(window.umamusu, function(value, index){
      return { id: value["id"], text: value["name"] }
    });
  $(".select2").select2({
    language: "ja",
    data: umamusu_array
  });
});