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
			money: 0,
			sum: 0,
      vip_lv: null,
      vip_discount: null,
			init: function(vip_lv,vip_discount){
				this.vip_lv = vip_lv;
				this.vip_discount = vip_discount;
			}
		}
		return payer;
	};


  //根据不同浏览器获取不同的用户信息（红包，vip等级）
  function browser(){
    var vm_id = "3214317625"//$.cookie('vmid');
    if(isWeiXin()){
      var code= getUrlParam("code");
      $.ajax({
          type:"post",
          url:"wx/getCode.do",
          dataType:"json",
          data:{"code":code,"vmid":vm_id},
          success:function(data){
            if(data.err=="0"){
              // openid=data.openid;
              // vip_lv=data.vip_lv;
              // vip_dicount=data.discount;
              currentpayer.init(data.openid,data.vip_lv,data.discount);
            }else{
            }
          },
          error:function(){
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
            // userId=data.userId;
            // vip_lv=data.vip_lv;
            // vip_dicount=data.discount;
            currentpayer.init(data.userId,data.vip_lv,data.discount);
          }else{
            alert(data.err)
          }
        },
        error:function(){
          alert("error")
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
      url: "http://tazrq.xunshengkeji.com/one/"+"passage/shopquery.do",
      data:{
        vmid : "3214317625"//$.cookie('vmid')
      },
      success:function (data) {
        console.log(data);
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
          passage_no: '',
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
            passage_no: data.arr[j].passage_no,
            surplus: data.arr[j].surplus,
            can_discount: data.arr[j].can_discount,
            pic: data.arr[j].pic,
            price: data.arr[j].price
        };
        if(goodstypeArr[i] == data.arr[j].goods_type){
          goodArrObj[i][data.arr[j].name]["surplus"] += obj.surplus;
          goodArrObj[i][data.arr[j].name]["goods_no"] = obj.goods_no;
          goodArrObj[i][data.arr[j].name]["can_discount"] = obj.can_discount;
          goodArrObj[i][data.arr[j].name]["pic"] = obj.pic;
          goodArrObj[i][data.arr[j].name]["price"] = obj.price;
          goodArrObj[i][data.arr[j].name]["passage_no"] += (obj.goods_no+",");
        }
      }
    }
    return goodArrObj;
  }
  function add_goodlist(data){//初始化商品列表
    console.log(data);
    var img_url = "http://tazrq.xunshengkeji.com/pic/";//图片图片
    for(var i=0;i<data.length;i++){
      $("#tab"+(i+1)).empty();
      for(var j in data[i]){
        console.log(data[i][j]['surplus']);
        var $ele = $("<div class='weui-cells'><div class='weui-cell'>"+
                "<div class='weui-cell__bd'><img src='"+img_url+data[i][j]['pic']+"'>"+
                "</div><div class='weui-cell__ft'><h3>"+j+"</h3><p>"+((data[i][j]['can_discount']==1)?'此商品参与打折':'此商品不参与打折')+"</p>"+
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
  })();

  $('body').on('click','.minus',function(){
    deleteCart();
  });
  $('body').on('click','.plus',function(){
    addCart();
  });


















});