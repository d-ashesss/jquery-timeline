
declare module JQueryTimeline {
    var $: JQueryStatic;
    class Timeline {
        static zoomBase: number;
        static yearScale: number;
        static defaultOptions: Options;
        static $tooltip: JQuery;
        static tooltip(options: TooltipOptions): JQuery;
        static roundYear(year: number, step?: number, ceil?: boolean): number;
        $: JQuery;
        private $background;
        private $content;
        private lines;
        private zoom;
        private yearScale;
        private minorSections;
        constructor(options: Options);
        private initScroll();
        addLine(line_options?: LineOptions): Line;
        private _addLine(line_options?);
        addEvent(event_options: EventOptions, line_index?: number): Event;
        render(): void;
        private getRenderOptions();
        private renderBackground(options);
        private renderLines(options);
        private scroll(delta);
    }
}
declare module JQueryTimeline {
    interface Options {
        container?: JQuery;
        zoom?: number;
        scale?: number;
        minorSections?: number;
        lines?: Array<LineOptions>;
        events?: Array<EventOptions>;
    }
    interface LineOptions {
        color?: string;
        events?: Array<EventOptions>;
    }
    interface EventOptions {
        label: string;
        start: string;
        end?: string;
        length?: number;
        color?: string;
        name?: string;
        description?: string;
    }
    interface RenderOptions {
        years: Array<number>;
        year_width: number;
        major_step: number;
        minor_step: number;
        min_year: number;
        max_year: number;
    }
    interface TooltipOptions {
        content?: string;
        x?: number;
        y?: number;
        fixed?: boolean;
        hide?: boolean;
    }
}
declare module JQueryTimeline {
    class Event {
        static defaultColor: string;
        $: JQuery;
        private $marker;
        private $label;
        private startDate;
        private endDate;
        private name;
        private description;
        private children;
        constructor(options: EventOptions);
        getStartYear(): number;
        getEndYear(): number;
        getLength(): number;
        render(options: RenderOptions): void;
        initTooltip(): void;
        hideTooltip(): void;
        showTooltip(event: JQueryMouseEventObject, fixed?: boolean): void;
        tooltipContent(): string;
        tooltipTitle(): JQuery;
        renderTooltipTitle(): JQuery;
        isSingle(): boolean;
        isMergable(): boolean;
        addChild(event: Event): void;
        getDateIndex(): number;
    }
}
declare module JQueryTimeline {
    class EventDate {
        static monthNames: string[];
        static simplifyYear(year: number): string;
        static formatRange(start: EventDate, end: EventDate): string;
        static join(arr: Array<any>): string;
        private date;
        private month;
        private year;
        constructor(date: number, length?: number);
        constructor(date: string, length?: number);
        getDateIndex(): number;
        getDate(): number;
        getMonth(): number;
        getMonthName(): string;
        getYear(): number;
        getEpoch(): string;
        formatMonth(): string;
        formatYear(): string;
        formatEpoch(): string;
        formatYearEpoch(): string;
        render(end?: EventDate): string;
    }
}
declare module JQueryTimeline {
    class Line {
        $: JQuery;
        private color;
        private events;
        private mergedEvents;
        constructor(options?: LineOptions);
        addEvent(event_options: EventOptions): Event;
        getYears(): Array<number>;
        render(options: RenderOptions): void;
    }
}
interface JQuery {
    timeline(method: string, data: Object): JQuery;
    timeline(options?: JQueryTimeline.Options): JQuery;
}
interface JQueryStatic {
    timeline(options: JQueryTimeline.Options): JQueryTimeline.Timeline;
}
