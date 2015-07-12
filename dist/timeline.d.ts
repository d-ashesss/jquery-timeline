declare module JQueryTimeline {
    var $: JQueryStatic;
    class Timeline {
        static yearAtom: number;
        static defaultOptions: Options;
        $: JQuery;
        private $background;
        private $content;
        private lines;
        private events;
        private zoom;
        constructor(options: Options);
        addLine(line: LineOptions): JQuery;
        addEvent(event: EventOptions, $line: number): JQuery;
        addEvent(event: EventOptions, $line: JQuery): JQuery;
        yearWidth(year: number): number;
        private buildBackground();
        private alignEvents(min_year);
    }
}
declare module JQueryTimeline {
    interface Options {
        container?: JQuery;
        zoom?: number;
        lines: Array<LineOptions>;
    }
    interface LineOptions {
        color: string;
        events: Array<EventOptions>;
    }
    interface EventOptions {
        label: string;
        start: number;
        end?: number;
        length?: number;
        color?: string;
    }
}
interface JQuery {
    timeline(options: JQueryTimeline.Options): JQuery;
}
interface JQueryStatic {
    timeline(options: JQueryTimeline.Options): JQueryTimeline.Timeline;
}
