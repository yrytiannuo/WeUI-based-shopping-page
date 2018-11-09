$(function(){
  //判断浏览器是否为微信
  var userAgent = navigator.userAgent.toLowerCase();
  function isWeiXin(){
    if(userAgent.match(/MicroMessenger/i) == 'micromessenger'){
        return true;
    }else{
        return false;
    }
  }
  //判断浏览器是否微支付宝
  function isAli(){
    if(userAgent.match(/Alipay/i) == "alipay"){
      return true;
    }else{
      return false;
    }
  }


  //购买者对象
	function CreatePayer(){
		var payer = {
			oraigin_money: 0,
      discount_money: 0,
      bigred_money: 0,
      vip_lv: '',
      vip_discount: 1,
      redball: '',
      openid: '',
      coupon_id: 'null',
			init: function(opendid,vip_lv,vip_discount,redball){
        this.openid = opendid;
        this.redball = redball;
				this.vip_lv = vip_lv;
				this.vip_discount = vip_discount;
			},
      bigred: function(){
        var big = 0;
        for(var i in this.redball){
          if(this.redball[i].state == 0 && this.redball[i].amount>big){
              big = this.redball[i].amount;
              this.coupon_id = this.redball[i].coupon_id;
          }
        }
        this.bigred_money = big;
      }
		}
		return payer;
	};

  //购物车对象
  function CreateCart(){
    var cart = {
      vm_id: $.cookie('vmid'),
      data: {
        goodsids: [],
        goodsnames: [],
        goodsprices: [],
        goodspassagenos: []
      },
      deleteCart: function(name,index){
        var temp_goodid = goodArrObj[index][name].goods_no;
        var goodid_index =  this.data.goodsids.indexOf(temp_goodid);
        var temp_no = this.data.goodspassagenos[goodid_index];
        if(goodid_index > -1){
          this.data.goodsids.splice(goodid_index,1);
          this.data.goodsnames.splice(goodid_index,1);
          this.data.goodsprices.splice(goodid_index,1);
          this.data.goodspassagenos.splice(goodid_index,1);
        }
        if(goodArrObj[index][name].can_discount == 1){
          currentpayer.discount_money -= Number(goodArrObj[index][name].price)*currentpayer.vip_discount;
          currentpayer.oraigin_money -= Number(goodArrObj[index][name].price);
        }else{
          currentpayer.discount_money -= Number(goodArrObj[index][name].price);
          currentpayer.oraigin_money -= Number(goodArrObj[index][name].price);
        }
        goodArrObj[index][name].passage_no.push(temp_no);
        for(var i=0;i<$('.cart_shopName').length;i++){
          if($('.cart_shopName')[i].innerText == name&&$('.cart_num span')[i].innerText>1){
            $("aside .cart_num span")[i].innerText = Number($("aside .cart_num span")[i].innerText)-1;
          }else if($('.cart_shopName')[i].innerText == name && $('.cart_num span')[i].innerText==1){
            $('.cart_num').eq(i).parents('.weui-cell').remove();
          }
        }
        if(this.data.goodsids.length == 0){
          $(".pay").css("opacity","0");
        }else{
          showCartDetail();
        }
      },
      addCart: function(name,index,flag){
        $(".pay").css("opacity","1");
        this.data.goodsids.push(goodArrObj[index][name].goods_no);
        this.data.goodsnames.push(name);
        this.data.goodsprices.push(goodArrObj[index][name].price);
        this.data.goodspassagenos.push(goodArrObj[index][name].passage_no.pop());
        if(goodArrObj[index][name].can_discount == 1){
          currentpayer.discount_money += Number(goodArrObj[index][name].price)*Number(currentpayer.vip_discount);
          currentpayer.oraigin_money += Number(goodArrObj[index][name].price);
        }else{
          currentpayer.discount_money += Number(goodArrObj[index][name].price);
          currentpayer.oraigin_money += Number(goodArrObj[index][name].price);
        }
        if(flag == 1){
          var $ele = $("<div class='weui-cell'><div class='weui-cell__bd'>"+
            "<img src='"+imgurl+goodArrObj[index][name].pic+"'></div><span class='cart_shopName'>"+
            ""+name+"</span><span class='cart_price'>￥<span>"+goodArrObj[index][name].price+"</span></span><span class='cart_num'>"+
            "+<span>1</span></span></div>");
          $('aside .weui-cells').append($ele);
        }else{
          for(var i=0;i<$('.cart_shopName').length;i++){
            if($('.cart_shopName')[i].innerText == name){
              $("aside .cart_num span")[i].innerText = Number($("aside .cart_num span")[i].innerText)+1;
            }
          }
        }
        showCartDetail();
      }
    }
    return cart;
  }
  function showCartDetail(){
    currentpayer.bigred();
    $('.originalprice span').text(currentpayer.oraigin_money.toFixed(2));
    $('.discountprice span').text((currentpayer.discount_money.toFixed(2)-currentpayer.bigred_money.toFixed(2)).toFixed(2));
    $('.ship').text(currentpayer.vip_lv);
    $('.membershipprice').text((currentpayer.oraigin_money.toFixed(2)-currentpayer.discount_money.toFixed(2)).toFixed(2));
    $('.redenvelopesprice').text(currentpayer.bigred_money.toFixed(2));
  }
  //根据不同浏览器获取不同的用户信息（红包，vip等级）
  function browser(){
    var vm_id = $.cookie('vmid');//"9000000002"
    if(isWeiXin()){
      var code= getUrlParam("code");
      $.ajax({
          type:"post",
          url:"wx/getCode.do",
          dataType:"json",
          data:{"code":code,"vmid":vm_id},
          success:function(data){
            if(data.err=="0"){
              currentpayer.init(data.openid,data.vip_lv,data.discount,data.coupon);
            }else{
              $.toptip('操作失败', 'error');
            }
          },
          error:function(){
            $.toptip('操作失败', 'error');
          }
      });
    }
    if(isAli()){
      var auth_code= getUrlParam("auth_code");
      $.ajax({
        type:"post",
        url:"ali/getUserId.do",
        dataType:"json",
        data:{"auth_code":auth_code},
        success:function(data){
          if(data.err=="0"){
            currentpayer.init(data.userId,data.vip_lv,data.discount,data.coupon);
          }else{
            $.toptip('操作失败', 'error');
          }
        },
        error:function(){
          $.toptip('操作失败', 'error');
        }
      });
    }
  }

  //获取参数
  function getUrlParam(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)","i");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return unescape(r[2]);
    return null;
  }

  //商品列表初始化
  function goodinit(){
    $.ajax({
      type: "POST",
      dataType:"json",
      async: false,
      url: "passage/shopquery.do",//http://tazrq.xunshengkeji.com/one/
      data:{
        vmid : $.cookie('vmid') || "2511551188"
      },
      success:function (data) {
        console.log(data);
        imgurl = data.ip;
        obj = data;
        if(data.arr.length>0){
          var goodsdetail = add_goodtype(data);//初始化商品类别
          //根据次序参数加载不同得数据
          add_goodlist(goodsdetail);//初始化商品列表
        }else{
          $('body').html("<h1 style='text-align:center;'>此机器目前不能正常工作！</h1>")
        }
      },
      error:function(XMLHttpRequest, textStatus, errorThrown){
        console.log("err");
      }
    });
  }
  var goodArrObj = new Array();
  function add_goodtype(data){
    var goodstypeArr = [];//商品种类
    for(var i in data.arr){
      var item1 = data.arr[i].goods_type;
      if($.inArray(item1,goodstypeArr)==-1){
        goodstypeArr.push(item1);
      }
    }

    $(".nav .weui-navbar").empty();
    for(var i=0;i<goodstypeArr.length;i++){
      if(i==0){
        var $ele = $("<a class='weui-navbar__item weui-bar__item--on' href='#tab"+ (i+1) +"'>"+ goodstypeArr[i] +"</a>");
      }else{
        var $ele = $("<a class='weui-navbar__item' href='#tab"+ (i+1) +"'>"+ goodstypeArr[i] +"</a>");
      }
      $(".nav .weui-navbar").append($ele);
    }

    for(var i in goodstypeArr){
      goodArrObj[i] = new Array;
      for(var j in data.arr){
        var objInit = {
          goods_no: '',
          passage_no: [],
          can_discount: '',
          pic: '',
          price: '',
          surplus: 0
        };
        if(goodstypeArr[i] == data.arr[j].goods_type){
          goodArrObj[i][data.arr[j].name] = objInit;
        }
      }
    }

    for(var i in goodstypeArr){
      for(var j in data.arr){
        var obj ={
            goods_no: data.arr[j].goods_no,
            surplus: data.arr[j].surplus,
            passage_no: data.arr[j].passage_no,
            can_discount: data.arr[j].can_discount,
            pic: data.arr[j].pic,
            price: data.arr[j].price
        };
        if(goodstypeArr[i] == data.arr[j].goods_type){
          goodArrObj[i][data.arr[j].name]["surplus"] += obj.surplus;
          goodArrObj[i][data.arr[j].name]["goods_no"] = obj.goods_no;
          goodArrObj[i][data.arr[j].name]["can_discount"] = obj.can_discount;
          goodArrObj[i][data.arr[j].name]["pic"] = "/pic/"+obj.pic;
          goodArrObj[i][data.arr[j].name]["price"] = obj.price;
          for(var k=0;k<obj.surplus;k++){
            goodArrObj[i][data.arr[j].name]["passage_no"].push(obj.passage_no);
          }
        }
      }
    }
    return goodArrObj;
  }
  function add_goodlist(data){//初始化商品列表
    for(var i=0;i<data.length;i++){
      $("#tab"+(i+1)).empty();
      for(var j in data[i]){
        var $ele = $("<div class='weui-cells'><div class='weui-cell'>"+
                "<div class='weui-cell__bd'><img src='"+imgurl+data[i][j]['pic']+"'>"+
                "</div><div class='weui-cell__ft'><h3 class='goodname'>"+j+"</h3><p>"+((data[i][j]['can_discount']==1)?'此商品参与打折':'此商品不参与打折')+"</p>"+
                "<p class='surplus'>余量<span>"+data[i][j]['surplus']+"</span></p><p class='price'>￥"+data[i][j]['price']+"</p>"+
                "</div><div class='weui-cell__ri'><span class='minus'><img src='static/images/minus.png'>"+
                "</span><span class='num'>0</span><span class='plus'><img src='static/images/plus.png'>"+
                "</span></div></div></div>");
        $("#tab"+(i+1)).append($ele);
      }
    }
  }

  (function(){
    goodinit();//添加商品
    currentpayer = CreatePayer();
    browser();//判断支付类型
    currentcart = CreateCart();
  })();

  $('body').on('click','.minus',function(){
    if($(this).next().text()!=0){
      var index = $(this).parents('.weui-tab').find('.weui-bar__item--on').index();
      var data_name = $(this).parents('.weui-cell').find('.goodname').text();
      currentcart.deleteCart(data_name,index);
      var num = Number($(this).next().text()) - 1;
      $(this).next().text(num);
      var sur = Number($(this).parents('.weui-cell').find('.surplus span').text()) + 1;
      $(this).parents('.weui-cell').find('.surplus span').text(sur);
      console.log(goodArrObj);
    }
  });
  $('body').on('click','.plus',function(){
    if($(this).parents('.weui-cell').find('.surplus span').text()>0){
      var index = $(this).parents('.weui-tab').find('.weui-bar__item--on').index();
      var data_name = $(this).parents('.weui-cell').find('.goodname').text();
      if($.inArray(data_name,currentcart.data.goodsnames)!=-1){
        currentcart.addCart(data_name,index,0);
      }else{
        currentcart.addCart(data_name,index,1);
      }
      var num = Number($(this).prev().text()) + 1;
      $(this).prev().text(num);
      var sur = Number($(this).parents('.weui-cell').find('.surplus span').text()) - 1;
      $(this).parents('.weui-cell').find('.surplus span').text(sur);
    }
  });


  $('.topay').on('click',function(){
    if(isWeiXin()&&currentcart.data.goodsids.length>0){
      wxPay();
    }else if(isAli()&&currentcart.data.goodsids.length>0){
      aliPay();
    }
  });
  function wxPay(){
      //var id="0000100001";
      var goodsid=currentcart.data.goodsids.join(',');
      var price=currentpayer.discount_money.toFixed(2)-currentpayer.bigred_money.toFixed(2);
      var date=new Date();
      var product_id="testwanzhong"+date.getHours()+date.getMinutes()+date.getSeconds();
      var subject;
      if(currentcart.data.goodsids.length>1){
        subject = "多个商品";
      }else{
        subject = currentcart.data.goodsnames[0];
      }
      var reqJson={
          //appid:id,
          goodsid:goodsid,
          price:price.toFixed(2),
          product_id:product_id,
          subject:subject
      };
      reqJson.openid=currentpayer.openid;
      reqJson.price=reqJson.price*100;
      reqJson.price=parseInt(reqJson.price);
      if(true){
        $.ajax({url:"wx/pay.do",
          data:reqJson,
          dataType:"json",
          success:function(data){
            var json=data;
            var appid=json.appId;
            var prepayid=json.package;
            var timeStamp=json.timeStamp;
            var sign=json.sign;
            var nonceStr=json.nonceStr;
            $.ajax({
                type: "POST",
                dataType:"json",
                url: "pay/success.do",
                data:{
                  vmid: currentcart.vm_id,
                  buyer_id: currentpayer.openid,
                  order_no: prepayid.split('=')[1],
                  goods_nos: currentcart.data.goodsids.join(','),
                  goods_names: currentcart.data.goodsnames.join(','),
                  prices: currentcart.data.goodsprices.join(','),
                  method: "微信",
                  out_trade_no: product_id,
                  discount: currentpayer.vip_discount,
                  passage_nos: currentcart.data.goodspassagenos.join(','),
                  coupon_id: currentpayer.coupon_id
                },
                success:function(){
                },
                error:function(){
                }
              });
            if (typeof WeixinJSBridge == "undefined"){
              if( document.addEventListener ){
                      document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                  }else if (document.attachEvent){
                      document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                      document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                  }
              }else{
                  onBridgeReady();
              }
              function onBridgeReady(){
                  WeixinJSBridge.invoke(
                          'getBrandWCPayRequest', {
                              "appId" : appid,     //公众号名称，由商户传入
                              "timeStamp":timeStamp,         //时间戳，自1970年以来的秒数
                              "nonceStr" : nonceStr, //随机串
                              "package" : prepayid,
                              "signType" : "MD5",         //微信签名方式:
                              "paySign" : sign //微信签名
                          },
                          function(res){
                            switch (res.err_msg) {
                              case "get_brand_wcpay_request:ok":
                                reqJson.status="支付成功,等待出货";
                                break;
                              case "get_brand_wcpay_request:cancel":
                                reqJson.status="用户取消支付";
                                break;
                              case "get_brand_wcpay_request:fail":
                                reqJson.status="支付失败";
                                break;
                              default:
                                reqJson.status="支付结果异常";
                                break;
                              }
                            if(reqJson.status == "支付成功,请等待出货"){
                              window.location.href="../../end.html";
                            }
                          }
                  );
              }
            },
            error:function(){
              alert("error");
            }
        }
        );
        }
    }

  function aliPay(){
      //调起下单接口，记得先引入jquery
      var goodsid=currentcart.goodsids.join(',');
      var price=currentpayer.discount_money-currentpayer.bigred_money;
      price = price.toFixed(2);
      var date=new Date();
      var product_id="testwanzhong"+date.getHours()+date.getMinutes()+date.getSeconds();
      var subject;
      if(currentcart.data.goodsids.length>1){
        subject = "多个商品";
      }else{
        subject = currentcart.data.goodsnames[0];
      }
      var reqJson={
          goodsid:goodsid,
          price:price,
          product_id:product_id,
          subject:subject
      };
         reqJson.userId=currentpayer.openid;
         if(true){
         $.post("ali/pay.do",reqJson,function(data){
           var json=eval("("+data+")").alipay_trade_create_response;
           var trade_no=json.trade_no;
           $.ajax({
               type: "POST",
               dataType:"json",
               url: "pay/success.do",
               data:{
                 vmid:currentcart.vm_id,
                 buyer_id: currentpayer.openid,
                 order_no: trade_no,
                 goods_nos: currentcart.data.goodsids.join(','),
                 goods_names: currentcart.data.goodsnames.join(','),
                 prices: currentcart.data.goodsprices.join(','),
                 method: "支付宝",
                 out_trade_no: product_id,
                 discount: currentpayer.vip_discount,
                 passage_nos: currentcart.data.goodspassagenos.join(','),
                 coupon_id: currentpayer.coupon_id
               },
               success:function(){
               },
               error:function(){
               }
             });
           $(document).ready(function(){
                  tradePay(trade_no);
               });
              function ready(callback) {
                   if (window.AlipayJSBridge) {
                       callback && callback();
                   } else {
                       document.addEventListener('AlipayJSBridgeReady', callback, false);
                   }
              }
              function tradePay(tradeNO) {
                reqJson.tarde_no=tradeNO;
                  ready(function(){
                       AlipayJSBridge.call("tradePay", {
                            tradeNO: tradeNO
                       }, function (data) {
                         //reqJosn.no=trade_no;
                         switch (data.resultCode) {
                            case "9000":
                              reqJson.status="支付成功";
                              break;
                            case "6004":
                              reqJson.status="后台获取支付结果超时";
                              break;
                            case "8000":
                              reqJson.status="支付时网络异常";
                              break;
                            case "7001":
                              reqJson.status="客户端钱包终止支付";
                              break;
                            case "6002":
                              reqJson.status="网络出错";
                              break;
                            case "6001":
                              reqJson.status="用户取消";
                              break;
                            case "4000":
                              alert("订单支付失败");
                              break;
                            case "99":
                              reqJson.status="用户忘记密码";
                              break;
                            default:
                              reqJson.status="其他异常";
                              break;
                          }
                        if(reqJson.status == "支付成功"){
                          window.location.href="../../end.html";
                        }
                       });
                  });
              }
           }
         );}
       }

});

