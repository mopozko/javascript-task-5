'use strict';

function sortByName(person1, person2) {
    return person1.name.localeCompare(person2.name);
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function asOneEnumerable(sequence1, sequence2) {
    return sequence1.concat(sequence2);
}

function getNextLevelFriends(friends, friendsMap) {
    return friends
        .map(x => x.friends)
        .reduce(asOneEnumerable)
        .filter(onlyUnique)
        .map(friendName => friendsMap.get(friendName))
        .sort(sortByName);
}

function getInvitedFriends(friends, filter, maxLevel = Infinity) {
    const invitedFriends = [];
    const friendsMap = new Map();
    friends.forEach(friend => friendsMap.set(friend.name, friend));
    let queue = friends
        .filter(friend => friend.best)
        .sort(sortByName);
    const visited = new Set(queue);
    let level = 0;
    while (queue.length !== 0 && level !== maxLevel) {
        invitedFriends.push(...queue.filter(filter.filterFunction));
        queue = getNextLevelFriends(queue, friendsMap)
            .filter(friend => !visited.has(friend));
        queue.forEach(friend => visited.add(friend));
        level++;
    }

    return invitedFriends;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('filter should be instance of "Filter"');
    }

    if (this.invitedFriends === undefined) {
        this.invitedFriends = getInvitedFriends(friends, filter);
    }
    this.done = () => this.invitedFriends.length === 0;
    this.next = () => this.invitedFriends.shift();
}

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    this.invitedFriends = getInvitedFriends(friends, filter, maxLevel);
    Iterator.call(this, friends, filter);
}
Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filterFunction = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filterFunction = person => person.gender === 'male';
}

Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);


/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filterFunction = person => person.gender === 'female';
}
Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);


exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
