/* ================= TWITTER PLUGIN ================= */
(function( $ ) {
    $.fn.wt_twitter = function(options) {
        var linkify = function(text){
            text = text.replace(/(https?:\/\/\S+)/gi, function (s) {
                return '<a class="wt_twitter_post_link_external" href="' + s + '">' + s + '</a>';
            });
            text = text.replace(/(^|)@(\w+)/gi, function (s) {
                return '<a class="wt_twitter_post_link_user" href="http://twitter.com/' + s + '">' + s + '</a>';
            });
            text = text.replace(/(^|)#(\w+)/gi, function (s) {
                return '<a class="wt_twitter_post_link_search" href="http://search.twitter.com/search?q=' + s.replace(/#/,'%23') + '">' + s + '</a>';
            });
            return text;
        };
        return this.each(function(){
			var settings = $.extend( {
				user : '',
				posts: 5,
				loading: 'Loading tweets..'
			}, options);
            var t = $(this);
            if(t.attr('data-user'))
                settings.user = t.attr('data-user');
            if(t.attr('data-posts'))
                settings.posts = parseInt(t.attr('data-posts'));
            if(t.attr('data-loading'))
                settings.loading = t.attr('data-loading');
            if(settings.user.length && (typeof settings.posts === 'number' || settings.posts instanceof Number) && settings.posts>0){
                t.addClass('wt_twitter');
                if(settings.loading.length)
                    t.html('<div class="wt_twitter_loading">'+settings.loading+'</div>');
                $.getJSON("http://api.twitter.com/1/statuses/user_timeline/"+settings.user+".json?callback=?", function(t_tweets){
                    t.empty();
                    for(var i=0;i<settings.posts&&i<t_tweets.length;i++){
                        var t_date_str;
                        var t_date_seconds = Math.floor(((new Date()).getTime()-Date.parse(t_tweets[i].created_at))/1000);
                        var t_date_minutes = Math.floor(t_date_seconds/60);
                        if(t_date_minutes){
                            var t_date_hours = Math.floor(t_date_minutes/60);
                            if(t_date_hours){
                                var t_date_days = Math.floor(t_date_hours/24);
                                if(t_date_days){
                                    var t_date_weeks = Math.floor(t_date_days/7);
                                    if(t_date_weeks)
                                        t_date_str = 'About '+t_date_weeks+' week'+(1==t_date_weeks?'':'s')+' ago';
                                    else
                                        t_date_str = 'About '+t_date_days+' day'+(1==t_date_days?'':'s')+' ago';
                                }else
                                    t_date_str = 'About '+t_date_hours+' hour'+(1==t_date_hours?'':'s')+' ago';
                            }else
                                t_date_str = 'About '+t_date_minutes+' minute'+(1==t_date_minutes?'':'s')+' ago';
                        }else
                            t_date_str = 'About '+t_date_seconds+' second'+(1==t_date_seconds?'':'s')+' ago';
                        var t_message =
                            '<div class="wt_twitter_post'+(i+1==t_tweets.length?' last"':'"')+'>'+
                                linkify(t_tweets[i].text)+
                                '<span class="wt_twitter_post_date">'+
                                    t_date_str+
                                '</span>'+
                            '</div>';
                        t.append(t_message);
                    }
                });
            }
       });
    };
})( jQuery );



/* ================= PORTOFOLIO PLUGIN ================= */
(function( $ ){
    $.fn.categorized = function( settings, options ) {
        for(var i=0;i<options.length;i++){
            options[i] = $.extend({
                resolution: 0,   //mandatory
                columns: 0,   //mandatory
                itemMarginRight: 0,
                itemMarginBottom: 0,
                containerPaddingTop: 0,
                containerPaddingBottom: 0,
                containerPaddingLeft: 0,
                containerPaddingRight: 0,
                itemHeight: 0   //mandatory
            }, options[i]);
			if(options[i].containerWidth===undefined)
				options[i].containerWidth = options[i].resolution;
		}
        settings = $.extend({
            itemClass: '',   //mandatory
            time: 0,   //mandatory
            allCategory: '',   //mandatory
            categoryAttribute: 'data-categories'
        }, settings);
        var t = this.get(0);
        var t_container = $(t);
        var t_items = t_container.children('.'+settings.itemClass);
        var t_items_length = t_items.length;
        var t_items_categorized = [];
        var t_category_all = settings.allCategory;
        var t_category;
        if(settings.initialCategory!==undefined)
            t_category = settings.initialCategory;
        else
            t_category = t_category_all;
        var t_category_previous = t_category_all;
        var t_index = -1;
        var x_categorize = function(){
            for(var i=0;i<t_items_length;i++){
                var x_current = t_items.filter(':eq('+i+')');
                t_items_categorized.push({
                    item: x_current,
                    categories: x_current.attr(settings.categoryAttribute).replace(/^\s+/,'').replace(/\s+$/,'').replace(/\s+/g,' ').toLowerCase().split(' ')
                });
            }
        };
        x_categorize();
        var x_sortResolutions = function(){
            for(var i=0;i<options.length-1;i++){
                var i_max = i;
                for(var j=i+1;j<options.length;j++)
                    if(options[j].resolution>options[i_max].resolution){
                        i_max = j;
                    }
                if(i_max>i){
                    var temp = options[i];
                    options[i] = options[i_max];
                    options[i_max] = temp;
                }
            }
        };
        x_sortResolutions();
        var x_arrangeItems = function(){
            var blocks = [];
            for(var i=0;i<options[t_index].columns;i++)
                blocks[i] = 0;
            t_container.width(options[t_index].containerWidth);
            var x_width = Math.floor((options[t_index].containerWidth-options[t_index].containerPaddingLeft-options[t_index].containerPaddingRight-(options[t_index].columns-1)*options[t_index].itemMarginRight)/options[t_index].columns);
            var x_height;
            var x_index;
            for(var i=0;i<t_items_length;i++){
                x_index = $.inArray(Array.min(blocks),blocks);
                if(-1!==t_items_categorized[i].categories.indexOf(t_category)||t_category===t_category_all){
                    if(-1!==t_items_categorized[i].categories.indexOf(t_category_previous)||t_category_previous===t_category_all){
                        t_items_categorized[i].item.stop().css({overflow:'visible'}).animate({
                            top: blocks[x_index],
                            left: options[t_index].containerPaddingLeft+x_index*(x_width+options[t_index].itemMarginRight)
                        },{duration:settings.time,queue:false,easing:'linear'});
                    }else{
                        t_items_categorized[i].item.stop().css({overflow:'visible'}).css({
                            top: blocks[x_index],
                            left: options[t_index].containerPaddingLeft+x_index*(x_width+options[t_index].itemMarginRight),
                            marginLeft: (1===options[t_index].columns?0:x_width/2),
                            marginTop: x_height/2
                        });
                    }
                    x_height = t_items_categorized[i].item.css({
                        width: x_width
                    }).children('.post_box_img').outerHeight(true);
                    t_items_categorized[i].item.animate({
                        opacity: 1,
                        width: x_width,
                        height: x_height,
                        marginLeft: 0,
                        marginTop: 0
                    },{duration:settings.time,queue:false,easing:'linear'});
                    blocks[x_index] += x_height+options[t_index].itemMarginBottom;
                }else{
                    if(-1!==t_items_categorized[i].categories.indexOf(t_category_previous)||t_category_previous===t_category_all){
                        t_items_categorized[i].item.stop().css({overflow:'visible'}).animate({
                            opacity: 0,
                            width: (1===options[t_index].columns?x_width:0),
                            height: 0,
                            marginLeft: (1===options[t_index].columns?0:x_width/2),
                            marginTop: x_height/2
                        },{duration:settings.time,queue:false,easing:'linear'});
                    }
                }
            }
            t_container.stop().css({overflow:'visible'}).animate({height:Array.max(blocks)},{duration:settings.time,queue:false,easing:'linear'});
        };
        var x_arrangeItemsResponsive = function(){
            var blocks = [];
            for(var i=0;i<options[t_index].columns;i++)
                blocks[i] = 0;
            t_container.width(options[t_index].containerWidth);
            var x_width = Math.floor((options[t_index].containerWidth-options[t_index].containerPaddingLeft-options[t_index].containerPaddingRight-(options[t_index].columns-1)*options[t_index].itemMarginRight)/options[t_index].columns);
            var x_height;
            var x_index;
            for(var i=0;i<t_items_length;i++){
                x_index = $.inArray(Array.min(blocks),blocks);
                if(!(-1===t_items_categorized[i].categories.indexOf(t_category))||t_category===t_category_all){
                    x_height = t_items_categorized[i].item.css({
                        width: x_width
                    }).children('.post_box_img').outerHeight(true);
                    t_items_categorized[i].item.stop().css({overflow:'visible'}).css({
                        top: blocks[x_index],
                        left: options[t_index].containerPaddingLeft+x_index*(x_width+options[t_index].itemMarginRight),
                        opacity: 1,
                        height: x_height,
                        marginLeft: 0,
                        marginTop: 0
                    });
                    blocks[x_index] += x_height+options[t_index].itemMarginBottom;
                }else
                    t_items_categorized[i].item.stop().css({overflow:'visible'}).css({
                        top: blocks[x_index],
                        left: options[t_index].containerPaddingLeft+x_index*(x_width+options[t_index].itemMarginRight),
                        opacity: 0,
                        width: 0,
                        height: 0,
                        marginLeft: x_width/2,
                        marginTop: x_height/2
                    });
            }
            t_container.stop().css({overflow:'visible'}).css({height:Array.max(blocks)});
        };
        t.changeCategory = function(category){
            if(category!==t_category){
                t_category_previous = t_category;
                t_category = category;
                x_arrangeItems();
            }
        };
        var t_window = $(window);
        var x_resize = function(){
            var w_width = t_window.width();
            var t_index_temp = 0;
            while(w_width<options[t_index_temp].resolution&&t_index_temp<options.length-1)
                t_index_temp++;
            if(t_index_temp!==t_index){
                t_index = t_index_temp;
                x_arrangeItemsResponsive();
            }
        };
        t_window.resize(x_resize);
        x_resize();
        t.destroyCategorizedObject = function(){
            t_window.unbind('resize',x_resize);
            delete t.changeCategory;
        };
        return t;
    };
})( jQuery );

Array.min = function(array) {
    return Math.min.apply(Math, array);
};
Array.max = function(array) {
    return Math.max.apply(Math, array);
};


/* ================= LOAD MODULES ================= */
var t_browser_has_css3;
var t_css3_array = ['transition','-webkit-transition','-moz-transition','-o-transition','-ms-transition'];
var t_css3_index;
$(document).ready(function(){
    var t_css3_test = $('body');
    for(t_css3_index=0, t_css3_test.css(t_css3_array[t_css3_index],'');t_css3_index<t_css3_array.length&&null==t_css3_test.css(t_css3_array[t_css3_index]);t_css3_test.css(t_css3_array[++t_css3_index],''));
    if(t_css3_index<t_css3_array.length)
        t_browser_has_css3 = true;
    else
        t_browser_has_css3 = false;
    load_photostream();
    load_main_slider();
    load_tooltips();
    load_carousel();
    load_contact();
    load_portofolio();
    load_about_slider_team();
});



/* ================= SCROOL TOP ================= */
$(document).ready(function () {
    $('#footer_arrow a').click(function () {
        $('body,html').animate({
            scrollTop: 0
        }, 1200, 'swing');
        return false;
    });
}); 



/* ================= PORTFOLIO HOVER EFFECTS ================= */
$(function(){
	var t_time = 300;
	$(".hover_effect").hover(function(){
		$(this).stop().animate({opacity:1},{queue:false,duration:t_time,easing:'linear'});
		$(this).find(".image_zoom img").stop().animate({marginTop:0},{queue:false,duration:t_time,easing:'linear'});
		$(this).find(".porto_title").stop().animate({marginLeft:'0%'},{queue:false,duration:t_time,easing:'linear'});
		$(this).find(".porto_type").stop().animate({marginLeft:'0%'},{queue:false,duration:t_time,easing:'linear'});
	},function(){
		$(this).stop().animate({opacity:0},{queue:false,duration:t_time,easing:'linear'});
		$(this).find(".image_zoom img").stop().animate({marginTop:-80},{queue:false,duration:t_time,easing:'linear'});
		$(this).find(".porto_title").stop().animate({marginLeft:'-100%'},{queue:false,duration:t_time,easing:'linear'});
		$(this).find(".porto_type").stop().animate({marginLeft:'100%'},{queue:false,duration:t_time,easing:'linear'});
	});
});



/* ================= SLIDE CONTENT EFFECTS ================= */
$(function(){
	var t_time = 300;
	$(".slide_image_hover").hover(function(){
		$(this).stop().animate({opacity:1},{queue:false,duration:t_time,easing:'linear'});
		$(this).find(".slide_image_zoom").stop().animate({left:48},{queue:false,duration:t_time,easing:'linear'});
		$(this).find(".slide_image_link").stop().animate({right:48},{queue:false,duration:t_time,easing:'linear'});
	},function(){
		$(this).stop().animate({opacity:0},{queue:false,duration:t_time,easing:'linear'});
		$(this).find(".slide_image_zoom").stop().animate({left:'-100%'},{queue:false,duration:t_time,easing:'linear'});
		$(this).find(".slide_image_link").stop().animate({right:'-100%'},{queue:false,duration:t_time,easing:'linear'});
	});
});



/* ================= KEYBORD ================= */
$(document).ready(function () {
	$(".keybord_mini img").click(function(){
		$(".keybord").css("display","block");
	});
	$(".keybord").click(function(){
		$(".keybord").css("display","none");
	});
});



/* ================= TOOL TIP ================= */
$(document).ready(function () {
	$('.tool_title').tooltip();
}); 



/* ================= PRETTY PHOTO ================= */
$(document).ready(function(){
    $("a[data-rel^='prettyPhoto']").prettyPhoto();
  });



/* ================= TWITTER ================= */

$(document).ready(function(){
	$('.twitter').wt_twitter();
});


/* ================= PHOTOSTREAM ================= */
var load_photostream = function(){
    $('.Photostream').each(function(){
        var stream = $(this);
        var stream_userid = stream.attr('data-userid');
        var stream_items = parseInt(stream.attr('data-items'));
        $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?lang=en-us&format=json&id="+stream_userid+"&jsoncallback=?", function(stream_feed){
            for(var i=0;i<stream_items&&i<stream_feed.items.length;i++){
                var stream_function = function(){
                    if(stream_feed.items[i].media.m){
                        var stream_a = $('<a>').addClass('PhotostreamLink').attr('href',stream_feed.items[i].link).attr('target','_blank');
                        var stream_img = $('<img>').addClass('PhotostreamImage').attr('src',stream_feed.items[i].media.m).attr('alt','').each(function(){
                            var t_this = this;
                            var j_this = $(this);
                            var t_loaded_function = function(){
                                stream_a.append(t_this);
                                if(j_this.width()<j_this.height())
                                    j_this.attr('style','width: 100% !important; height: auto !important;');
                                else
                                    j_this.attr('style','width: auto !important; height: 100% !important;');
                            };
                            var t_loaded_ready = false;
                            var t_loaded_check = function(){
                                if(!t_loaded_ready){
                                    t_loaded_ready = true;
                                    t_loaded_function();
                                }
                            }
                            var t_loaded_status = function(){
                                if(t_this.complete&&j_this.height()!==0)
                                    t_loaded_check();
                            }
                            t_loaded_status();
                            $(this).load(function(){
                                t_loaded_check();
                            });
                            if($.browser.msie)
                                this.src = this.src;
                        });
                        stream.append(stream_a);
                    }
                }
                stream_function();
            }
        });
    });
};



/* ================= IE fix ================= */
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) {return i;}
        }
        return -1;
    }
}



/* ================= COLLAPSE ================= */
$(function(){
	var t_accordion = $('#accordion2');
	var t_active_class = 'accordion-heading-active';
	t_accordion.find('.collapse.in').parents('.accordion-group').find('.accordion-heading').addClass(t_active_class);
	t_accordion.find('.accordion-group').on('show', function () {
		$(this).find('.accordion-heading').addClass(t_active_class);
	});
	t_accordion.find('.accordion-group').on('hide', function () {
		$(this).find('.accordion-heading').removeClass(t_active_class);
	});
});



/* ================= MAIN SLIDER ================= */
var load_main_slider = function(){
    $('.rs_mainslider').each(function(){
        var t_time = 1000;   //time for transition animation
        var t_interval_time = 4000;   //time for slide change, must be equal or bigger then effect transition time;
        var t_resume_time = 10000;   //time to resume autoplay after a click
        var t_hover_time = 200;   //time for hover eefect
        var t_text_time = 500;   //time for text animation
        var t = $(this);
        var t_prev = t.find('.rs_mainslider_left');
        var t_next = t.find('.rs_mainslider_right');
        var t_items_container = t.find('ul.rs_mainslider_items');
        var t_items = t_items_container.find('li');
        var t_dots_container = t.find('.rs_mainslider_dots_container ul.rs_mainslider_dots');
        var t_dots;
        var t_items_active_class = 'rs_mainslider_items_active';
        var t_items_active_selector = '.'+t_items_active_class;
        var t_dots_active_class = 'rs_mainslider_dots_active';
        var t_dots_active_selector = '.'+t_dots_active_class;
        var t_index = 0;
        var t_index_max = t_items.length-1;
        var t_select_fix = function(){
            return false;
        };
        var t_interval = 0;
        var t_timeout = 0;
        var t_autoplay_start = function(){
            t_interval = setInterval(t_next_function,t_interval_time);
        };
        var t_autoplay_stop = function(){
            clearInterval(t_interval);
            clearTimeout(t_timeout);
            t_timeout = setTimeout(t_autoplay_start,t_resume_time);
        };
        var t_text = t.find('ul.rs_mainslider_items li .rs_mainslider_items_text');
        var t_text_top = t_text.css('top');
        var t_text_last;
        var t_next_function = function(){
            var t_text_old = t_text.filter(':eq('+t_index+')');
            t_index++;
            if(t_index>t_index_max)
                t_index = 0;
            var t_text_current = t_text.filter(':eq('+t_index+')');
            if(t_text_last!==undefined)
                t_text_last.stop(true).css({top:-t_text_last.height()});
            t_text_last = t_text_old;
            t_text_old.stop(true).animate({top:'100%'},{queue:false,duration:t_text_time,easing:'easeInBack',complete:function(){
                t_text_current.stop(true).animate({top:t_text_top},{queue:false,duration:t_text_time,times:1,easing:'easeOutBack'});
            }});
            t_items_container.css({height:t_items.filter(t_items_active_selector).outerHeight(true)});
            t_items.filter(t_items_active_selector).removeClass(t_items_active_class).children('.rs_mainslider_items_image').stop(true).animate({opacity:0},{queue:false,duration:t_time,easing:'swing'});
            t_dots.filter(t_dots_active_selector).removeClass(t_dots_active_class);
            t_items.filter(':eq('+t_index+')').addClass(t_items_active_class).children('.rs_mainslider_items_image').stop(true).animate({opacity:1},{queue:false,duration:t_time,easing:'swing'});
            t_dots.filter(':eq('+t_index+')').addClass(t_dots_active_class);
            t_items_container.css({height:'auto'});
        };
        var t_items_count = t_items.length;
        t_text.each(function(i){
            $(this).css({top:'-100%'});
        });
        t_items.each(function(){
            var x = $(this);
            var x_img = x.children('.rs_mainslider_items_image');
            var x_text = x.children('.rs_mainslider_items_text');
            x_img.each(function(){
                var t_this = this;
                var t_loaded_function = function(){
                    x_text.css({top:-$(t_this).height()});
                    t_items_count--;
                    if(t_items_count===0){
                        t_text.filter(':eq('+t_index+')').stop(true).animate({top:t_text_top},{queue:false,duration:t_text_time,easing:'easeOutBack'});
                        for(i=0;i<=t_index_max;i++)
                            t_dots_container.append('<li'+(t_index===i?' class="'+t_dots_active_class+'"':'')+'></li>');
                        t_dots = t_dots_container.children('li');
                        t_items.filter(':eq('+t_index+')').addClass(t_items_active_class).children('.rs_mainslider_items_image').stop(true).animate({opacity:1},{queue:false,duration:t_time,easing:'swing'});
                        t_dots.filter(':eq('+t_index+')').addClass(t_dots_active_class);
                        t_prev.click(function(){
                            var t_text_old = t_text.filter(':eq('+t_index+')');
                            t_index--;
                            if(t_index<0)
                                t_index = t_index_max;
                            var t_text_current = t_text.filter(':eq('+t_index+')');
                            if(t_text_last!==undefined)
                                t_text_last.stop(true).css({top:-t_text_last.height()});
                            t_text_last = t_text_old;
                            t_text_old.stop(true).css({top:t_text_top}).animate({top:'100%'},{queue:false,duration:t_text_time,easing:'easeInBack',complete:function(){
                                t_text_current.stop(true).animate({top:t_text_top},{queue:false,duration:t_text_time,times:1,easing:'easeOutBack'});
                            }});
                            t_items_container.css({height:t_items.filter(t_items_active_selector).outerHeight(true)});
                            t_items.filter(t_items_active_selector).removeClass(t_items_active_class).children('.rs_mainslider_items_image').stop(true).animate({opacity:0},{queue:false,duration:t_time,easing:'swing'});
                            t_dots.filter(t_dots_active_selector).removeClass(t_dots_active_class);
                            t_items.filter(':eq('+t_index+')').addClass(t_items_active_class).children('.rs_mainslider_items_image').stop(true).animate({opacity:1},{queue:false,duration:t_time,easing:'swing'});
                            t_dots.filter(':eq('+t_index+')').addClass(t_dots_active_class);
                            t_items_container.css({height:'auto'});
                            t_autoplay_stop();
                        });
                        t_next.click(function(){
                            t_next_function();
                            t_autoplay_stop();
                        });
                        t_dots.click(function(){
                            var t_dots_current = t_dots.filter(t_dots_active_selector).not(this);
                            if(t_dots_current.length){
                                var t_text_old = t_text.filter(':eq('+t_index+')');
                                t_index = t_dots.index(this);
                                var t_text_current = t_text.filter(':eq('+t_index+')');
                                if(t_text_last!==undefined)
                                    t_text_last.stop(true).css({top:-t_text_last.height()});
                                t_text_last = t_text_old;
                                t_text_old.stop(true).css({top:t_text_top}).animate({top:'100%'},{queue:false,duration:t_text_time,easing:'easeInBack',complete:function(){
                                    t_text_current.stop(true).animate({top:t_text_top},{queue:false,duration:t_text_time,times:1,easing:'easeOutBack'});
                                }});
                                t_items_container.css({height:t_items.filter(t_items_active_selector).outerHeight(true)});
                                t_items.filter(t_items_active_selector).removeClass(t_items_active_class).children('.rs_mainslider_items_image').stop(true).animate({opacity:0},{queue:false,duration:t_time,easing:'swing'});
                                t_dots_current.filter(t_dots_active_selector).removeClass(t_dots_active_class);
                                t_items.filter(':eq('+t_index+')').addClass(t_items_active_class).children('.rs_mainslider_items_image').stop(true).animate({opacity:1},{queue:false,duration:t_time,easing:'swing'});
                                t_dots.filter(':eq('+t_index+')').addClass(t_dots_active_class);
                                t_items_container.css({height:'auto'});
                            }
                            t_autoplay_stop();
                        });
                        t.hover(function(){
                            t_prev.stop(true).animate({opacity:1},{queue:false,duration:t_hover_time,easing:'linear'});
                            t_next.stop(true).animate({opacity:1},{queue:false,duration:t_hover_time,easing:'linear'});
                        },function(){
                            t_prev.stop(true).animate({opacity:0},{queue:false,duration:t_hover_time,easing:'linear'});
                            t_next.stop(true).animate({opacity:0},{queue:false,duration:t_hover_time,easing:'linear'});
                        });
                        t_prev.mousedown(t_select_fix);
                        t_next.mousedown(t_select_fix);
                        t_dots.mousedown(t_select_fix);
                        t_autoplay_start();
                    }
                };
                var t_loaded_ready = false;
                var t_loaded_check = function(){
                    if(!t_loaded_ready){
                        t_loaded_ready = true;
                        t_loaded_function();
                    }
                }
                var t_loaded_status = function(){
                    if(t_this.complete)
                        t_loaded_check();
                }
                $(this).load(function(){
                    t_loaded_check();
                });
                t_loaded_status();
                if($.browser.msie)
                    this.src = this.src;
            });
        });
    });
};



/* ================= TOOLTIPS ================= */
var load_tooltips = function(){
    var t_hints_close_time = 500;   //time for hint fade effect
    var t_scroll_time = 300;   //time for scrolling to hint
    var t_hints_expires_minutes = 5;   //minutes after which the cookie will expirev
    var t_hint_cookie = 'agat_tooltips';
    var t_hints = $('.hints');
    var t_hints_n = t_hints.length;
    if(t_hints_n){
        var t_index  = $.cookie(t_hint_cookie);
        if(null===t_index)
            t_index = '1';
        if('-1'!==t_index){
            var t_html = $.browser.msie?$('html'):$('html,body');
            var t_window = $(window);
            var t_document = $(document);
            t_hints.filter('[data-index='+t_index+']').css({visibility:'visible'}).animate({opacity:1},{queue:false,duration:t_hints_close_time,easing:'swing'});
            t_hints.each(function(){
                var t = $(this);
                var t_next = t.find('.hint_next');
                var t_close = t.find('.hint_close');
                t_close.click(function(){
                    t.animate({opacity:0},{queue:false,duration:t_hints_close_time,easing:'swing',complete:function(){t.css({visibility:'hidden'})}});
                    var t_date = new Date();
                    t_date.setMinutes(t_date.getMinutes()+t_hints_expires_minutes);
                    $.cookie(t_hint_cookie,-1,{expires: t_date});
                    return false;
                });
                t_next.click(function(){
                    var t_date = new Date();
                    t_date.setMinutes(t_date.getMinutes()+t_hints_expires_minutes);
                    t.animate({opacity:0},{queue:false,duration:t_hints_close_time,easing:'swing',complete:function(){t.css({visibility:'hidden'})}});
                    t_index = t_hints.filter('[data-index='+t_index+']').attr('data-next');
                    if('-1'!==t_index){
                        $.cookie(t_hint_cookie,t_index,{expires: t_date});
                    }else{
                        $.cookie(t_hint_cookie,-1,{expires: t_date});
                    }
                    var t_href = t_next.attr('href');
                    if(null===t_href||'#'===t_href[0]||'#'===t_href){
                        if('-1'!==t_index){
                            var t_current = t_hints.filter('[data-index='+t_index+']');
                            var t_current_position = t_current.offset();
                            t_html.animate({scrollTop:Math.min(t_document.height()-t_window.height(),Math.max(0,t_current_position.top-t_window.height()/2))},{queue:false,duration:t_scroll_time,easing:'swing'});
                            t_current.css({visibility:'visible'}).animate({opacity:1},{queue:false,duration:t_hints_close_time,easing:'swing'});
                        }
                        return false;
                    }else
                        return true;
                });
            });
        }
    }
};



/* ================= CAROUSEL ================= */
var load_carousel = function(){
    $('.slide_content').each(function(){
        var t_time = 500;   //time for animation effect
        var t = $(this);
        var t_scroll_width = $.browser.mozilla||$.browser.opera||$.browser.msie?scrollbarWidth():0;
        var t_prev = t.prev('.center_title').find('.slide_nav_back');
        var t_next = t.prev('.center_title').find('.slide_nav_next');
        var t_items = t.find('.slide_content_full>div').not('.clear');
        var t_items_n = t_items.length;
        var t_items_container_visible_width;
        var t_items_width;
        var t_visible;
        var t_index;
        var t_index_max;
        var t_prev_function;
        var t_next_function;
        var t_pre_process_specific;
        var t_pre_process = function(){
            t_items.attr('style','overflow:hidden; padding:5px 0px;');
            t_index = 0;
            t_items_container_visible_width = t.find('.slide_content_show').width();
            t_items_width = t_items.outerWidth(true);
            t_visible = Math.round(t_items_container_visible_width/t_items_width);
            t_index_max = t_items.length-Math.min(t_items.length,t_visible);
            t_pre_process_specific();
        };
        var t_img = t.find('img');
        var t_img_n = t_img.length;
        var t_img_loaded = function(){
            t_prev.click(function(){
                t_prev_function();
            });
            t_next.click(function(){
                t_next_function();
            });
            var t_w = $(window);
            var t_w_x = -1;
            var t_d = $(document);
            var t_w_width_get = function(){
                var t_w_width = t_w.width();
                var t_w_height = t_w.height();
                var t_d_height = t_d.height();
                if(t_w_height<t_d_height)
                    t_w_width += t_scroll_width;
                return t_w_width;
            };
            var t_w_resize_function = function(){
                var t_w_width = t_w_width_get();
                if( t_w_width>=768){
                    if(t_w_x!==1){
                        t_w_x = 1;
                        
                        t_pre_process_specific = function(){
                            if(t_index_max)
                                t_items.filter(':gt('+String(t_visible-1)+')').each(function(){
                                    var t_items_hidden = $(this);
                                    t_items_hidden.css({marginTop:t_items_hidden.height()/2}).css({display:'none'});
                                });
                        };
                        t_pre_process();
                        t_prev_function = function(){
                            if(t_index>0){
                                t_index--;
                                var t_items_current = t_items.filter(':eq('+t_index+')');
                                t_items_current.stop(true,true).animate({marginTop:0,height:'toggle',width:'toggle',marginLeft:'toggle'},{queue:false,duration:t_time,easing:'swing'});
                                var t_index_opposite = t_index+t_visible;
                                var t_items_copposite = t_items.filter(':eq('+t_index_opposite+')');
                                t_items_copposite.stop(true,true).animate({marginTop:t_items_copposite.height()/2,height:'toggle',width:'toggle',marginLeft:'toggle'},{queue:false,duration:t_time,easing:'swing'});
                            }
                        };
                        t_next_function = function(){
                            if(t_index<t_index_max){
                                var t_index_opposite = t_index+t_visible;
                                var t_items_copposite = t_items.filter(':eq('+t_index_opposite+')');
                                t_items_copposite.stop(true,true).animate({marginTop:0,height:'toggle',width:'toggle',marginLeft:'toggle'},{queue:false,duration:t_time,easing:'swing'});
                                var t_items_current = t_items.filter(':eq('+t_index+')');
                                t_items_current.stop(true,true).animate({marginTop:t_items_current.height()/2,height:'toggle',width:'toggle',marginLeft:'toggle'},{queue:false,duration:t_time,easing:'swing'});
                                t_index++;
                            }
                        };
                    }
                }else{
                    if( t_w_x!==2 ){
                        t_w_x = 2;
                        
                        t_pre_process_specific = function(){
                            t_visible = 1;
                            t_index_max = t_items_n-1;
                            if(t_index_max)
                                t_items.filter(':gt('+String(t_visible-1)+')').css({display:'none'});
                        };
                        t_pre_process();
                        t_prev_function = function(){
                            if(t_index>0){
                                t_items.filter(':eq('+t_index+')').css({display:'none'});
                                t_index--;
                                t_items.filter(':eq('+t_index+')').css({display:'block'});
                            }
                        };
                        t_next_function = function(){
                            if(t_index<t_index_max){
                                t_items.filter(':eq('+t_index+')').css({display:'none'});
                                t_index++;
                                t_items.filter(':eq('+t_index+')').css({display:'block'});
                            }
                        };
                    }
                }
            };
            t_w.resize(t_w_resize_function);
            t_w_resize_function();
        };
        var t_img_ready = [];
        var t_img_ready_complete = false;
        var t_img_ready_all = function(){
            var i = 0;
            for(i=0;i<t_img_n&&(t_img_ready[i]===1||t_img[i].complete);i++);
            return i===t_img_n;
        };
        var t_img_ready_check = function(){
            var t_img_ready_complete_temp = t_img_ready_all();
            if(!t_img_ready_complete&&t_img_ready_complete_temp){
                t_img_ready_complete = t_img_ready_complete_temp;
                t_img_loaded();
            }
        };
        t_img.each(function(index){
            t_img_ready[index] = 0;
        });
        if($.browser.msie){
            t_img.each(function(){
                this.src = this.src;
            });
        }
        t_img.load(function(index){
            t_img_ready[index] = 1;
            t_img_ready_check();
        });
        t_img_ready_check();
        t_prev.mousedown(function(){return false;});
        t_next.mousedown(function(){return false;});
    });
};


/* ================= CONTACTS FORM ================= */
var load_contact = function(){
    $('#contact_page_form').each(function(){
        var t = $(this);
        var t_result = $('#contact_page_form_result');
        var validate_email = function validateEmail(email) { 
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        };
        t.submit(function(event) {
            event.preventDefault();
            var t_values = {};
            var t_values_items = t.find('input[name],textarea[name]');
            t_values_items.each(function() {
                t_values[this.name] = $(this).val();
            });
            if(t_values['name']===''||t_values['email']===''||t_values['message']===''){
                t_result.html('Please fill in all the required fields.');
            }else
                if(!validate_email(t_values['email']))
                    t_result.html('Please provide a valid e-mail.');
                else
                    $.post("php/contacts.html", t.serialize(),function(result){
                        t_result.html(result);
                    });
        });
		
    });
}




// ========================== PORTO-FILTERS ========================== //
var load_portofolio = function(){
    $('.porto_filter').each(function(){
        var t = $(this);
        
        var t_loaded = function(){
            var t_filters = t.children('.porto_filterFilter').children('.center').children('ul.porto_filterFilterCategories').children('li');
            var t_filters_active_class = 'porto_filter_active';
            var t_filters_active_selector = '.'+t_filters_active_class;
            var t_views = t.children('.porto_filterViews').children('.porto_filterViewsOption');
            var t_views_active_class = 'worksViewsOptionActive';
            var t_views_active_selector = '.'+t_views_active_class;
            var t_container = t.children('.porto_filterContainer');
            var t_categorized_object;
            var t_settings1 = {
                itemClass: 'porto_box',
                time: 400,
                allCategory: 'all'
            };
            var t_options1 = [
                {
                    resolution: 980,
                    columns: 4,
                    itemHeight: 161,
                                    itemMarginRight: 20,
                                    itemMarginBottom: 20,
                                    containerWidth: 940
                },
                {
                    resolution: 768,
                    columns: 3,
                    itemHeight: 167,
                                    itemMarginRight: 20,
                                    itemMarginBottom: 20,
                                    containerWidth: 724
                },
                {
                    resolution: 520,
                    columns: 2,
                    itemHeight: 168,
                                    itemMarginRight: 20,
                                    itemMarginBottom: 20,
                                    containerWidth: 477
                },
                {
                    resolution: 300,
                    columns: 1,
                    itemHeight: 221,
                                    itemMarginBottom: 20,
                                    containerWidth: 250
                }
            ];
            var t_settings2 = {
                itemClass: 'porto_box',
                time: 400,
                allCategory: 'all'
            };
            var t_options2 = [
                {
                    resolution: 960,
                    columns: 1,
                    itemHeight: 215,
                    itemMarginBottom: 35
                },
                {
                    resolution: 768,
                    columns: 1,
                    itemHeight: 172,
                    itemMarginBottom: 35
                },
                {
                    resolution: 480,
                    columns: 1,
                    itemHeight: 107,
                    itemMarginBottom: 35
                },
                {
                    resolution: 300,
                    columns: 1,
                    itemHeight: 67,
                    itemMarginBottom: 35
                }
            ];
            var t_parameters = [[t_settings1,t_options1],[t_settings2,t_options2]];


            t_filters.click(function(){
                var t_filters_last = t_filters.filter(t_filters_active_selector).not(this);
                if(t_filters_last.length){
                    t_filters_last.removeClass(t_filters_active_class);
                    var t_filters_current = $(this);
                    t_filters_current.addClass(t_filters_active_class);
                    t_categorized_object.changeCategory(t_filters_current.attr('data-category'));
                }
                return false;
            });
            t_views.click(function(){
                var t_views_last = t_views.filter(t_views_active_selector).not(this);
                if(t_views_last.length){
                    t_views_last.removeClass(t_views_active_class);
                    t_container.removeClass(t_views_last.attr('data-class'));
                    var t_views_current = $(this);
                    t_views_current.addClass(t_views_active_class);
                    t_container.addClass(t_views_current.attr('data-class'));
                    t_categorized_object.destroyCategorizedObject();
                    var x_index = t_views.index(this);
                    t_parameters[x_index][0].initialCategory = t_filters.filter(t_filters_active_selector).attr('data-category');
                    t_categorized_object = t_container.categorized(t_parameters[x_index][0],t_parameters[x_index][1]);
                }
            });
            t_categorized_object = t_container.categorized(t_parameters[0][0],t_parameters[0][1]);
        }
        
        var t_img = t.find('img');
        var t_img_n = t_img.length;
        
        if(!t_img.length)
            t_loaded();
        else{
            var t_img_ready = [];
            var t_img_ready_complete = false;
            var t_img_ready_all = function(){
                var i = 0;
                for(i=0;i<t_img_n&&(t_img_ready[i]===1||t_img[i].complete);i++);
                return i===t_img_n;
            };
            var t_img_ready_check = function(){
                if(!t_img_ready_complete){
                    var t_img_ready_complete_temp = t_img_ready_all();
                    if(t_img_ready_complete_temp){
                        t_img_ready_complete = t_img_ready_complete_temp;
                        t_loaded();
                    }
                }
            };
            t_img.each(function(index){
                t_img_ready[index] = 0;
            });
            if($.browser.msie){
                t_img.each(function(){
                    this.src = this.src;
                });
            }
            t_img.load(function(index){
                t_img_ready[index] = 1;
                t_img_ready_check();
            });
            t_img_ready_check();
        }
        
    });
};
function scrollbarWidth() { 
    var div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div>'); 
    // Append our div, do our calculation and then remove it 
    $('body').append(div); 
    var w1 = $('div', div).innerWidth(); 
    div.css('overflow-y', 'scroll'); 
    var w2 = $('div', div).innerWidth(); 
    $(div).remove(); 
    return (w1 - w2); 
}


// ========================== ABOUT SLIDER ========================== //
var load_about_slider_team = function(){
    $('.about_slider').each(function(){
        var t_time = 500;   //effect time
        var t_interval_time = 10000;   //autoplay time for lower resolution, must be greater or equal then t_time
        var t = $(this);
        var t_container = t.find('.about_slider_container');
        var t_items = t_container.children('ul').children('li');
        var t_left = t.find('.arrow_left a');
        var t_right = t.find('.arrow_right a');
        
        var t_modes = {
            0: {
                visible: 3,
                index_max: t_items.length - 3,
                index: 0,
                items_width : t_items.outerWidth(true),
                left_function: function(){},
                right_function: function(){},
                close_function: function(){},
                more_function: function(){}
            }
        };
        
        if(t.hasClass('about_slider_team')){
            var t_close = t.find('.close_b');
            var t_more = t.find('.about_know a');
        
            t_close.click(function(){
                return t_modes[t_current_mode].close_function(this);
            });
            t_more.click(function(){
                return t_modes[t_current_mode].more_function(this);
            });
            
            t_modes = $.extend(t_modes,{
                1: {
                    visible: 1,
                    index_max: t_items.length - 1,
                    index: 0,
                    left_function: function(){},
                    right_function: function(){},
                    close_function: function(){},
                    more_function: function(){}
                }
            });
        }
        
        var t_current_mode = 0;
        
        t_left.click(function(){
            return t_modes[t_current_mode].left_function();
        });
        t_right.click(function(){
            return t_modes[t_current_mode].right_function();
        });
        
        var t_w = $(window);
        var t_w_index = -1;
        var t_d = $(document);
        
        var t_scroll_width = $.browser.mozilla||$.browser.opera||$.browser.msie?scrollbarWidth():0;
        
        var t_w_width_get = function(){
            var t_w_width = t_w.width();
            var t_w_height = t_w.height();
            var t_d_height = t_d.height();
            if(t_w_height<t_d_height)
                t_w_width += t_scroll_width;
            return t_w_width;
        };
        
        var t_interval = 0;
        var t_interval_index = -1;
        var t_interval_index_max = t_items.length - 1;
        
        var t_w_resize_function = function(){
            var t_w_width = t_w_width_get();
            if(t_w_width>=768){
                if((t_w_index!==2&&t_w_width>=980)||(t_w_index!==1&&t_w_width<980)){
                    if(-1!==t_interval_index){
                        clearInterval(t_interval);
                        t_items.eq(t_interval_index).removeClass('about_box_member_active',t_time);
                        t_modes[0].index = Math.min(t_modes[0].index_max,t_interval_index);
                        if(t.hasClass('about_slider_team'))
                            t_modes[1].index = t_interval_index;
                        t_interval_index = -1;
                        if(0===t_current_mode){
                            t_items.switchClass('span9','span3',0);
                        }else{
                            t_items.not(':eq('+t_modes[t_current_mode].index+')').switchClass('span9','span3',0);
                        }
                        if(t.hasClass('about_slider_team'))
                            t_close.show(0);
                    }
                    if(!t.hasClass('about_slider_team')){
                        t_modes = $.extend(true,t_modes,{
                            0: {
                                items_width : t_items.filter('.span3').outerWidth(true),
                                left_function: function(){
                                    if(t_modes[t_current_mode].index>0){
                                        t_modes[t_current_mode].index--;
                                        t_container.animate({marginLeft:-t_modes[t_current_mode].items_width*t_modes[t_current_mode].index},{duration:t_time,queue:false,easing:'swing'});
                                    }
                                    return false;
                                },
                                right_function: function(){
                                    if(t_modes[t_current_mode].index<t_modes[t_current_mode].index_max){
                                        t_modes[t_current_mode].index++;
                                        t_container.animate({marginLeft:-t_modes[t_current_mode].items_width*t_modes[t_current_mode].index},{duration:t_time,queue:false,easing:'swing'});
                                    }
                                    return false;
                                }
                            }
                        });
                    }else{
                        t_modes = $.extend(true,t_modes,{
                            0: {
                                items_width : t_items.filter('.span3').outerWidth(true),
                                left_function: function(){
                                    if(t_modes[t_current_mode].index>0){
                                        t_modes[t_current_mode].index--;
                                        t_container.animate({marginLeft:-t_modes[t_current_mode].items_width*t_modes[t_current_mode].index},{duration:t_time,queue:false,easing:'swing'});
                                    }
                                    return false;
                                },
                                right_function: function(){
                                    if(t_modes[t_current_mode].index<t_modes[t_current_mode].index_max){
                                        t_modes[t_current_mode].index++;
                                        t_container.animate({marginLeft:-t_modes[t_current_mode].items_width*t_modes[t_current_mode].index},{duration:t_time,queue:false,easing:'swing'});
                                    }
                                    return false;
                                },
                                close_function: function(){},
                                more_function: function(t_this){
                                    t_modes[1].index = t_more.index(t_this);
                                    t_items.eq(t_more.index(t_this)).switchClass('span3','span9',t_time);
                                    t_current_mode = 1;
                                    t_container.animate({marginLeft:-t_modes[t_current_mode].items_width*t_modes[t_current_mode].index},{duration:t_time,queue:false,easing:'swing'});
                                    return false;
                                }
                            },
                            1: {
                                items_width : t_items.filter('.span3').outerWidth(true),
                                left_function: function(){
                                    if(t_modes[t_current_mode].index>0){
                                        t_items.eq(t_modes[t_current_mode].index).switchClass('span9','span3',t_time);
                                        t_modes[t_current_mode].index--;
                                        t_modes[0].index = Math.min(t_modes[1].index,t_modes[0].index_max);
                                        t_items.eq(t_modes[t_current_mode].index).switchClass('span3','span9',t_time);
                                        t_container.animate({marginLeft:-t_modes[t_current_mode].items_width*t_modes[t_current_mode].index},{duration:t_time,queue:false,easing:'swing'});
                                    }
                                    return false;
                                },
                                right_function: function(){
                                    if(t_modes[t_current_mode].index<t_modes[t_current_mode].index_max){
                                        t_items.eq(t_modes[t_current_mode].index).switchClass('span9','span3',t_time);
                                        t_modes[t_current_mode].index++;
                                        t_modes[0].index = Math.max(t_modes[0].index,t_modes[1].index-2);
                                        t_items.eq(t_modes[t_current_mode].index).switchClass('span3','span9',t_time);
                                        t_container.animate({marginLeft:-t_modes[t_current_mode].items_width*t_modes[t_current_mode].index},{duration:t_time,queue:false,easing:'swing'});
                                    }
                                    return false;
                                },
                                close_function: function(t_this){
                                    t_items.eq(t_close.index(t_this)).switchClass('span9','span3',t_time);
                                    t_current_mode = 0;
                                    t_container.animate({marginLeft:-t_modes[t_current_mode].items_width*t_modes[t_current_mode].index},{duration:t_time,queue:false,easing:'swing'});
                                    return false;
                                },
                                more_function: function(){}
                            }
                        });
                    }
                    t_container.css({marginLeft:-t_modes[t_current_mode].items_width*t_modes[t_current_mode].index});
                    if(t_w_width>=980&&t_w_index!==2){
                        t_w_index = 2;
                    }
                    else if(t_w_index!==1){
                        t_w_index = 1;
                    }
                }
            }
            else{
                if(t_w_index!==0){
                    t_w_index = 0;
                    t_items.switchClass('span3','span9',0);
                    t_interval_index = t_modes[t_current_mode].index;
                    t_items.eq(t_interval_index).addClass('about_box_member_active');
                    t_interval = setInterval(function(){
                        if(t_interval_index_max>0){
                            t_items.eq(t_interval_index).removeClass('about_box_member_active',t_time);
                            if(t_interval_index<t_interval_index_max)
                                t_interval_index++;
                            else
                                t_interval_index = 0;
                            t_items.eq(t_interval_index).addClass('about_box_member_active',t_time);
                        }
                    },t_interval_time);
                    if(t.hasClass('about_slider_team'))
                        t_close.hide(0);
                }
            }
        }
        
        t_w.resize(t_w_resize_function);
        t_w_resize_function();
    });
}
