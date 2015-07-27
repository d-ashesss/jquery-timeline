"use strict";

module JQueryTimeline {
	export class Event {
		static defaultColor = "gray";

		$: JQuery;
		private $marker: JQuery;
		private $label: JQuery;

		private startDate: EventDate;
		private endDate: EventDate;

		private year: number;
		private length: number;
		private name: string;
		private description: string;

		private children: Array<Event> = [];

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

			this.startDate = new EventDate(options.start);
			if (options.length) {
				this.endDate = new EventDate(options.start, options.length);
			} else if (options.end) {
				this.endDate = new EventDate(options.end);
			}

			if (this.isSingle()) {
				this.$.addClass("single");
			} else {
				this.$.addClass("range");
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
			return this.startDate.getYear();
		}

		getEndYear(): number {
			if (!this.endDate) {
				return this.getStartYear();
			}
			return this.endDate.getYear();
		}

		getLength(): number {
			return this.getEndYear() - this.getStartYear();
		}

		render(options: RenderOptions) {
			var offset = (this.getStartYear() - options.min_year) * options.year_width;
			this.$.css("left", offset);
			var width = this.getLength() * options.year_width;
			if (width > 0) {
				this.$marker.width(width);
			}
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
			$("<div>", { "class": "title" })
				.append(this.tooltipTitle())
				.appendTo($tooltip);
			if (this.description.length > 0) {
				$("<div>", { "class": "content" })
					.html(this.description)
					.appendTo($tooltip);
			}
			return $tooltip.html();
		}

		tooltipTitle() {
			var $title = $("<div>");
			if (this.isSingle()) {
				var start = Timeline.formatYear(this.getStartYear());
				$("<strong>").text(start + ": ").appendTo($title);
			} else {
				var range = Timeline.formatRange(this.getStartYear(), this.getEndYear());
				$("<strong>").text(range + ": ").appendTo($title);
			}
			$title.append(this.name);
			this.children.forEach((event: Event) => {
				$title = $title.after(event.tooltipTitle());
			});
			return $title;
		}

		isSingle(): boolean {
			return this.getLength() === 0;
		}

		isMergable(): boolean {
			return this.isSingle() && this.description.length === 0;
		}

		addChild(event: Event) {
			this.children.push(event);
			var total_events = this.children.length + 1;
			this.$label.text("(" + total_events + " events)");
		}
	}
}
