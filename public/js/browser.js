//Find out what the browser is
if (navigator.userAgent.search("Firefox") > -1){
  document.getElementsByTagName("html")[0].setAttribute("useragent","Firefox");
} else if (navigator.userAgent.search("rv") > -1 || navigator.userAgent.search("MSIE") > -1){
  document.getElementsByTagName("html")[0].setAttribute("useragent","IE");
} else if (navigator.userAgent.search("AppleWebKit") > -1 && navigator.userAgent.search("Chrome") > -1 && navigator.userAgent.search("Edge") == -1){
  document.getElementsByTagName("html")[0].setAttribute("useragent","Chrome");
} else if ((navigator.userAgent.search("AppleWebKit") > -1 || navigator.userAgent.search("Chrome") == -1) && navigator.userAgent.search("Edge") == -1){
  document.getElementsByTagName("html")[0].setAttribute("useragent","Safari");
} else if (navigator.userAgent.search("Edge") > -1){
  document.getElementsByTagName("html")[0].setAttribute("useragent","Edge");
}
