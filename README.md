# History Timeline jQuery Plugin

## Install
**npm**
```bash
npm install jquery-timeline
```

**bower**
```bash
bower install jquery-timeline
```

## Usage
### Initialization
Create a div container
```html
<div id="timeline"><div>
```

Initialize the Timeline
```js
$("#timeline").timeline({
	// options
}); // Returns a jQuery object
```
OR
```js
$.timeline({
	container: $("#timeline")
	// more options
}); // Returns Timeline object
```
OR even
```js
new JQueryTimeline.Timeline({
	container: $("#timeline")
	// more options
}); // Returns Timeline object
```

### Manipulation
You can either do it through jQuery selector
```js
$("#timeline").timeline("addLine", {color: "indigo"});
```

or by calling methods of Timeline object
```js
timeline.addLine({color: "indigo"});
```

## Reference
### Options
- `container: JQuery` [optional]
- `zoom: number` [optional] — zoom level, default: 100
- `scale: number` [optional] — horizontal chart scale, default: 1
- `minorSections: number` [optional] — number of minor sections, default: 5
- `lines: Array<LineOptions>` [optional]
- `events: Array<EventOptions>` [optional]

#### Zoom
Zoom is a floating point number in range 0 < **zoom** <= (1000 / **minorSections**). It defines a size of guide line major section in years.

For example, for zoom=100, will result in 1000 / 100 = 10 years in each major section. *(Here 1000 is a zoom base constant)*

### LineOptions
**Line** is a group of events
- `color: string` [optional] — any CSS compatible color value like `red` or `#FF0000`
- `events: Array<EventOptions>` [optional]

### EventOptions
**Event** is a history event, which could be either a *single* event or a date *range*
- `label: string` — event short label (shown on timeline)
- `start: string` — a date when an event had happened or started, allowed formats: YYYY, MM-YYYY, DD-MM-YYYY, BC dates should be prefixed with "-", e.g "-372", or "-01-07-372"
- `length: number` [optional] — event length in years
- `end: string` [optional] — a date when an event ended, allowed formats: YYYY, MM-YYYY, DD-MM-YYYY
- `color: string` [optional] — any CSS compatible color value like `red` or `#FF0000`, overwrites color defined in line options, default: `gray`
- `name: string` [optional] — event full name (shown in the tooltip)
- `description: string` [optional] — event detailed description (shown in the tooltip)

Only one of **length** or **end** options required. If both provided **length** has higher priority.

#### Event Types
*single* event is an event which had happened on a single date or ended withing the same year.

### Timeline
- `addLine(LineOptions)`: JQuery
- `addEvent(EventOptions)`: JQuery — adds event to the last line
- `addEvent(EventOptions, line: number)`: JQuery — adds event to the line with index `line`

## License
Released under the [MIT license](http://www.opensource.org/licenses/MIT).