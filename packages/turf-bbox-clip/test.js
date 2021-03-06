const test = require('tape');
const fs = require('fs');
const path = require('path');
const load = require('load-json-file');
const write = require('write-json-file');
const turfBBox = require('@turf/bbox');
const featureCollection = require('@turf/helpers').featureCollection;
const point = require('@turf/helpers').point;
const bboxClip = require('./');

const directories = {
    in: path.join(__dirname, 'test', 'in') + path.sep,
    out: path.join(__dirname, 'test', 'out') + path.sep
};

const fixtures = fs.readdirSync(directories.in).map(filename => {
    return {
        filename,
        name: path.parse(filename).name,
        geojson: load.sync(directories.in + filename)
    };
});

test('turf-bbox-clip', t => {
    for (const {filename, name, geojson}  of fixtures) {
        const feature = geojson.features[0];
        const bbox = turfBBox(geojson.features[1]);
        const clipped = bboxClip(feature, bbox);
        const results = featureCollection([colorize(feature, '#080'), colorize(clipped, '#F00'), colorize(geojson.features[1], '#00F', 3)]);

        if (process.env.REGEN) write.sync(directories.out + filename, results);
        t.deepEquals(results, load.sync(directories.out + filename), name);
    }
    t.end();
});

test('turf-bbox-clip errors', t => {
    t.throws(() => bboxClip(point([5, 10]), [-180, -90, 180, 90]));
    t.end();
});

function colorize(feature, color = '#F00', width = 6) {
    feature.properties = {
        stroke: color,
        fill: color,
        'stroke-width': width,
        'fill-opacity': 0.1
    };
    return feature;
}
