<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
</head>
<body>
	<!-- 引入 jQuery 库 -->
	<script src="static/js/jquery.min.js"></script>
	<script src="static/js/jquery.cookie.min.js"></script>
	<script>
		//页面判断是微信或者支付报浏览器？
		var wx_appid;
		var ali_appid;
		var ivIp;
		function getConfig(){
			$.ajax({
				type: 'post',
				url: 'company/config.do',
				dataType: 'json',
				data:{
					vmid:query_vmid('vmid')
				},
				success: function(data){
					if(data.err == "0"){
						wx_appid = data.wx_appid;
						ali_appid = data.ali_appid;
						ivIp = data.ivIp;
						if(isWeiXin()){
							var appid=wx_appid;
							var redirect_uri=ivIp+"/index.html";
							var uri=encodeURI(redirect_uri);
						    var url="https://open.weixin.qq.com/connect/oauth2/authorize?redirect_uri="+uri+"&appid="+appid+"&response_type=code&scope=snsapi_base&state=1#wechat_redirect";
						  	window.location.href=url;
						}

						if(isAli()){
							var appid=ali_appid;
							var aliurl=ivIp+"/index.html";
							var uri=encodeURI(aliurl)
							var url="https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?redirect_uri="+uri+"&app_id="+appid+"&scope=auth_base&state=wanzhong";
							window.location.href=url;
						}
					}
				}
			});
		}
		var userAgent = navigator.userAgent.toLowerCase();
		function query_vmid(name){
	       var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)","i");
	       var r = window.location.search.substr(1).match(reg);
	       if(r!=null)return unescape(r[2]);
	       return null;
	    }
	    function isWeiXin(){
	       if(userAgent.match(/MicroMessenger/i) == 'micromessenger'){
	           return true;
	       }else{
	           return false;
	       }
	    }
	    function isAli(){
	      if(userAgent.match(/Alipay/i) == "alipay"){
	        return true;
	      }else{
	        return false;
	      }
	    }
	    $.cookie("vmid",query_vmid('vmid'),{ expires: 1, path: '/' });
	    function AliorWei(){
	    	if(isWeiXin()||isAli()){
				// return true;
				console.log("haode");
			}else{
				$('body').empty();
				$('body').append("<h2>请用微信或者支付宝扫码！</h2>");
			}
	    }
	    getConfig();
	</script>
</body>
</html>
