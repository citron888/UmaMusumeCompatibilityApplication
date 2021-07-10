$(function(){
  // ウィンドウを開く
  $('.modal-open').on('click', function() {
      var target = $(this).data('target');
      var modal = document.getElementById(target);
      $(modal).fadeIn(300);
      return false;
  });

  // ウィンドウを閉じる
  $('.modal-close').on('click', function() {
  $( '#modal-wrapper').fadeOut( 300 );
  return false;
  });
  $('.modal-wrapper-backgraund').on('click', function() {
    $( '#modal-wrapper').fadeOut( 300 );
    return false;
  });
});