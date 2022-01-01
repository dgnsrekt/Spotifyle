export function shuffleArray(array) {
    let currentId = array.length;
    while (0 !== currentId) {
        let randomId = Math.floor(Math.random() * currentId);
        currentId -= 1;
        let tmp = array[currentId];
        array[currentId] = array[randomId];
        array[randomId] = tmp;
    }
    return array;
}


export function* cycle(iterable) {
    let saved = []
    for (let item of iterable) {
        yield item
        saved.push(item)
    }

    while (saved) {
        for (let item of saved) {
            yield item
        }
    }
}