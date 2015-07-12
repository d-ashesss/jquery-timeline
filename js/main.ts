/// <reference path="../typings/tsd.d.ts" />
/// <reference path="timeline.ts" />
/// <reference path="options.ts" />

"use strict";

interface JQuery {
	timeline(options: JQueryTimeline.Options): JQuery
}

interface JQueryStatic {
	timeline(options: JQueryTimeline.Options): JQueryTimeline.Timeline
}

(($: JQueryStatic) => {
	JQueryTimeline.$ = $;

	$.fn.timeline = function timeline(options: JQueryTimeline.Options): JQuery {
		var timeline = this.data("timeline");
		if (!timeline) {
			options.container = this;
			timeline = new JQueryTimeline.Timeline(options);
		}
		return timeline.$;
	};

	$.timeline = function timeline(options: JQueryTimeline.Options): JQueryTimeline.Timeline {
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
