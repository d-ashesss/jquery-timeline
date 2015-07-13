"use strict";

module JQueryTimeline {
	export class Event {
		static defaultColor = "gray";

		$: JQuery;
		private $marker: JQuery;
		private $label: JQuery;

		private year: number;
		private length: number;

		constructor(options: EventOptions) {
			this.$ = $("<div>", {
				"class": "event",
				"data": { "event": this }
			});
			this.$marker = $("<div>", {
				"class": "marker",
				"css": {
					"background-color": options.color || Event.defaultColor
				}
			}).appendTo(this.$);
			this.$label = $("<div>", {
				"class": "label",
				text: options.label
			}).appendTo(this.$);

			this.year = options.start;
			if (options.length) {
				options.end = options.start + options.length;
			}
			if (options.end) {
				this.length = options.end - options.start;
				this.$.addClass("range");
			} else {
				this.$.addClass("single");
			}
		}

		getStartYear(): number {
			return this.year;
		}

		getEndYear(): number {
			return this.year + (this.length || 0);
		}

		render(min_year: number, year_length: number) {
			this.$.css("left", (this.year - min_year) * year_length);
			this.$marker.width(this.length * year_length);
		}
	}
}
