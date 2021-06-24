// Inputs
const width = parseInt(readline());
const height = parseInt(readline());
const map = [];
for (let i = 0; i < height; i++) map.push(readline().split(' ').map(e => parseInt(e)))

// for map view
console.warn(map.reduce((view, row) => { row.forEach(e => view += e); view += "\n"; return view; }, ""));

// very heavy offset
const offset = 
[
    // top
    {
        search: 1,
        pos: {x : -1, y: -1}
    },
    {
        search: 1,
        pos: {x : 0, y: -1}
    },
    {
        search: 1,
        pos: {x : 0, y: -1}
    },

    // center
    {
        search: 1,
        pos: {x : -1, y: 0}
    },
    {
        search: 0,
        pos: {x : 0, y: 0}
    },
    {
        search: 1,
        pos: {x : 1, y: 0}
    },

    // bottom
    {
        search: 1,
        pos: {x : -1, y: +1}
    },
    {
        search: 1,
        pos: {x : 0, y: +1}
    },
    {
        search: 1,
        pos: {x : 1, y: +1}
    }
];

// can be simplified by something like this
// the modularity issue is where is the offset base (with this method it's (width/2,height/2))
// that mean we can't tell where is the offset base inside the offset (because the data is )  
const alternative_offset = [
    [1, 1, 1, 0, 1], // we can maybe do some kind of shapes with by adding numbers
    [1, 0, 1, 1],
    [1, 1, 1, 0, 1, 1]
]

// to make this working 


for(let y = 0; y < height; y++)
{
    const lines = {
        previous : map[y - 1] || [],
        current : map[y],
        next : map[y + 1] || []
    }

    for(let x = 0; x < width; x++)
    {
        // we searching for 0 surounded by 1 so we check all 0 as a center
        if(lines.current[x] === 0)
        {
            // check 8 positions
            // top, bottom, right, left
            // right-top, left-top,
            // right-bottom, left-bottom

            // if all 8 is equals 1 or undefined then it's the treasure  

            let obstacles = 0;

            if(lines.previous[x - 1] === undefined || lines.previous[x - 1] === 1 ) obstacles++;
            if(lines.previous[x] === undefined || lines.previous[x] === 1) obstacles++;
            if(lines.previous[x + 1] === undefined || lines.previous[x + 1] === 1) obstacles++;
            
            if(lines.current[x - 1] === undefined || lines.current[x - 1] === 1) obstacles++;
            if(lines.current[x + 1] === undefined || lines.current[x + 1] === 1) obstacles++;

            if(lines.next[x - 1] === undefined || lines.next[x - 1] === 1) obstacles++;
            if(lines.next[x] === undefined || lines.next[x] === 1) obstacles++;
            if(lines.next[x + 1] === undefined || lines.next[x + 1] === 1) obstacles++;

            if(obstacles === 8)
            {
                // we fonded it !
                console.log(`${x} ${y}`);
            }
        }
    }
}