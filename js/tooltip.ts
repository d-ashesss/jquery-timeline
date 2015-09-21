"use strict";

module JQueryTimeline {
	export class Tooltip {
		static $: JQuery;

		public static init() {
			Tooltip.$ = $("<div>", {
				"class": "jquery-timeline-tooltip"
			}).appendTo("body");
			$("body").click((e) => {
				if ($(e.target).is(".event")
					|| $(e.target).is(".jquery-timeline-tooltip")
					|| $(e.target).parents(".event, .jquery-timeline-tooltip").length > 0) {
					return;
				}
				Tooltip.hide(true);
			});
			return Tooltip.$;
		}

		public static show(options: TooltipOptions): JQuery {
			var $tooltip = Tooltip.$ || Tooltip.init();
			if (!$tooltip.is(".fixed") || options.fixed) {
				if (typeof options.content !== "undefined") {
					$tooltip.html(options.content);
				}
				if (typeof options.x !== "undefined") {
					var width = $tooltip.width();
					$tooltip.css("left", options.x - (width / 2));
				}
				if (typeof options.y !== "undefined") {
					$tooltip.css("top", options.y + 15);
				}
				if (options.fixed) {
					$tooltip.addClass("fixed");
				}
			}
			return $tooltip.show();
		}

		public static hide(force = false) {
			if (Tooltip.$.is(".fixed") && !force) {
				return;
			}
			return Tooltip.$.removeClass("fixed").hide();
		}
	}
}
