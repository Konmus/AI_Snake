const QLearn = (nEpisodes, maxSteps, exploreRate, exploreDecay, exploreMin, 
  learnRate, discountRate, eatReward, deathReward, cumulativePolicy=true) => {
  
  const ql = {}
  ql.nEpisodes = nEpisodes
  ql.maxSteps = maxSteps
  ql.exploreRate = exploreRate
  ql.exploreDecay = exploreDecay
  ql.exploreMin = exploreMin
  ql.learnRate = learnRate
  ql.discountRate = discountRate
  ql.eatReward = eatReward
  ql.deathReward = deathReward
  ql.cumulativePolicy = cumulativePolicy

  ql.actionMap = new Map()
  game.DIRECTIONS.forEach((d, i) => { ql.actionMap.set(i, d) })
  game.DIRECTIONS.forEach((d, i) => { ql.actionMap.set(d, i) })

  ql.policy = null

  ql.reset = () => ql.policy = null

  ql.initPolicy = (nx, ny) => {
    const mkQs = () => Array(game.DIRECTIONS.length).fill(0)
    return Array.from(Array(nx), _ => Array.from(Array(ny), _ => mkQs()))
  },

  ql.getAction = nd => ql.actionMap.get(ql.getActionIndex(nd)),
  ql.getActionIndex = nd =>  ql.getQs(nd).reduce((acc, v, i, arr) => i>0 ? (v>arr[acc] ? i : acc) : i, 0),
  ql.getRandomActionIndex = () => utils.randInt(0, game.DIRECTIONS.length-1),
  ql.getQs = nd => ql.policy[nd.x][nd.y],
  ql.getQ = (i, nd) => ql.getQs(nd)[i],
  ql.setQ = (i, q, nd) => ql.policy[nd.x][nd.y][i] = q
  ql.allQEq = nd => ql.getQs(nd).every((q, i, arr) => i>0 ? q==arr[i-1] : true),
  ql.maxQ = nd => ql.getQs(nd).reduce((acc, v) => acc>v ? acc : v),
  ql.update = (next, state) => {
    let exploreRate = ql.exploreRate
    if (ql.policy==null || state.justEaten || !ql.cumulativePolicy) ql.policy = ql.initPolicy(state.nx, state.ny)
    for(let ep=0; ep<ql.nEpisodes; ep++) {
      let s = state;
      for(let step=0; step<maxSteps; step++) {
        const head = s.snake[0]
        const ai = ql.isExplore(head, exploreRate) ? ql.getRandomActionIndex() : ql.getActionIndex(head)
        const ns = next(s, {direction: ql.actionMap.get(ai)})
        const r = !ns.isAlive ? ql.deathReward : (ns.justEaten ? ql.eatReward : 0)
        const nQ = ql.calcQ(ql.getQ(ai, head), r, ql.maxQ(ns.snake[0]))
        ql.setQ(ai, nQ, head)
        if(!ns.isAlive || ns.justEaten) break
        else s = ns
      }
      exploreRate = Math.max(ql.exploreMin, exploreRate - ql.exploreDecay)
    }
  }
 ql.calcQ = (q, r, nQ) => q + ql.learnRate * (r + ql.discountRate * nQ - q)
 ql.isExplore = (nd, exploreRate) => (Math.random() < exploreRate) || ql.allQEq(nd)

  return ql
}