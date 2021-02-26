var ua = navigator.userAgent;
if (/MSIE/i.test(ua) || /rv:11.0/i.test(ua)) {
  var root = document.getElementById('root');
  if (root) root.innerHTML = (
    '<p>Sorry, this app does not work in Internet Explorer. Try using a more modern browser.</p>'+
    '<img src="fallback.jpg"/>'
  );
}
