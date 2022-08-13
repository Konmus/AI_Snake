const Node = (x, y) => {
  const node = {};
  node.x = x;
  node.y = y;

  node.inBounds = (nx, ny) =>
    node.x >= 0 && node.x < nx && node.y >= 0 && node.y < ny;

  node.eq = (n) => node.x == n.x && node.y == n.y;

  node.sum = (n) => Node(node.x + n.x, node.y + n.y);

  node.sub = (n) => Node(node.x - n.x, node.y - n.y);

  return node;
};

const NodeMap = () => {
  const nm = {};
  nm.lookup = new Map();
  nm.encXY = (x, y) => `${x},${y}`;
  nm.set = (node, value) => nm.lookup.set(nm.encXY(node.x, node.y), value);
  nm.get = (node) => nm.lookup.get(nm.encXY(node.x, node.y));
  nm.size = () => nm.lookup.size;

  return nm;
};

const NodeSet = () => {
  const ns = {};
  ns.lookup = new Map();

  ns.encXY = (x, y) => `${x},${y}`;

  ns.add = (x, y) => ns.lookup.set(ns.encXY(x, y), Node(x, y));

  ns.addNode = (node) => ns.lookup.set(ns.encXY(node.x, node.y), node);

  ns.delete = (x, y) => ns.lookup.delete(ns.encXY(x, y));

  ns.deleteNode = (node) => ns.lookup.delete(ns.encXY(node.x, node.y));

  ns.has = (x, y) => ns.lookup.has(ns.encXY(x, y));

  ns.hasNode = (node) => ns.lookup.has(ns.encXY(node.x, node.y));

  ns.get = (x, y) => ns.lookup.get(ns.encXY(x, y));

  ns.size = () => ns.lookup.size;

  ns.copy = () => {
    const nsCopy = NodeSet();
    nsCopy.lookup = new Map(ns.lookup);
    return nsCopy;
  };

  return ns;
};

const game = {
  NORTH: Node(0, -1),
  SOUTH: Node(0, 1),
  EAST: Node(1, 0),
  WEST: Node(-1, 0),

  next:
    (nx, ny, walls) =>
    (state = null, update = null) => {
      if (state == null) {
        const yStart = Math.floor(ny / 2);
        const snake = [Node(1, yStart), Node(0, yStart)];
        return {
          isAlive: true,
          justEaten: true,
          snake: snake,
          direction: game.EAST,
          apple: game.nextApple(nx, ny, snake, walls),
          walls: walls,
          nx: nx,
          ny: ny,
        };
      } else {
        const isValidDir = game.isValidDir(
          state.snake,
          update ? update.direction : null
        );
        const direction = isValidDir ? update.direction : state.direction;
        const head = game.nextHead(state.snake, direction);
        const willEat = game.willEat(head, state.apple);
        const willLive = game.willLive(
          state.nx,
          state.ny,
          head,
          state.snake,
          state.walls
        );
        const snake = willLive
          ? game.nextSnake(state.snake, head, willEat)
          : state.snake;
        return {
          isAlive: willLive,
          justEaten: willEat,
          snake: snake,
          direction: direction,
          apple: willEat
            ? game.nextApple(state.nx, state.ny, snake, state.walls)
            : state.apple,
          walls: state.walls,
          nx: state.nx,
          ny: state.ny,
        };
      }
    },

  isValidDir: (snake, dir) =>
    dir == null ? false : !game.nextHead(snake, dir).eq(snake[1]),

  willEat: (head, apple) => head.eq(apple),

  willLive: (nx, ny, head, snake, walls) => {
    return (
      head.inBounds(nx, ny) &&
      !snake.some((node) => node.eq(head)) &&
      !walls.has(head.x, head.y)
    );
  },

  nextHead: (snake, dir) => snake[0].sum(dir),

  nextSnake: (snake, head, grow) =>
    [head].concat(grow ? snake : snake.slice(0, -1)),

  nextApple: (nx, ny, snake, walls) => {
    if (snake.length + walls.size() >= nx * ny) return null;
    let apple = null;
    while (
      apple == null ||
      snake.some((node) => node.eq(apple)) ||
      walls.has(apple.x, apple.y)
    ) {
      apple = Node(utils.randInt(0, nx - 1), utils.randInt(0, ny - 1));
    }
    return apple;
  },
};

game.DIRECTIONS = [game.NORTH, game.SOUTH, game.EAST, game.WEST];

game.DIR_SYMBOLS = NodeMap();
game.DIR_SYMBOLS.set(game.NORTH, "^");
game.DIR_SYMBOLS.set(game.SOUTH, "v");
game.DIR_SYMBOLS.set(game.EAST, ">");
game.DIR_SYMBOLS.set(game.WEST, "<");

game.DIR_OPPOSITES = NodeMap();
game.DIR_OPPOSITES.set(game.NORTH, game.SOUTH);
game.DIR_OPPOSITES.set(game.SOUTH, game.NORTH);
game.DIR_OPPOSITES.set(game.EAST, game.WEST);
game.DIR_OPPOSITES.set(game.WEST, game.EAST);
