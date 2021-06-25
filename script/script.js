const LimitDimension = {
  HEIGHT: "H",
  WIDTH: "W"
};

const ProductSizes = [{
  Value:"11*14",  /// considering unit as inches
  Text:"11 x 14\""
},
{
  Value: "16*24",  /// considering unit as inches
  Text:"16 x 24\""
}]

var picViewer=(function(){

  var picViewer = {

    imgHeight: 0,
    imgWidth:0,
    maxResizableHeight:0,
    maxResizableWidth:0,
    DimensionForLimit: LimitDimension.HEIGHT,
    IsLivePreviewOn:false,
    isMobile : $(window).width() < 991,
    extraSlidesToAdd: 9,
    swiper:null,

    InitBindings:function(){
      picViewer.IsLivePreviewOn = false;
      picViewer.SwitchMode(picViewer.IsLivePreviewOn);
      picViewer.BindProductSizeDropDown();

      $("#btnFullScreen").on("click",function () {
        $(".container").find(".content").toggleClass("fullscreen");
        $(".slideshow-right-control").find(".range-slider").toggleClass("no-padding");
        if($(".container").find(".content").hasClass("fullscreen")){
          $(this).find("i").attr("class","fas fa-compress");
        }
        else{
          $(this).find("i").attr("class","fas fa-expand");
        }
      });

      document.addEventListener("click",function(e){
        var isSwatchContainer = $(e.target).parents(".swatchesContainer").length > 0;
        if(!isSwatchContainer){
          if ($(".swatchesContainer").css("display") == 'block') {
            $(".swatchesContainer").toggle("fade");
          }
        }
      });

      $("#btnClose").on("click",function () {
        alert("Closed");
      });

      $("#chkShowInterface").on("change",function(){
          $(".container").find(".content").toggleClass("inteface-hidden");
      });

      $("#draggable").draggable({
        containment: $(".slideshow-body")
      });

      $("#picResizer").on("input ", function (e) {
        picViewer.ResizeImage(this.value);
      });

      $("#btnPreview").on("click",function () {
        picViewer.ShowLivePrev();
      });

      $("#bgColorPicker").on("input", function (e) {
        picViewer.AddImageToCanvas('bg-images/1.png', this.value);
      });

       $("#btnSave").on("click",function () {
        picViewer.SaveButtonClick();
      });

      $("#btnPaint").on("click", function (e) {
        $(".swatchesContainer").toggle("fade");
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
      });

      $("#btnBackgrounds").on("click",function(){
        picViewer.IsLivePreviewOn = false;
        picViewer.SwitchMode(picViewer.IsLivePreviewOn);
      });

      $("#ddl-product-sizes").on("change",function(){
        picViewer.ProductSizeSelected(this.value);
      });

      picViewer.ProductSizeSelected($("#ddl-product-sizes option:selected").val())

      var imageLoader = document.getElementById('selectedFilePreview');
      imageLoader.addEventListener('change', picViewer.HandleImage, false);

      if(this.isMobile){
        var draggableImg=document.getElementById("draggable")
        draggableImg.addEventListener("touchstart", this.TouchHandler, true);
        draggableImg.addEventListener("touchmove", this.TouchHandler, true);
        draggableImg.addEventListener("touchend", this.TouchHandler, true);
        draggableImg.addEventListener("touchcancel", this.TouchHandler, true);
        picViewer.SetTopMargin();
        picViewer.extraSlidesToAdd = 0;
      }
    },

    AddExtraSlidesIfNeeded:function(){
        var html = '';
        var slides = $(".gallery.swiper-wrapper").html();
        for (let index = 0; index < picViewer.extraSlidesToAdd; index++) {
          html += '<div class="swiper-slide"></div>';
        }
        $(".gallery.swiper-wrapper").html(html + slides + html);
    },
    /**
     * Always called after all bindings and adding images
     */
    InitCalculation:function(){
      picViewer.maxResizableHeight = $(".slideshow-body").height();
      picViewer.maxResizableWidth = $(".slideshow-body").width();
      picViewer.imgHeight = $("#draggable img").height();
      picViewer.imgWidth = $("#draggable img").width();
      picViewer.DimensionForLimit = this.imgHeight > this.imgWidth ? LimitDimension.HEIGHT : LimitDimension.WIDTH;         
      this.SetCanvasHeight();
    },

    SetCanvasHeight:function(){
      var canvas = document.getElementById("imageCanvas");
      canvas.width = picViewer.maxResizableWidth;
      canvas.height = picViewer.maxResizableHeight;
    },

    HandleImage:function(e){
      var reader = new FileReader();
      reader.onload = function (event) {
        var img = new Image();
        img.onload = function () {
          var canvas = document.getElementById("imageCanvas");
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img,0,0);
        }
        img.src = event.target.result;
      }
      reader.readAsDataURL(e.target.files[0]);     
    },

    SetZoomValue:function(){
      var percent = picViewer.GetPercentFromValue(picViewer.imgHeight, picViewer.maxResizableHeight);
      if (picViewer.DimensionForLimit == LimitDimension.WIDTH) {
        percent = picViewer.GetPercentFromValue(picViewer.imgWidth, picViewer.maxResizableWidth);
      }
      $("input#picResizer").val(100 - percent);
    },

    SaveButtonClick:function(){
      var x = document.getElementById('draggable').offsetLeft - 70;
      var y = document.getElementById('draggable').offsetTop - 70;
      picViewer.imgHeight = $("#draggable img").height();
      picViewer.imgWidth = $("#draggable img").width();
      var canvas = document.getElementById("imageCanvas");
      var newCanvas = picViewer.GenerateCanvasCopy(canvas);
      var draggableImg=document.getElementById('imgDraggable');
      var ctx = newCanvas.getContext("2d");
      if(picViewer.IsLivePreviewOn){
        var video = $("#livePrevVideo")[0];
        var scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
        // get the top left position of the image
        var x1 = (canvas.width / 2) - (video.videoWidth / 2) * scale;
        var y1 = (canvas.height / 2) - (video.videoHeight / 2) * scale;
        ctx.drawImage(video, x1, y1, video.videoWidth * scale, video.videoHeight * scale);        
      }
      ctx.drawImage(draggableImg, x, y, picViewer.imgWidth, picViewer.imgHeight);
      var url = newCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      ctx.clearRect(0, 0, newCanvas.width, newCanvas.height);
      var link = document.createElement('a');
      link.download = "my-image.png";
      link.href = url;
      link.click();
    },

    SetTopMargin:function(){
      var availableHeight = Math.ceil($(window).height());
      var usedHeight = Math.ceil($(".slideshow-body").height());
      var marginTop = Math.ceil((availableHeight - usedHeight) / 2);
      $(".container").css("margin-top", (marginTop) + 'px');
    },

    TouchHandler: function (event) {
      var touch = event.changedTouches[0];

      var simulatedEvent = document.createEvent("MouseEvent");
      simulatedEvent.initMouseEvent({
        touchstart: "mousedown",
        touchmove: "mousemove",
        touchend: "mouseup"
      }[event.type], true, true, window, 1,
        touch.screenX, touch.screenY,
        touch.clientX, touch.clientY, false,
        false, false, false, 0, null);

      touch.target.dispatchEvent(simulatedEvent);
      if (event.cancelable) {
        event.preventDefault();
        event.stopPropagation();
      }
    },

    GenerateCanvasCopy:function(oldCanvas){

        //create a new canvas
        var newCanvas = document.createElement('canvas');
        var context = newCanvas.getContext('2d');
    
        //set dimensions
        newCanvas.width = oldCanvas.width;
        newCanvas.height = oldCanvas.height;
    
        //apply the old canvas to the new one
        context.drawImage(oldCanvas, 0, 0);
    
        //return the new canvas
        return newCanvas;
    },

    ResizeImage:function(value){
      var val = (100 - value);
      if (this.imgHeight <= picViewer.maxResizableHeight && this.imgWidth <= this.maxResizableWidth)
      {
        // var calculatedHeight = picViewer.GetValueFromPercent(val, picViewer.maxResizableHeight);
        var calculatedWidth = picViewer.GetValueFromPercent(val, picViewer.maxResizableWidth);
        var elemOffset = $("#draggable").offset();
        var elemHeight=$("#draggable").height();
        var elemWidth=$("#draggable").width();
        var parentOffset=$(".slideshow-body").offset();
        var parentHeight=$(".slideshow-body").height();
        var parentWidth=$(".slideshow-body").width();
        
        var touchesTop = elemOffset.top <= parentOffset.top;
        var touchesLeft = elemOffset.left <= parentOffset.left;
        var touchesBottom = (parentOffset.top+parentHeight)<=(elemOffset.top+elemHeight);
        var touchesRight = (parentOffset.left+parentWidth)<=(elemOffset.left+elemWidth);
        var isIncreasing = elemWidth < calculatedWidth;
        
        if(isIncreasing && (touchesTop || touchesBottom || touchesLeft || touchesRight)){
          return;
        }
        $("#draggable").css("width", calculatedWidth + "px");
      }
    },

    AddImageToCanvas:function(image,fillColor=''){
      var canvas = document.getElementById("imageCanvas");
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      var img = document.createElement('img');
      img.src = image;
      context.imageSmoothingEnabled = true;
      picViewer.FitToCover(context, img, fillColor);
    },

    ShowLivePrev:function () {
      picViewer.IsLivePreviewOn = true;
      picViewer.SwitchMode(picViewer.IsLivePreviewOn);
      navigator.getUserMedia({ audio: false,video: true },
        function(stream) {
          // var canvas = document.getElementById("imageCanvas");
          // const ctx = canvas.getContext('2d');

          var video = document.querySelector('video');
          var i;
          video.srcObject = stream;
          video.onloadedmetadata = function (e) {
            video.play();
          };
        },
        function(err) {
           console.log("The following error occurred: " + err.name);
        }
     );
    },

    FitToCover:function(ctx, img,fillColorBG){
      var type = 'cover';
      var parent = $(".slideshow-body")[0];
      const imageRatio = img.height / img.width
      const winRatio = parent.clientHeight / parent.clientWidth
      var imgRatio = 1;
      if (isNaN(imageRatio)) {
        imgRatio = ctx.canvas.height / ctx.canvas.width;
      }
      else {
        imgRatio = imageRatio;
      }
      
      if ((imgRatio > winRatio && type === 'cover')) {
        const h = parent.clientWidth * imgRatio;
        picViewer.maxResizableHeight = (imgRatio * parent.clientWidth);
        picViewer.maxResizableWidth = parent.clientWidth;
        this.SetCanvasHeight();
        if (fillColorBG) {
          ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
          ctx.fillStyle = fillColorBG;
          ctx.fill();
        }
        ctx.drawImage(img, 0, 0, parent.clientWidth, h)
      }
      if ((imgRatio < winRatio && type === 'cover')) {
        const w = parent.clientWidth * winRatio / imgRatio
        var widthToSupply = this.isMobile ? parent.clientWidth : (w - 70)
        var heightToSupply = this.isMobile ? parent.clientHeight : (parent.clientHeight - 70)
        if (fillColorBG) {
          ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
          ctx.fillStyle = fillColorBG;
          ctx.fill();
        }
        ctx.drawImage(img, (parent.clientWidth - w) / 2, 0, widthToSupply, heightToSupply)
      }
    },

    InitSlick:function(){

      picViewer.AddExtraSlidesIfNeeded();//mobile screens hanlded inside the function

      picViewer.swiper = new Swiper('.swiper-container', {
        slidesPerView: 20,
        spaceBetween: 0,
        updateOnWindowResize: true,
        freeMode: false,
        breakpoints: {
          // when window width is >= 320px
          320: {
            slidesPerView: 4,
            spaceBetween: 0
          },
          // when window width is >= 480px
          480: {
            slidesPerView: 5,
            spaceBetween: 0
          },
          // when window width is >= 640px
          640: {
            slidesPerView: 8,
            spaceBetween: 0
          },
          991: {
            slidesPerView: 10,
            spaceBetween: 5
          },
          1024:{
            slidesPerView:20,
            spaceBetween:0
          }
        }
      });

      picViewer.swiper.slideTo(0, 10, function(){});

      picViewer.swiper.on('click', function (s) {
        var selectedImageSrc = $(s.target).attr("src");
        var index = $(s.target).parent().index();
        picViewer.SelectSlide(selectedImageSrc, index);
      });

      picViewer.swiper.on('touchEnd',function(s){
        picViewer.SlickDraggHandler();
      });
    },

    SlickDraggHandler:function(){
      var goal = ($(".slideshow-body").width()/2) + $(".slideshow-body").offset()["left"];
      var obj= $(".swiper-wrapper div img").map(function (x) { return { left: $(this).parent().offset()["left"], elem: $(this).parent()[0] } }).toArray();
      var arr = $(".swiper-wrapper div img").map(function (x) { return $(this).parent().offset()["left"]; }).toArray();
      console.log(obj,arr);
      var closest = arr.reduce(function(prev, curr) {
          return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
      });
      var result = obj.find(function (x) { return x.left == closest });
      var imgSrc = $(result['elem']).find('img').attr('src');
      var index = $(result['elem']).index();
      picViewer.SelectSlide(imgSrc, index);
    },

    SelectSlide: function (imgSrc, index) {
      if (index) {

      }
      else {
        index = picViewer.extraSlidesToAdd;
      }

      var width = $('.swiper-slide').width();
      if (imgSrc != undefined && imgSrc != null && imgSrc != '') {
        picViewer.AddImageToCanvas(imgSrc);
        picViewer.swiper.translateTo(-width * (index - picViewer.extraSlidesToAdd), 500, false, false);
      }
    },

    GetValueFromPercent:function(percent,total){
      return (percent / 100) * total;
    },

    GetPercentFromValue:function(value,total){
      return (value / total) * 100;
    },

    AddDraggableImage: function (imgSrc) {
      $("#draggable img").attr("src", imgSrc);
    },

    SwitchMode:function(isLivePreview){
      if(isLivePreview){
        $("#btnBackgrounds").css("display", "");
        $("#btnUpload").css("display", "none");
        $("#btnPaint").css("display", "none");
        $("#btnPreview").css("display", "none");
        $("#imageCanvas").css("display", "none");
        $("#imgCanvas").css("display", "none");
        $("#livePrevVideo").css("display", "unset");
        $(".slideshow-thumbnails").css("display", "none")
      }
      else {
        $(".slideshow-thumbnails").css("display","")
        $("#btnBackgrounds").css("display", "none");
        $("#btnUpload").css("display", "");
        $("#btnPreview").css("display", "");
        $("#btnPaint").css("display", "");
        $("#imageCanvas").css("display", "");
        $("#imgCanvas").css("display", "");
        $("#livePrevVideo").css("display","none");
        var video = document.querySelector('video');
        video.pause();
      }
    },

    BindProductSizeDropDown:function(){
      $("#ddl-product-sizes").html("");
      for (let index = 0; index < ProductSizes.length; index++) {
        var optionHtml=`<option value='${ProductSizes[index].Value}'> ${ProductSizes[index].Text} </option>`;
        $("#ddl-product-sizes").append(optionHtml);
      }
    },

    ProductSizeSelected:function(value){
      var wallHeight=120;//feet
      var heighInPixels = $(".slideshow-body").height();
      var pixPerInc = heighInPixels / wallHeight;
      var height = value.split('*')[0];
      var width = value.split('*')[1];
      var heightInPixels = height * pixPerInc;
      var widthInPixels = width * pixPerInc;
      $("#draggable").css({
        "height": heightInPixels + 'px',
        "widht": widthInPixels + 'px'
      });
    }
  }


  return picViewer;
})();