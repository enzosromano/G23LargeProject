const sum = require('./sum');


test('1 + 2 == 3', () => {
  expect(sum(1, 2)).toBe(3);
});


test('1 + 2 != 0', () => {
  expect(sum(1, 2)).not.toBe(0);
});