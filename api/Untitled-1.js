const A = [1, 4, 3, 2]
const B = [0, 2, 1, 2]
console.log(A.filter(n => B.includes(n)).length)