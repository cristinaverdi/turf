const write = require('write-json-file');
const load = require('load-json-file');
const fs = require('fs');
const path = require('path');
const test = require('tape');
const distance = require('./');

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

test('distance', t => {
    for (const {name, geojson}  of fixtures) {
        const pt1 = geojson.features[0];
        const pt2 = geojson.features[1];
        const miles = distance(pt1, pt2, 'miles');
        const nauticalmiles = distance(pt1, pt2, 'nauticalmiles');
        const kilometers = distance(pt1, pt2, 'kilometers');
        const radians = distance(pt1, pt2, 'radians');
        const degrees = distance(pt1, pt2, 'degrees');

        const result = {
            "miles": miles,
            "nauticalmiles": nauticalmiles,
            "kilometers": kilometers,
            "radians": radians,
            "degrees": degrees
        };

        if (process.env.REGEN) {
            write.sync(directories.out + name + '.json', result);
        }
        t.deepEqual(result, load.sync(directories.out + name + '.json'), name + ' distance');

        t.throws(() => {
            distance(pt1, pt2, 'blah');
        }, 'unknown option given to units');
    }
    t.end();
});
