const cheerio = require('cheerio');
const fs = require('fs');
//wget cs.ubbcluj.ro to fetch the file.
const $ = cheerio.load(fs.readFileSync('index.html')); //info

const population = 30;
let generations = 400;

// const population = 200;
// let generations = 400;

//use the title of the first announcement as the needle
const needle = 'Orar semestrul I, anul universitar 2017-2018'
// const htmlElements = ['DOCTYPE', 'a', 'abbr', 'acronym', 'address', 'applet', 'embed', 'object', 'area', 'article', 'aside', 'audio', 'b', 'base', 'basefont', 'bdi', 'bdo', 'big', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'dir', 'ul', 'div', 'dl', 'dt', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'frame', 'frameset', 'h1', 'h6', 'head', 'header', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'noframes', 'noscript', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'video', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'tt', 'u', 'var', 'wbr'];
const htmlElements = ['html', 'html', 'html', 'body', 'div', 'h2', 'a'];

// console.log($('body div div h2 a').html());
// console.log($('div div > a').html());
// console.log($('div div div div div h2 a').html());
// return;
const fitness = (selector) => {
    const content = $(selector.join(' ')).html();

    if (! content || !content.includes(needle)) {
        return 0;
    }

    const rawFitneess = needle.length / content.length;

    //the longer the selector the better
    return rawFitneess + rawFitneess * selector.length / 100;
}

const mutate = (selector) => {
    const randomElementsIndex = Math.floor((Math.random() * htmlElements.length));
    const randomSelectorIndex = Math.floor((Math.random() * selector.length + 1));

    selector.splice(randomSelectorIndex, 0, htmlElements[randomElementsIndex]);

    return selector;
}

const seedPopulation = (population) => {
    const selectors = [];

    while (population > 0) {
        const randomElementsIndex = Math.floor((Math.random() * htmlElements.length));

        const selector = [htmlElements[randomElementsIndex]];

        selectors.push({
            selector,
            fitness: fitness(selector),
        });

        population--;
    }

    return selectors;
}

let selectors = seedPopulation(population);

// selectors.forEach(selector => console.log(selector, fitness(selector)))

// const arr = ['div']
// const mutation = mutate(arr)
// console.log(mutation)

while (generations > 0) {
    selectors = selectors.sort((a, b) => b.fitness - a.fitness);
    // console.log(selectors)

    const newSelectors = [];

    const bestHalfSelectors = selectors.splice(0, population / 2);

    bestHalfSelectors.forEach(selector => {
        const selector1 = mutate(selector.selector.slice(0));
        const selector2 = selector.selector.slice(0);
        // const selector2 = mutate(selector.selector.slice(0));

        newSelectors.push(...[
            {
                selector: selector1,
                fitness: fitness(selector1),
            },
            {
                selector: selector2,
                fitness: fitness(selector2),
            },
        ])
    })

    selectors = newSelectors;
    generations--;
}
selectors = selectors.sort((a, b) => b.fitness - a.fitness);

console.log(selectors)
// console.log(selectors[0].selector)
const content = $(selectors[0].selector.join(' ')).html();
console.log(content.length);
