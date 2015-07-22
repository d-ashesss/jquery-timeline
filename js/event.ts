"use strict";

module JQueryTimeline {
	export class Event {
		static defaultColor = "gray";

		$: JQuery;
		private $marker: JQuery;
		private $label: JQuery;

		private year: number;
		private length: number;
		private name: string;
		private description: string;

		constructor(options: EventOptions) {
			this.$ = $("<div>", {
				"class": "event",
				"data": { "event": this },
			});
			this.$marker = $("<div>", {
				"class": "marker",
				"css": {
					"background-color": options.color || Event.defaultColor,
				},
			}).appendTo(this.$);
			this.$label = $("<div>", {
				"class": "label",
				text: options.label,
			}).appendTo(this.$);

			this.year = options.start;
			if (options.length) {
				options.end = options.start + options.length;
			}
			if (typeof options.end !== "undefined") {
				this.length = options.end - options.start;
				this.$.addClass("range");
			} else {
				this.$.addClass("single");
			}
			this.name = (options.name || options.label) || "";
			this.description = options.description || "";

			this.$.hover((event: JQueryMouseEventObject) => {
				this.showTooltip(event);
			}, () => {
				this.hideTooltip();
			}).mousemove((event: JQueryMouseEventObject) => {
				this.showTooltip(event);
			});
			this.$.click((event: JQueryMouseEventObject) => {
				this.showTooltip(event, true);
			});
		}

		getStartYear(): number {
			return this.year;
		}

		getEndYear(): number {
			return this.year + (this.length || 0);
		}

		render(options: RenderOptions) {
			this.$.css("left", (this.year - options.min_year) * options.year_width);
			this.$marker.width(this.length * options.year_width);
		}

		hideTooltip() {
			Timeline.tooltip({ hide: true });
		}

		showTooltip(event: JQueryMouseEventObject, fixed = false) {
			Timeline.tooltip({
				content: this.tooltipContent(),
				x: event.clientX,
				y: event.clientY + this.$.height() - event["layerY"],
				fixed: fixed
			});
		}

		tooltipContent(): string {
			var $tooltip = $("<div>");
			var $title = $("<div>", { "class": "title" }).appendTo($tooltip);
			if (this.length > 0) {
				var range = Timeline.formatRange(this.getStartYear(), this.getEndYear());
				$("<strong>").text(range + ": ").appendTo($title);
			} else {
				var start = Timeline.formatYear(this.getStartYear());
				$("<strong>").text(start + ": ").appendTo($title);
			}
			$title.append(this.name);
			if (this.description.length > 0) {
				$("<div>", { "class": "content" }).html(this.description).appendTo($tooltip);
			}
			return $tooltip.html();
		}
	}
}
