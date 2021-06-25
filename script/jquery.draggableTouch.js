/**
 * jQuery Draggable Touch v0.5
 * Jonatan Heyman | http://heyman.info 
 *
 * Make HTML elements draggable by using uses touch events.
 * The plugin also has a fallback that uses mouse events, 
 * in case the device doesn't support touch events.
 * 
 * Licenced under THE BEER-WARE LICENSE (Revision 42):
 * Jonatan Heyman (http://heyman.info) wrote this file. As long as you retain this 
 * notice you can do whatever you want with this stuff. If we meet some day, and 
 * you think this stuff is worth it, you can buy me a beer in return.
 */
;(function($){
    $.fn.draggableTouch = function (options) {

        var containmentElem = options['containment'];

        // check if the device has touch support, and if not, fallback to use mouse
        // draggableMouse which uses mouse events
        if (!("ontouchstart" in document.documentElement)) {
            return this.draggableMouse(options);
        }
        
        // check if we shall make it not draggable
        if (options?? options['action'] == "disable") {
            this.unbind("touchstart");
            this.unbind("touchmove");
            this.unbind("touchend");
            this.unbind("touchcancel");
            return this;
        }
        
        this.each(function() {
            var element = $(this);
            var offset = null;
            var containment=$(options["containment"]);
            var end = function(e) {
                e.preventDefault();
                var orig = e.originalEvent;
                
                element.trigger("dragend", {
                    top: orig.changedTouches[0].pageY - offset.y,
                    left: orig.changedTouches[0].pageX - offset.x
                });
            };
            
            element.bind("touchstart", function(e) {
                var orig = e.originalEvent;
                var pos = $(this).position();
                offset = {
                    x: orig.changedTouches[0].pageX - pos.left,
                    y: orig.changedTouches[0].pageY - pos.top
                };
                element.trigger("dragstart", pos);
            });
            element.bind("touchmove", function(e) {
                e.preventDefault();
                var orig = e.originalEvent;

                var parentOffset=$(containment).offset();
                var parentHeight=$(containment).height();
                var parentWidth=$(containment).width();

                var movement={
                    top: Math.max((orig.changedTouches[0].pageY - offset.y),parentOffset.top),
                    left: Math.max(( orig.changedTouches[0].pageX - offset.x),parentOffset.left),
                }

                movement.top = Math.min(movement.top, (parentHeight + parentOffset.top - element.height()));
                movement.left = Math.min(movement.left, (parentWidth + parentOffset.top - element.width()));
                
                // do now allow two touch points to drag the same element
                if (orig.targetTouches.length > 1)
                    return;
                
                $(this).css(movement);
            });
            element.bind("touchend", end);
            element.bind("touchcancel", end);
        });
        return this;
    };
    
    /**
     * Draggable fallback for when touch is not available
     */
    $.fn.draggableMouse = function (options) {
        // check if we shall make it not draggable


        if (options['action'] == "disable") {
            this.unbind("mousedown");
            this.unbind("mouseup");
            return this;
        }
        
        this.each(function() {
            var element = $(this);
            var offset = null;
            var containment=$(options["containment"]);
            var move = function(e) {
                var parentOffset=$(containment).offset();
                var parentHeight=$(containment).height();
                var parentWidth=$(containment).width();

                var movement={
                    top: Math.max((e.pageY - offset.y),parentOffset.top),
                    left: Math.max((e.pageX - offset.x),parentOffset.left),
                }

                movement.top = Math.min(movement.top, (parentHeight + parentOffset.top - element.height()));
                movement.left = Math.min(movement.left, (parentWidth + parentOffset.top - element.width()));
                element.css(movement);
            };
            var up = function(e) {
                element.unbind("mouseup", up);
                $(document).unbind("mousemove", move);
                element.trigger("dragend", {
                    top: e.pageY - offset.y,
                    left: e.pageX - offset.x
                });
            };
            element.bind("mousedown", function(e) {
                var pos = element.position();
                offset = {
                    x: e.pageX - pos.left,
                    y: e.pageY - pos.top
                };
                $(document).bind("mousemove", move);
                element.bind("mouseup", up);
                element.trigger("dragstart", pos);
                e.preventDefault();
            });
        });
        return this;
    };
})(jQuery);
