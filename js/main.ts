/// <reference path="../typings/tsd.d.ts" />
/// <reference path="timeline.ts" />
/// <reference path="options.ts" />
/// <reference path="event.ts" />
/// <reference path="line.ts" />

"use strict";

interface JQuery {
	timeline(method: string, data: Object): JQuery
	timeline(options?: JQueryTimeline.Options): JQuery
}

interface JQueryStatic {
	timeline(options: JQueryTimeline.Options): JQueryTimeline.Timeline
}

(($: JQueryStatic) => {
	JQueryTimeline.$ = $;

	$.fn.timeline = function timeline(method, data): JQuery {
		var timeline = this.data("timeline");
		if (typeof method === "string") {
			if (!(timeline instanceof JQueryTimeline.Timeline)) {
				timeline = new JQueryTimeline.Timeline({ container: this });
			}
			if (typeof timeline[method] === "function") {
				timeline[method](data);
			}
			return this;
		}
		var options: JQueryTimeline.Options = method || {};
		if (!(timeline instanceof JQueryTimeline.Timeline)) {
			options.container = this;
			timeline = new JQueryTimeline.Timeline(options);
		}
		return timeline.$;
	};

	$.timeline = function timeline(options: JQueryTimeline.Options = {}): JQueryTimeline.Timeline {
		var timeline: JQueryTimeline.Timeline = null;
		try {
			timeline = new JQueryTimeline.Timeline(options);
		} catch (e) {
			if (e instanceof JQueryTimeline.Timeline) {
				timeline = e;
			}
		}
		return timeline;
	};
})(jQuery);
