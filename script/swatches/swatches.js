var swatch=(function($) {
  var swatch = {
    colors:["#DDE1E5", "#E8EBED", "#EFF1F3", "#F8F9F9", "#FCFCFC", "#E7E6DB", "#EEEEE6", "#F4F3EE", "#FAFAF7",
      "#FDFCFC", "#484848", "#6D6D6D", "#9C9C9C", "#E7E7E7", "#F9F9F9", "#36312D", "#514A44", "#6C635B",
      "#CCC9C7", "#F0EFEE", "#625B4F", "#948977", "#C6B8A0", "#EBE6DE", "#F9F8F5", "#3C4D62", "#597493",
      "#789BC5", "#D0DCEB", "#F1F5F9", "#415353", "#627C7D", "#83A6A7", "#D4E0E0", "#F2F5F6", "#575F39",
      "#838F56", "#B0BF74", "#E4E9CF", "#F7F8F1", "#6E5B31", "#A58949", "#DDB762", "#F3E6CA", "#FBF7EE",
      "#69442E", "#9E6746", "#D48A5E", "#F0D7C8", "#FAF3EF", "#86504C", "#D09893", "#E6BFBC", "#F6E9E8",
      "#FCF8F8", "#613936", "#925652", "#C4736E", "#EACFCD", "#F9F1F0", "#4E4455", "#75667F", "#9D89AA",
      "#DDD7E2", "#F5F3F6"],

    Init: function () {
      var html = ""
      swatch.colors.forEach(color => {
        html += "<div class=\"color\" style='background-color:" + color + "'  data-bgcolor='" + color + "'></div>";
      });

      html+='<div class="div-color-picker"><input type="color" id="bgColorPicker" value="#ffffff" name="head"></div>';

      $(".swatchesContainer").html(html);
    },

    OnColorClick:function () {
      $(".swatchesContainer .color").on("click",function () {
        $("#bgColorPicker").val($(this).attr("data-bgcolor")).trigger("input");
      });
    }

  }

  return swatch;

  }($));