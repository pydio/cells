/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */
var currentLink;
function parseLinks(){
    var bmlink1 = '<a id="ajxp_bm_link_dl1" title="Send to Pydio">\
                Download <img ajxp_image="true" src="'+window.ajxp_bm_target+'/plugins/gui.ajax/res/themes/orbit/images/actions/22/forward_22.png" align="absmiddle"><img align="absmiddle" ajxp_image="true" src="'+window.ajxp_bm_target+'/plugins/gui.ajax/res/themes/orbit/images/actions/32/hdd_external_unmount.png"></a>';
	jQuery('body').append('<link rel="stylesheet" type="text/css" href="'+ajxp_bm_target+'plugins/uploader.http/bookmarklet/ajxp.css"></link>');
	jQuery('body').append('<div id="ajxp_bm_main" style="display:none;" class="ajxp_bm_menu" ><div><a id="ajxp_bm_close" style="float:right;font-size:12px;cursor:pointer;border-left:1px solid #fff;padding-left: 10px;">X</a>Pydio direct download</div><div class="ajxp_bm_menu_legend">Click on any link or image to send the link directly to your Pydio account.</div><div style="display:none" id="ajxp_bm_frame_div"><iframe frameborder="0" id="ajxp_bm_iframe"></iframe></div></div><div style="position:absolute;" class="ajxp_bm_menu" id="ajxp_bm_link_menu">'+bmlink1+'<a id="ajxp_bm_link_dl2">Process link normally</a></div>').click(function(){jQuery('#ajxp_bm_link_menu').slideUp();}) ;

    jQuery('#ajxp_bm_main').css("background-color", "#ffffff").css("width", "400px").css("font-size","29px").css("line-height","auto");
    window.setTimeout(function(){
        jQuery('#ajxp_bm_main').css("top", ((jQuery(window).height() - jQuery('#ajxp_bm_main').outerHeight()) / 2) + jQuery(window).scrollTop() + "px");
        jQuery('#ajxp_bm_main').css("right", ((jQuery(window).width() - jQuery('#ajxp_bm_main').outerWidth()) / 2) + jQuery(window).scrollLeft() + "px");
        jQuery('#ajxp_bm_main').slideDown();
    }, 100);
    window.setTimeout(function(){
        var wTop = jQuery(window).scrollTop() + 5;
        jQuery("#ajxp_bm_main").animate({
            top:jQuery(window).scrollTop() + 5,
            right:5,
            width:250,
            fontSize:"16px",
            lineHeight:"20px",
            opacity:0.9
        });
        jQuery(".ajxp_bm_menu_legend").slideUp();
    }, 2500);
    
	jQuery(window).bind('scroll', function(){
		jQuery('#ajxp_bm_main').css('top', jQuery(window).scrollTop() + 5);
	});
	//jQuery('#ajxp_bm_main').css('top', jQuery(window).scrollTop() + 5);
	jQuery('#ajxp_bm_link_dl1').click(triggerAjxpDL);
	jQuery('#ajxp_bm_link_dl2').click(triggerOriginalDL);
	var linkHandler = function(event){
		event.preventDefault();
		event.stopPropagation();
		currentLink = jQuery(this);
		var offset = currentLink.offset();
		var height = currentLink.height();
        var width = currentLink.width();
		var href = currentLink.attr("href") || currentLink.attr('src');
		var title = realHref(href);
		jQuery('#ajxp_bm_link_dl2').show();
		if(currentLink.attr("src")){
			if(!currentLink.parents('a').size()){
				jQuery('#ajxp_bm_link_dl2').hide();
			}
		}
		if(title.length > 38){
			title = title.substring(0,10)+'...'+title.substring(title.length-28);
		}
        jQuery("#ajxp_bm_link_menu a[ajxp_clone],#ajxp_bm_link_menu img[ajxp_clone]").remove();
        if(height > 45){
            jQuery("#ajxp_bm_link_menu").addClass("ajxp_bm_big").removeClass("ajxp_bm_small");
            if(jQuery("#ajxp_bm_link_menu").css('display') == 'none'){
                jQuery("#ajxp_bm_link_menu").css('top', offset.top-5).css('left',offset.left-5).css('height',height).css('width',width).slideDown();
            }else{
                jQuery("#ajxp_bm_link_menu").animate({top:offset.top-5,left:offset.left-5,height:height,width:width});
            }
            jQuery("#ajxp_bm_link_dl1").css("margin-top",(height/2)-30);
        }else{
            jQuery("#ajxp_bm_link_menu").removeClass("ajxp_bm_big").addClass("ajxp_bm_small");
            if(jQuery("#ajxp_bm_link_menu").css('display') == 'none'){
                jQuery("#ajxp_bm_link_menu").css('top', offset.top-5).css('left',offset.left-5).css('height','auto').css('width',Math.max(width,200)).slideDown();
            }else{
                jQuery("#ajxp_bm_link_menu").animate({top:offset.top-5,left:offset.left-5,width:Math.max(width,200)}).css('height','auto');
            }
            jQuery("#ajxp_bm_link_dl1").css("margin-top",5);
            jQuery("#ajxp_bm_link_dl1").before(jQuery(currentLink[0].cloneNode(true)).attr("ajxp_clone", "true"));
        }
	};
	var eachFuncAttacher = function(index){
		var link = jQuery(this);		
		var href = link.attr("href") || link.attr('src');
        if(link.attr('ajxp_image')) return;
		if(!href) return;
		link.bind('click', linkHandler).bind("mouseenter", function(){
            if(jQuery("#ajxp_bm_link_menu").css('display') == 'none') return;
            $(this).linkHandler();
        }) .attr('ajxp_bound', 'true');
	};
	jQuery('a,img').each(eachFuncAttacher);
	jQuery('#ajxp_bm_close').click(function(){
		jQuery('a,img').each(function(index){
			var link = jQuery(this);
			if(link.attr('ajxp_bound')){
				link.unbind('click', linkHandler);				
			}
		});
		jQuery('#ajxp_bm_main').remove();
		jQuery('#ajxp_bm_link_menu').remove();
	});	
}
function triggerAjxpDL(){
	jQuery("#ajxp_bm_link_menu").slideUp();
	var href = currentLink.attr("href") || currentLink.attr('src');
	var params = [
		'gui=light',
		'dl_later='+encodeURIComponent(realHref(href)),
		'tmp_repository_id='+ajxp_bm_repository_id,
		'folder='+ajxp_bm_folder,
        'dl_now=true'//+(jQuery('#ajxp_dl_now')[0].checked ? "true":"false")
	];
	jQuery('#ajxp_bm_iframe').attr("src", ajxp_bm_target+"?" + params.join("&"));
    jQuery('#ajxp_bm_frame_div').slideDown();
    var firstLoad = true;
    jQuery('#ajxp_bm_iframe')[0].onload = function(){
        if(firstLoad){
            firstLoad = false;
        }else{
            jQuery('#ajxp_bm_frame_div').slideUp();
        }
    };

    /*
	window.setTimeout(function(){
		jQuery('#ajxp_bm_frame_div').slideUp();
	}, 10000);
	*/
}
function triggerOriginalDL(){
	jQuery("#ajxp_bm_link_menu").slideUp();
	var href = currentLink.attr("href");
	if(currentLink.attr("src")){
		href = currentLink.parents('a').first().attr("href");
	}
	document.location.href = href;	
}
function realHref(href){
	var path = jQuery("<div style=\"background-image:url('"+href+"');\"></div>").css("background-image");
	if (path.indexOf("url(" == 0)) { path = path.substring(4); }
	if (path.lastIndexOf(")") === path.length-1) { path = path.substring(0, path.length - 1); }
	if (path.indexOf("\"") === 0) { path = path.substring(1, path.length); }
	if (path.lastIndexOf("\"") === path.length-1) { path = path.substring(0, path.length - 1); }	
	return path;
}
if(!window.jQuery){
	var element=document.createElement('scr'+'ipt');
	element.setAttribute('src','https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js?t='+(new Date().getTime()));
	if(document.all){
		element.onreadystatechange = function(){
			if(element.readyState == 'loaded'){
				jQuery.noConflict();
				parseLinks();
			}
		};
	}else{
		element.onload = function(){
			jQuery.noConflict();
			parseLinks();
		};
	}
	document.body.appendChild(element);
}else{
	parseLinks();
}