const utils = {

   randInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  
   range:n => Array(n).fill().map((_, i) => i),
  
   shuffledRange:n => {
      const r = utils.range(n)
      utils.shuffle(r)
      return r
    },
  
   shuffle: arr => {
      let j, x;
      for (let i = arr.length - 1; i > 0; i--) {
        j = utils.randInt(0, i)
        x = arr[i]
        arr[i] = arr[j]
        arr[j] = x
      }
    }
  }