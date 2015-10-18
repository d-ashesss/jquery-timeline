"use strict";

module JQueryTimeline {
	export class Event {
		static defaultColor = "gray";

		$: JQuery;
		private $marker: JQuery;
		private $label: JQuery;

		private startDate: EventDate;
		private endDate: EventDate;

		private name: string;
		private description: string;
		private tooltip: string;

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
			if (options.color === "transparent") {
				this.$marker.addClass("border");
			}
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

			this.initTooltip();
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

		initTooltip() {
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

		hideTooltip() {
			Tooltip.hide();
		}

		showTooltip(event: JQueryMouseEventObject, fixed = false) {
			if (!this.tooltip) {
				this.tooltip = this.tooltipContent();
			}
			Tooltip.show({
				content: this.tooltip,
				x: event.clientX,
				y: event.clientY,
				fixed: fixed
			});
		}

		tooltipContent(): string {
			var $tooltip = $("<div>")
				.append(this.tooltipTitle());
			if (this.description.length > 0) {
				$("<div>", { "class": "content" })
					.html(this.description)
					.appendTo($tooltip);
			}
			return $tooltip.html();
		}

		tooltipTitle(): JQuery {
			var titles = [this].concat(this.children).reduce<JQuery[]>(function(titles: JQuery[], event: Event) {
				var $title = event.renderTooltipTitle();
				var index = event.getDateIndex();
				if (typeof titles[index] === "undefined") {
					titles[index] = $("<div>");
				}
				titles[index].append($title);
				return titles;
			}, []);
			return titles.reduce(function($title, $title_group, i) {
				return $title.append($title_group);
			}, $("<div>", { "class": "title" }));
		}

		renderTooltipTitle(): JQuery {
			var $title = $("<div>");
			var date = this.startDate.render(this.endDate);
			$("<strong>").text(date + ": ").appendTo($title);
			$title.append(this.name);
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

		getDateIndex(): number {
			return this.startDate.getDateIndex();
		}
	}
}
